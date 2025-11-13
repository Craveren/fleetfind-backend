import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCampaigns = createAsyncThunk(
    'campaigns/fetchCampaigns',
    async (workspaceId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/campaigns?workspace_id=${workspaceId}`);
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

export const addCampaign = createAsyncThunk(
    'campaigns/addCampaign',
    async (campaignData, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:5000/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaignData),
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

export const updateCampaign = createAsyncThunk(
    'campaigns/updateCampaign',
    async ({ campaignId, updatedData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, {
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

export const deleteCampaign = createAsyncThunk(
    'campaigns/deleteCampaign',
    async (campaignId, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }
            return campaignId; // Return the deleted ID for state update
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const campaignsSlice = createSlice({
    name: 'campaigns',
    initialState: {
        campaigns: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCampaigns.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.campaigns = action.payload;
            })
            .addCase(fetchCampaigns.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addCampaign.fulfilled, (state, action) => {
                state.campaigns.push(action.payload);
            })
            .addCase(updateCampaign.fulfilled, (state, action) => {
                const index = state.campaigns.findIndex(campaign => campaign.id === action.payload.id);
                if (index !== -1) {
                    state.campaigns[index] = action.payload;
                }
            })
            .addCase(deleteCampaign.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.filter(campaign => campaign.id !== action.payload);
            });
    },
});

export default campaignsSlice.reducer;
