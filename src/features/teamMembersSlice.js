import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTeamMembers = createAsyncThunk(
    'teamMembers/fetchTeamMembers',
    async (workspaceId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/team-members?workspace_id=${workspaceId}`);
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const inviteTeamMember = createAsyncThunk(
    'teamMembers/inviteTeamMember',
    async ({ email, workspace_id, role }, { rejectWithValue }) => {
        try {
            // In a real app, this would involve Clerk's invitation API, then creating a record in our DB
            // For now, we'll simulate the DB creation directly.
            const response = await fetch('http://localhost:5000/api/team-members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, workspace_id, role }),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data; // Returns the newly created team member
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTeamMemberRole = createAsyncThunk(
    'teamMembers/updateTeamMemberRole',
    async ({ memberId, role }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/team-members/${memberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data; // Returns the updated team member
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const assignBookToMember = createAsyncThunk(
    'teamMembers/assignBookToMember',
    async ({ bookId, teamMemberId }, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:5000/api/books-team-members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_id: bookId, team_member_id: teamMemberId }),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data; // Returns the new assignment
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeBookFromMember = createAsyncThunk(
    'teamMembers/removeBookFromMember',
    async ({ bookId, teamMemberId }, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:5000/api/books-team-members', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_id: bookId, team_member_id: teamMemberId }),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            return { bookId, teamMemberId }; // Return IDs for state update
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const teamMembersSlice = createSlice({
    name: 'teamMembers',
    initialState: {
        members: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeamMembers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTeamMembers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.members = action.payload;
            })
            .addCase(fetchTeamMembers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(inviteTeamMember.fulfilled, (state, action) => {
                state.members.push(action.payload);
            })
            .addCase(updateTeamMemberRole.fulfilled, (state, action) => {
                const index = state.members.findIndex(member => member.id === action.payload.id);
                if (index !== -1) {
                    state.members[index] = action.payload;
                }
            });
            // For assignBookToMember and removeBookFromMember, the state update is more complex
            // as it affects the 'books' data which is in 'workspaceSlice'.
            // We will handle this by re-fetching the workspace or book details if needed,
            // or by dispatching specific actions to update the book within workspaceSlice.
            // For now, we will assume a re-fetch of workspace data will suffice or handle updates manually in the component.
    },
});

export default teamMembersSlice.reducer;
