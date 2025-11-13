require('dotenv').config();
const { Clerk } = require('@clerk/clerk-sdk-node');
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Assuming this correctly imports your PostgreSQL pool
const { Resend } = require('resend');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Clerk with your secret key (optional if not configured)
let clerk = null;
try {
    if (process.env.CLERK_SECRET_KEY) {
        clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
    } else {
        console.warn('CLERK_SECRET_KEY not set. Clerk features will be disabled.');
    }
} catch (e) {
    console.warn('Failed to initialize Clerk; features will be disabled.', e?.message || e);
    clerk = null;
}
// Initialize Resend (optional if not configured)
let resend = null;
try {
    if (process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    } else {
        console.warn('RESEND_API_KEY not set. Email sending will be disabled.');
    }
} catch (e) {
    console.warn('Failed to initialize Resend; email sending disabled.', e?.message || e);
    resend = null;
}

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to access the req.body

// Routes

// Workspaces
app.get('/api/workspaces', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM workspaces');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/workspaces', async (req, res) => {
    try {
        let { id, name, slug, description, settings, owner_id, image_url, createdAt, updatedAt } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        if (!id) id = uuidv4();
        if (!slug) slug = String(name).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        if (!settings) settings = {};
        // If owner_id is omitted, leave null; DB may allow or you may adapt
        const result = await pool.query(
            'INSERT INTO workspaces (id, name, slug, description, settings, owner_id, image_url, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
            [id, name, slug, description || null, settings, owner_id || null, image_url || '', createdAt || new Date(), updatedAt || new Date()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM workspaces WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, image_url, settings } = req.body;
        const result = await pool.query(
            'UPDATE workspaces SET name = $1, description = $2, image_url = $3, settings = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [name, description, image_url, settings, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.delete('/api/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Optional: Check if the workspace exists before attempting to delete
        const checkWorkspace = await pool.query('SELECT id FROM workspaces WHERE id = $1', [id]);
        if (checkWorkspace.rows.length === 0) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        // Perform the deletion. Due to ON DELETE CASCADE constraints, this should
        // automatically delete associated records in books, team_members, etc.
        const result = await pool.query('DELETE FROM workspaces WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            // This case should ideally not be reached if checkWorkspace passed, but good for safety
            return res.status(404).json({ error: 'Workspace not found after delete attempt' });
        }

        res.status(204).send(); // No content to send back on successful deletion
    } catch (err) {
        console.error("Error deleting workspace:", err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/workspaces/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT wm.*, u.name, u.email, u.image FROM workspace_members wm JOIN users u ON wm.user_id = u.id WHERE wm.workspace_id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Generate Invite Link for Workspace
app.post('/api/workspaces/:id/invite-link', async (req, res) => {
    try {
        const { id: workspaceId } = req.params;
        const { role } = req.body;

        if (!workspaceId) {
            return res.status(400).json({ error: 'Workspace ID is required' });
        }

        if (!clerk?.organizations?.createInvitation) {
            return res.status(501).json({ error: 'Invite link generation not configured (Clerk missing).' });
        }

        // Ensure the role is valid for Clerk (e.g., 'org:admin' or 'org:member')
        const clerkRole = role === 'admin' ? 'org:admin' : 'org:member';

        // Create an invitation using Clerk
        const invitation = await clerk.organizations.createInvitation({
            organizationId: workspaceId,
            role: clerkRole,
            // You can add a redirect URL here if needed, 
            // but Clerk's default will guide the user through the sign-up/in process.
        });

        res.status(200).json({ inviteLink: invitation.publicOrganizationInvitationUrl });

    } catch (err) {
        console.error("Error generating invite link:", err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Books
app.get('/api/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        let { id, workspace_id, name, description, priority, status, type, start_date, end_date, team_lead, progress, createdAt, updatedAt } = req.body;
        if (!id) id = uuidv4();
        const result = await pool.query(
            'INSERT INTO books (id, workspace_id, name, description, priority, status, type, start_date, end_date, team_lead, progress, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [id, workspace_id, name, description, priority, status, type, start_date, end_date, team_lead, progress, createdAt, updatedAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, priority, status, type, start_date, end_date, team_lead, progress, updatedAt } = req.body;
        const result = await pool.query(
            'UPDATE books SET name = $1, description = $2, priority = $3, status = $4, type = $5, start_date = $6, end_date = $7, team_lead = $8, progress = $9, updated_at = $10 WHERE id = $11 RETURNING *',
            [name, description, priority, status, type, start_date, end_date, team_lead, progress, updatedAt, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Book Members
app.get('/api/books/:bookId/members', async (req, res) => {
    try {
        const { bookId } = req.params;
        const result = await pool.query('SELECT bm.*, u.name, u.email, u.image FROM book_members bm JOIN users u ON bm.user_id = u.id WHERE bm.book_id = $1', [bookId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/books/:bookId/members', async (req, res) => {
    try {
        const { bookId } = req.params;
        let { id, userId, createdAt, updatedAt } = req.body;
        if (!id) id = uuidv4();
        const result = await pool.query(
            'INSERT INTO book_members (id, user_id, book_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, userId, bookId, createdAt, updatedAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Publishing Stages
app.get('/api/books/:bookId/publishingStages', async (req, res) => {
    try {
        const { bookId } = req.params;
        const result = await pool.query('SELECT * FROM publishing_stages WHERE author_book_id = $1 ORDER BY "order" ASC', [bookId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/books/:bookId/publishingStages', async (req, res) => {
    try {
        const { bookId } = req.params;
        let { id, name, description, order, createdAt, updatedAt } = req.body;
        if (!id) id = uuidv4();
        const result = await pool.query(
            'INSERT INTO publishing_stages (id, author_book_id, name, description, "order", created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, bookId, name, description, order, createdAt, updatedAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/publishing-stages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, order } = req.body;
        const result = await pool.query(
            'UPDATE publishing_stages SET name = $1, description = $2, "order" = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [name, description, order, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Publishing stage not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// User Preferences
app.post('/api/user-preferences', async (req, res) => {
    try {
        const { user_id, theme_preference, language_preference, notifications } = req.body;
        const result = await pool.query(
            `INSERT INTO user_preferences (user_id, theme_preference, language_preference, notifications)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id)
             DO UPDATE SET theme_preference = EXCLUDED.theme_preference,
                           language_preference = EXCLUDED.language_preference,
                           notifications = EXCLUDED.notifications,
                           updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [user_id, theme_preference, language_preference, notifications]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/user-preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User preferences not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/user-preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { theme_preference, language_preference, notifications } = req.body;
        const result = await pool.query(
            'UPDATE user_preferences SET theme_preference = $1, language_preference = $2, notifications = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4 RETURNING *',
            [theme_preference, language_preference, notifications, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User preferences not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Team Members
app.post('/api/team-members', async (req, res) => {
    try {
        const { email, workspace_id, role } = req.body;

        let invitation = { id: uuidv4(), status: 'pending', acceptRedirectUrl: '#' };
        if (clerk?.organizations?.inviteMember) {
            // 1. Invite user to Clerk organization
            invitation = await clerk.organizations.inviteMember({
                organizationId: workspace_id, // Assuming workspace_id is also the Clerk organization ID
                emailAddress: email,
                role: role === 'admin' ? 'org:admin' : 'org:member', // Map custom roles to Clerk roles
            });
        } else {
            console.warn('Clerk not configured. Skipping real invitation; storing pending member locally.');
        }

        // 2. Store team member in your database
        // The user_id from Clerk will only be available once the user accepts the invitation.
        // For now, we will store the invitation ID and email.
        const result = await pool.query(
            'INSERT INTO team_members (invitation_id, email, workspace_id, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [invitation.id, email, workspace_id, role, 'pending']
        );
        const newTeamMember = result.rows[0];

        // 3. Send invitation email using Resend
        if (resend?.emails?.send) {
            await resend.emails.send({
                from: 'onboarding@resend.dev', // Replace with your verified domain
                to: email,
                subject: 'You\'ve been invited to a Workspace!',
                html: `
                <p>Hello,</p>
                <p>You have been invited to join the <strong>${currentWorkspace?.name || 'a workspace'}</strong> on our platform as a <strong>${role}</strong>.</p>
                <p>Click <a href="${invitation.acceptRedirectUrl}">here</a> to accept the invitation and set up your account.</p>
                <p>If you have any questions, please contact us.</p>
                <p>Regards,<br/>The Platform Team</p>
            `,
            });
        } else {
            console.warn('Resend not configured. Skipping email send.');
        }

        res.status(201).json({ ...newTeamMember, invitation_external_id: invitation.id, invitation_status: invitation.status });
    } catch (err) {
        console.error("Error inviting team member:", err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/team-members', async (req, res) => {
    try {
        const { workspace_id } = req.query;
        let query = 'SELECT id, user_id, email, invitation_id, workspace_id, role, status, created_at, updated_at FROM team_members';
        const params = [];
        
        if (workspace_id) {
            query += ' WHERE workspace_id = $1';
            params.push(workspace_id);
        }

        let result;
        try {
            result = await pool.query(query, params);
        } catch (dbErr) {
            if (dbErr?.code === '42P01') {
                // table does not exist — return empty list gracefully
                return res.json([]);
            }
            throw dbErr;
        }
        let teamMembers = result.rows;

        const clerkUsersPromises = teamMembers.map(async (member) => {
            if (member.user_id && clerk?.users?.getUser) {
                try {
                    const clerkUser = await clerk.users.getUser(member.user_id);
                    return {
                        ...member,
                        full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                        email: clerkUser.emailAddresses[0]?.emailAddress || '',
                        profile_image_url: clerkUser.profileImageUrl,
                    };
                } catch (clerkError) {
                    console.warn(`Could not fetch Clerk user for ID ${member.user_id}: ${clerkError.message}`);
                    return { ...member, full_name: 'Unknown User', email: member.email || 'N/A', profile_image_url: '' };
                }
            } else if (member.email && member.invitation_id) {
                // This member has a pending invitation
                return { 
                    ...member,
                    full_name: member.email, // Display email for pending invites
                    profile_image_url: '', // No image until they sign up
                    isPending: true, // Custom flag for frontend
                };
            } else {
                return { ...member, full_name: 'Unknown User', email: member.email || 'N/A', profile_image_url: '' };
            }
        });

        teamMembers = await Promise.all(clerkUsersPromises);

        res.json(teamMembers);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/team-members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result;
        try {
            result = await pool.query('SELECT id, user_id, email, invitation_id, workspace_id, role, status, created_at, updated_at FROM team_members WHERE id = $1', [id]);
        } catch (dbErr) {
            if (dbErr?.code === '42P01') {
                return res.status(404).json({ error: 'Team member not found' });
            }
            throw dbErr;
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        let teamMember = result.rows[0];

        if (teamMember.user_id && clerk?.users?.getUser) {
            // Fetch Clerk user data if user_id exists
            try {
                const clerkUser = await clerk.users.getUser(teamMember.user_id);
                teamMember = {
                    ...teamMember,
                    full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                    email: clerkUser.emailAddresses[0]?.emailAddress || '',
                    profile_image_url: clerkUser.profileImageUrl,
                };
            } catch (clerkError) {
                console.warn(`Could not fetch Clerk user for ID ${teamMember.user_id}: ${clerkError.message}`);
                teamMember = { ...teamMember, full_name: 'Unknown User', email: teamMember.email || 'N/A', profile_image_url: '' };
            }
        } else if (teamMember.email && teamMember.invitation_id) {
            // This is a pending invitation
            teamMember = { 
                ...teamMember,
                full_name: teamMember.email, // Display email for pending invites
                profile_image_url: '', // No image until they sign up
                isPending: true, // Custom flag for frontend
            };
        } else {
            teamMember = { ...teamMember, full_name: 'Unknown User', email: 'N/A', profile_image_url: '' };
        }

        res.json(teamMember);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/team-members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status, user_id } = req.body; // Allow user_id to be updated
        const result = await pool.query(
            'UPDATE team_members SET role = $1, status = $2, user_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [role, status, user_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.delete('/api/team-members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Books Team Members (Join Table)
app.post('/api/books-team-members', async (req, res) => {
    try {
        const { book_id, team_member_id } = req.body;
        const result = await pool.query(
            'INSERT INTO books_team_members (book_id, team_member_id) VALUES ($1, $2) RETURNING *',
            [book_id, team_member_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.delete('/api/books-team-members', async (req, res) => {
    try {
        const { book_id, team_member_id } = req.body;
        const result = await pool.query('DELETE FROM books_team_members WHERE book_id = $1 AND team_member_id = $2 RETURNING *', [book_id, team_member_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Resources
app.post('/api/resources', async (req, res) => {
    try {
        const { workspace_id, title, category, description, url, uploaded_by } = req.body;
        const result = await pool.query(
            'INSERT INTO resources (workspace_id, title, category, description, url, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [workspace_id, title, category, description, url, uploaded_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/resources', async (req, res) => {
    try {
        const { workspace_id, category, search_term, sort_by } = req.query;
        let query = 'SELECT * FROM resources';
        const params = [];
        const conditions = [];
        let paramIndex = 1;

        if (workspace_id) {
            conditions.push(`workspace_id = $${paramIndex++}`);
            params.push(workspace_id);
        }
        if (category) {
            conditions.push(`category = $${paramIndex++}`);
            params.push(category);
        }
        if (search_term) {
            conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`);
            params.push(`%${search_term}%`);
            paramIndex++;
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        if (sort_by === 'views') {
            query += ' ORDER BY views DESC';
        } else if (sort_by === 'recently_added') {
            query += ' ORDER BY created_at DESC';
        } else {
            query += ' ORDER BY title ASC'; // Default sort
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/resources/:id/view', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE resources SET views = views + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, description, url } = req.body;
        const result = await pool.query(
            'UPDATE resources SET title = $1, category = $2, description = $3, url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [title, category, description, url, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.delete('/api/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Author Onboarding
app.get('/api/author-onboarding/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query('SELECT * FROM author_onboarding WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Author onboarding record not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/author-onboarding', async (req, res) => {
    try {
        const { user_id, workspace_id, steps_completed, progress_percent } = req.body;
        const result = await pool.query(
            'INSERT INTO author_onboarding (user_id, workspace_id, steps_completed, progress_percent) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, workspace_id, steps_completed, progress_percent]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/author-onboarding/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { steps_completed, progress_percent } = req.body;
        const result = await pool.query(
            'UPDATE author_onboarding SET steps_completed = $1, progress_percent = $2, last_updated = CURRENT_TIMESTAMP WHERE user_id = $3 RETURNING *',
            [steps_completed, progress_percent, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Author onboarding record not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Book Sales
app.post('/api/book-sales', async (req, res) => {
    try {
        const { book_id, platform, revenue_zar, units, sale_date } = req.body;
        const result = await pool.query(
            'INSERT INTO book_sales (book_id, platform, revenue_zar, units, sale_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [book_id, platform, revenue_zar, units, sale_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/book-sales', async (req, res) => {
    try {
        const { book_id, platform, start_date, end_date } = req.query;
        let query = 'SELECT * FROM book_sales';
        const params = [];
        let paramIndex = 1;

        const conditions = [];

        if (book_id) {
            conditions.push(`book_id = $${paramIndex++}`);
            params.push(book_id);
        }
        if (platform) {
            conditions.push(`platform = $${paramIndex++}`);
            params.push(platform);
        }
        if (start_date) {
            conditions.push(`sale_date >= $${paramIndex++}`);
            params.push(start_date);
        }
        if (end_date) {
            conditions.push(`sale_date <= $${paramIndex++}`);
            params.push(end_date);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY sale_date DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Marketing Campaigns
app.post('/api/campaigns', async (req, res) => {
    try {
        const { workspace_id, title, start_date, end_date, status, platforms, budget_zar, books, performance_stats } = req.body;
        const result = await pool.query(
            'INSERT INTO campaigns (workspace_id, title, start_date, end_date, status, platforms, budget_zar, books, performance_stats) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [workspace_id, title, start_date, end_date, status, platforms, budget_zar, books, performance_stats]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/campaigns', async (req, res) => {
    try {
        const { workspace_id, status } = req.query;
        let query = 'SELECT * FROM campaigns';
        const params = [];

        if (workspace_id) {
            query += ' WHERE workspace_id = $1';
            params.push(workspace_id);
        }

        if (status) {
            query += params.length > 0 ? ' AND status = $' + (params.length + 1) : ' WHERE status = $' + (params.length + 1);
            params.push(status);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, start_date, end_date, status, platforms, budget_zar, books, performance_stats } = req.body;
        const result = await pool.query(
            'UPDATE campaigns SET title = $1, start_date = $2, end_date = $3, status = $4, platforms = $5, budget_zar = $6, books = $7, performance_stats = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
            [title, start_date, end_date, status, platforms, budget_zar, books, performance_stats, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.delete('/api/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM campaigns WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Tasks
app.get('/api/books/:bookId/tasks', async (req, res) => {
    try {
        const { bookId } = req.params;
        const result = await pool.query('SELECT * FROM tasks WHERE book_id = $1', [bookId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.get('/api/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/books/:bookId/tasks', async (req, res) => {
    try {
        const { bookId } = req.params;
        let { id, publishing_stage_id, title, description, status, type, priority, assignee_id, due_date, createdAt, updatedAt } = req.body;
        if (!id) id = uuidv4();
        const result = await pool.query(
            'INSERT INTO tasks (id, book_id, publishing_stage_id, title, description, status, type, priority, assignee_id, due_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [id, bookId, publishing_stage_id, title, description, status, type, priority, assignee_id, due_date, createdAt, updatedAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.put('/api/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, status, type, priority, assignee_id, due_date, updatedAt, publishing_stage_id } = req.body;
        const result = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, status = $3, type = $4, priority = $5, assignee_id = $6, due_date = $7, updated_at = $8, publishing_stage_id = $9 WHERE id = $10 RETURNING *',
            [title, description, status, type, priority, assignee_id, due_date, updatedAt, publishing_stage_id, taskId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Comments
app.get('/api/tasks/:taskId/comments', async (req, res) => {
    try {
        const { taskId } = req.params;
        const result = await pool.query('SELECT c.*, u.name, u.image FROM comments c JOIN users u ON c.user_id = u.id WHERE c.task_id = $1', [taskId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/tasks/:taskId/comments', async (req, res) => {
    try {
        const { taskId } = req.params;
        let { id, userId, content, createdAt, updatedAt } = req.body;
        if (!id) id = uuidv4();
        const result = await pool.query(
            'INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, taskId, userId, content, createdAt, updatedAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Royalties
app.get('/api/books/:bookId/royalties', async (req, res) => {
    try {
        const { bookId } = req.params;
        const result = await pool.query('SELECT * FROM royalties WHERE author_book_id = $1', [bookId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/books/:bookId/royalties', async (req, res) => {
    try {
        const { bookId } = req.params;
        let { id, sharePercentage, earnings, createdAt, updatedAt } = req.body;
        if (!id) id = uuidv4();
        const result = await pool.query(
            'INSERT INTO royalties (id, author_book_id, share_percentage, earnings, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, bookId, sharePercentage, earnings, createdAt, updatedAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Launch Plans
app.get('/api/books/:bookId/launchPlans', async (req, res) => {
    try {
        const { bookId } = req.params;
        const result = await pool.query('SELECT * FROM launch_plans WHERE author_book_id = $1', [bookId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

app.post('/api/books/:bookId/launchPlans', async (req, res) => {
    try {
        const { bookId } = req.params;
        let { id, launchDate, status, marketingBudget, promotionChannels, notes, createdAt, updatedAt } = req.body;
        if (!id) id = uuidv4();
        const result = await pool.query(
            'INSERT INTO launch_plans (id, author_book_id, launch_date, status, marketing_budget, promotion_channels, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [id, bookId, launchDate, status, marketingBudget, promotionChannels, notes, createdAt, updatedAt]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error', details: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});