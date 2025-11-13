import React, { useState, useEffect } from 'react';
import { UserButton, OrganizationProfile, useUser } from '@clerk/clerk-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWorkspace, deleteWorkspace } from '../features/workspaceSlice';
import { toggleTheme } from '../features/themeSlice'; // Import toggleTheme from themeSlice
import { fetchUserPreferences, createUserPreferences, updateUserPreferences } from '../features/userPreferencesSlice';
import { SunIcon, MoonIcon, Save, Trash2, Globe, Bell, FileText, UsersIcon, LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProfileImageUploader from '../components/ProfileImageUploader';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useUser();
  const clerkUserId = user?.id;

  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { preferences, status: preferencesStatus, error: preferencesError } = useSelector((state) => state.userPreferences);
  const currentTheme = useSelector((state) => state.theme.currentTheme); // Get theme from themeSlice

  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || '');
  const [workspaceDescription, setWorkspaceDescription] = useState(currentWorkspace?.description || '');
  const [workspaceLogo, setWorkspaceLogo] = useState(currentWorkspace?.image_url || '');
  const [inviteLink, setInviteLink] = useState('');
  const [languagePreference, setLanguagePreference] = useState(preferences?.language_preference || 'en');
  const [notificationSettings, setNotificationSettings] = useState(preferences?.notifications || {});

  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceName(currentWorkspace.name);
      setWorkspaceDescription(currentWorkspace.description);
      setWorkspaceLogo(currentWorkspace.image_url || '');
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (clerkUserId) {
      dispatch(fetchUserPreferences(clerkUserId))
        .unwrap()
        .catch((err) => {
          if (err.message && err.message.includes('404')) {
            // User preferences not found, create default
            dispatch(createUserPreferences({ user_id: clerkUserId, theme_preference: currentTheme, language_preference: 'en', notifications: {} }));
          } else {
            toast.error(`Failed to load user preferences: ${err.message}`);
          }
        });
    }
  }, [dispatch, clerkUserId, currentTheme]);

  useEffect(() => {
    if (preferences) {
      setLanguagePreference(preferences.language_preference);
      setNotificationSettings(preferences.notifications);
    }
  }, [preferences]);

  const handleThemeToggle = async () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    dispatch(toggleTheme(newTheme)); // Update theme in themeSlice

    if (clerkUserId) {
      toast.loading("Saving theme preference...");
      try {
        await dispatch(updateUserPreferences({
          userId: clerkUserId,
          preferencesData: { ...preferences, theme_preference: newTheme },
        })).unwrap();
        toast.dismiss();
        toast.success("Theme preference saved!");
      } catch (error) {
        toast.dismiss();
        toast.error(`Failed to save theme preference: ${error.message || error}`);
        console.error("Failed to save theme preference:", error);
      }
    }
  };

  const handleLanguageChange = async (e) => {
    const newLanguage = e.target.value;
    setLanguagePreference(newLanguage);

    if (clerkUserId) {
      toast.loading("Saving language preference...");
      try {
        await dispatch(updateUserPreferences({
          userId: clerkUserId,
          preferencesData: { ...preferences, language_preference: newLanguage },
        })).unwrap();
        toast.dismiss();
        toast.success("Language preference saved!");
      } catch (error) {
        toast.dismiss();
        toast.error(`Failed to save language preference: ${error.message || error}`);
        console.error("Failed to save language preference:", error);
      }
    }
  };

  const handleNotificationToggle = async (notificationType) => {
    const updatedNotifications = {
      ...notificationSettings,
      [notificationType]: !notificationSettings[notificationType],
    };
    setNotificationSettings(updatedNotifications);

    if (clerkUserId) {
      toast.loading("Saving notification preference...");
      try {
        await dispatch(updateUserPreferences({
          userId: clerkUserId,
          preferencesData: { ...preferences, notifications: updatedNotifications },
        })).unwrap();
        toast.dismiss();
        toast.success("Notification preference saved!");
      } catch (error) {
        toast.dismiss();
        toast.error(`Failed to save notification preference: ${error.message || error}`);
        console.error("Failed to save notification preference:", error);
      }
    }
  };

  const handleSaveWorkspaceSettings = async (e) => {
    e.preventDefault();
    if (!currentWorkspace) return;

    try {
      toast.loading("Saving workspace settings...");
      await dispatch(updateWorkspace({
        workspaceId: currentWorkspace.id,
        updatedData: { name: workspaceName, description: workspaceDescription, image_url: workspaceLogo },
      })).unwrap();
      toast.dismiss();
      toast.success("Workspace settings saved!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to save settings.");
      console.error("Failed to save workspace settings:", error);
    }
  };

  const handleGenerateInviteLink = async () => {
    if (!currentWorkspace?.id) {
      toast.error("Workspace not found.");
      return;
    }

    toast.loading("Generating invite link...");
    try {
      // For now, assume default role is 'member'
      const response = await fetch(`http://localhost:5000/api/workspaces/${currentWorkspace.id}/invite-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'member' }),
      });

      if (!response.ok) {
        // Gracefully handle servers without Clerk
        if (response.status === 501) {
          toast.dismiss();
          toast.error("Invites are not configured on this server.");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to generate invite link.");
      }

      const data = await response.json();
      setInviteLink(data.inviteLink);
      toast.dismiss();
      toast.success("Invite link generated!");
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to generate invite link: ${error.message}`);
      console.error("Error generating invite link:", error);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard!");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace || !confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) {
      return;
    }

    try {
      toast.loading("Deleting workspace...");
      await dispatch(deleteWorkspace(currentWorkspace.id)).unwrap();
      toast.dismiss();
      toast.success("Workspace deleted!");
      navigate('/'); // Redirect to a safe page
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to delete workspace.");
      console.error("Failed to delete workspace:", error);
    }
  };

  if (preferencesStatus === 'loading' || !currentWorkspace || !clerkUserId) {
    return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading settings...</div>;
  }

  if (preferencesStatus === 'failed') {
    return <div className="p-6 text-center text-red-500">Error: {preferencesError}</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Application Settings</h1>

      {/* Profile Picture */}
      <div className="bg-[var(--surface)] border" style={{ borderColor: 'var(--border)', borderRadius: 'var(--radius-card)' }}>
        <div className="p-0 sm:p-0">
          <ProfileImageUploader />
        </div>
      </div>

      {/* Clerk User Management */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Account</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-700 dark:text-zinc-300">Manage your Clerk account details and sign out.</p>
          <UserButton afterSignOutUrl="/" />
        </div>
        {/* Clerk Organization Profile for workspace details (if applicable) */}
        <div className="mt-4">
          {/* Assuming currentWorkspace has an organizationId property */}
          {currentWorkspace?.organizationId && (
            <OrganizationProfile />
          )}
        </div>
      </div>

      {/* Theme Preference */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Theme Preference</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-700 dark:text-zinc-300">Switch between light and dark modes.</p>
          <button onClick={handleThemeToggle} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-white transition-colors">
            {currentTheme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Workspace Settings */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Workspace Details</h2>
        <form onSubmit={handleSaveWorkspaceSettings} className="space-y-4">
          <div>
            <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Workspace Name</label>
            <input
              type="text"
              id="workspaceName"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="workspaceDescription" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Description</label>
            <textarea
              id="workspaceDescription"
              value={workspaceDescription ?? ''}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
            ></textarea>
          </div>
          {/* Placeholder for Workspace Logo Upload */}
          <div>
            <label htmlFor="workspaceLogo" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Workspace Logo</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="text"
                id="workspaceLogo"
                value={workspaceLogo}
                onChange={(e) => setWorkspaceLogo(e.target.value)}
                placeholder="Logo URL"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setWorkspaceLogo(reader.result?.toString() || '');
                  reader.readAsDataURL(file);
                }}
                className="text-sm"
              />
            </div>
            {workspaceLogo && (
              <div className="mt-2">
                <img src={workspaceLogo} alt="Workspace Logo" className="max-h-24" />
              </div>
            )}
          </div>
          {/* <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Invite Members via Link
          </button> */}
          <div className="flex items-center gap-3 mt-4">
            <button type="button" onClick={handleGenerateInviteLink} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" >
              <LinkIcon className="mr-2 h-4 w-4" /> Generate Invite Link
            </button>
            {inviteLink && (
              <div className="flex items-center gap-2 flex-grow">
                <input type="text" readOnly value={inviteLink} className="flex-grow px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm dark:text-white" />
                <button type="button" onClick={handleCopyLink} className="px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700" >
                  Copy
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </button>
        </form>
      </div>

      {/* Manage Workspace Members (Placeholder) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Team Members</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-700 dark:text-zinc-300">View and manage your workspace members.</p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <UsersIcon className="mr-2 h-4 w-4" /> Manage Members
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-zinc-300">Email notifications for new tasks</p>
            <input
              type="checkbox"
              id="new_tasks_notification"
              checked={notificationSettings.new_tasks || false}
              onChange={() => handleNotificationToggle('new_tasks')}
              className="form-checkbox h-5 w-5 text-blue-600 rounded-md focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Test</span>
            <button type="button" onClick={() => import('../utils/notify').then(({ tryBrowserNotify }) => tryBrowserNotify('New Task', 'You will be notified when new tasks are created.'))} className="px-2 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Send test
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-zinc-300">In-app notifications for comments</p>
            <input
              type="checkbox"
              id="new_comments_notification"
              checked={notificationSettings.new_comments || false}
              onChange={() => handleNotificationToggle('new_comments')}
              className="form-checkbox h-5 w-5 text-blue-600 rounded-md focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Test</span>
            <button type="button" onClick={() => import('../utils/notify').then(({ tryBrowserNotify }) => tryBrowserNotify('New Comment', 'You will receive in-app notifications for comments.'))} className="px-2 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Send test
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-zinc-300">Weekly summary emails</p>
            <input
              type="checkbox"
              id="weekly_summary_notification"
              checked={notificationSettings.weekly_summary || false}
              onChange={() => handleNotificationToggle('weekly_summary')}
              className="form-checkbox h-5 w-5 text-blue-600 rounded-md focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Test</span>
            <button type="button" onClick={() => import('../utils/notify').then(({ tryBrowserNotify }) => tryBrowserNotify('Weekly Summary', 'You will receive a weekly summary.'))} className="px-2 py-1 text-xs rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Send test
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Language</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-700 dark:text-zinc-300">Select your preferred language.</p>
          <select
            value={languagePreference}
            onChange={handleLanguageChange}
            className="mt-1 block w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white sm:text-sm"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      {/* Data Export (Placeholder) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Export</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-700 dark:text-zinc-300">Export your workspace data.</p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
            <FileText className="mr-2 h-4 w-4" /> Export Data
          </button>
        </div>
      </div>

      {/* About/Version Information */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
        <p className="text-gray-700 dark:text-zinc-300">Application Version: 1.0.0</p>
        <p className="text-gray-700 dark:text-zinc-300 mt-2">Built with React, Redux, and Clerk.</p>
      </div>

      {/* Delete Workspace */}
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">Danger Zone</h2>
        <p className="text-red-600 dark:text-red-300 mb-4">Permanently delete this workspace and all its data. This action cannot be undone.</p>
        <button
          onClick={handleDeleteWorkspace}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Workspace
        </button>
      </div>

    </div>
  );
};

export default Settings;
