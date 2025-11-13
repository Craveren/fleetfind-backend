import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiBaseUrl } from '../utils/env';

const API_BASE_URL = getApiBaseUrl();

export const fetchOnboardingProgress = createAsyncThunk(
    'authorOnboarding/fetchOnboardingProgress',
    async (userId, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/author-onboarding/${userId}`);
            if (!response.ok) {
                // If record not found, we assume it's a new user and return a default structure
                if (response.status === 404) {
                    // Try to create a default record using current workspace if available
                    const state = getState();
                    const workspaceId = state?.workspace?.currentWorkspace?.id || null;
                    const createRes = await fetch(`${API_BASE_URL}/api/author-onboarding`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId, workspace_id: workspaceId, steps_completed: [], progress_percent: 0 }),
                    });
                    if (createRes.ok) {
                        const created = await createRes.json();
                        return created;
                    }
                    // Fallback to default in-memory structure
                    return { user_id: userId, steps_completed: [], progress_percent: 0 };
                }
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

export const updateOnboardingProgress = createAsyncThunk(
    'authorOnboarding/updateOnboardingProgress',
    async ({ userId, stepsCompleted, progressPercent }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/author-onboarding/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ steps_completed: stepsCompleted, progress_percent: progressPercent }),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data; // Returns the updated onboarding record
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createOnboardingProgress = createAsyncThunk(
    'authorOnboarding/createOnboardingProgress',
    async ({ userId, workspaceId }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/author-onboarding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, workspace_id: workspaceId, steps_completed: [], progress_percent: 0 }),
            });
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

const authorOnboardingSlice = createSlice({
    name: 'authorOnboarding',
    initialState: {
        onboarding: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOnboardingProgress.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOnboardingProgress.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.onboarding = action.payload;
            })
            .addCase(fetchOnboardingProgress.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateOnboardingProgress.fulfilled, (state, action) => {
                state.onboarding = action.payload;
            })
            .addCase(createOnboardingProgress.fulfilled, (state, action) => {
                state.onboarding = action.payload;
            });
    },
});

export default authorOnboardingSlice.reducer;
