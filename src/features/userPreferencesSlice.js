import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUserPreferences = createAsyncThunk(
    'userPreferences/fetchUserPreferences',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user-preferences/${userId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    // Auto-create default preferences on first access
                    const createRes = await fetch('http://localhost:5000/api/user-preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: userId, theme_preference: 'light', language_preference: 'en', notifications: {} }),
                    });
                    if (createRes.ok) {
                        return await createRes.json();
                    }
                    // Fallback to in-memory default if creation fails
                    return { user_id: userId, theme_preference: 'light', language_preference: 'en', notifications: {} };
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

export const createUserPreferences = createAsyncThunk(
    'userPreferences/createUserPreferences',
    async (preferencesData, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:5000/api/user-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferencesData),
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

export const updateUserPreferences = createAsyncThunk(
    'userPreferences/updateUserPreferences',
    async ({ userId, preferencesData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user-preferences/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferencesData),
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data; // Returns the updated preferences
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const userPreferencesSlice = createSlice({
    name: 'userPreferences',
    initialState: {
        preferences: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserPreferences.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserPreferences.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.preferences = action.payload;
            })
            .addCase(fetchUserPreferences.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createUserPreferences.fulfilled, (state, action) => {
                state.preferences = action.payload;
            })
            .addCase(updateUserPreferences.fulfilled, (state, action) => {
                state.preferences = action.payload;
            });
    },
});

export default userPreferencesSlice.reducer;
