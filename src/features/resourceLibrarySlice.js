import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiBaseUrl } from '../utils/env';

const API_BASE_URL = getApiBaseUrl();

export const fetchResources = createAsyncThunk(
    'resourceLibrary/fetchResources',
    async (queryParams = {}, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(queryParams).toString();
            const response = await fetch(`${API_BASE_URL}/api/resources${queryString ? `?${queryString}` : ''}`);
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

export const addResource = createAsyncThunk(
    'resourceLibrary/addResource',
    async (resourceData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/resources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resourceData),
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

export const incrementResourceView = createAsyncThunk(
    'resourceLibrary/incrementResourceView',
    async (resourceId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/view`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            const data = await response.json();
            return data; // Returns the updated resource with new view count
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateResource = createAsyncThunk(
    'resourceLibrary/updateResource',
    async ({ resourceId, updatedData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
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

export const deleteResource = createAsyncThunk(
    'resourceLibrary/deleteResource',
    async (resourceId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            return resourceId; // Return the deleted ID for state update
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const resourceLibrarySlice = createSlice({
    name: 'resourceLibrary',
    initialState: {
        resources: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchResources.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchResources.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.resources = action.payload;
            })
            .addCase(fetchResources.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addResource.fulfilled, (state, action) => {
                state.resources.push(action.payload);
            })
            .addCase(incrementResourceView.fulfilled, (state, action) => {
                const index = state.resources.findIndex(resource => resource.id === action.payload.id);
                if (index !== -1) {
                    state.resources[index] = action.payload;
                }
            })
            .addCase(updateResource.fulfilled, (state, action) => {
                const index = state.resources.findIndex(resource => resource.id === action.payload.id);
                if (index !== -1) {
                    state.resources[index] = action.payload;
                }
            })
            .addCase(deleteResource.fulfilled, (state, action) => {
                state.resources = state.resources.filter(resource => resource.id !== action.payload);
            });
    },
});

export default resourceLibrarySlice.reducer;
