import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiBaseUrl } from '../utils/env';

const API_BASE_URL = getApiBaseUrl();

export const fetchBookSales = createAsyncThunk(
    'bookSales/fetchBookSales',
    async (queryParams = {}, { rejectWithValue }) => {
        try {
            const queryString = new URLSearchParams(queryParams).toString();
            const response = await fetch(`${API_BASE_URL}/api/book-sales${queryString ? `?${queryString}` : ''}`);
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

const bookSalesSlice = createSlice({
    name: 'bookSales',
    initialState: {
        sales: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookSales.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBookSales.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sales = action.payload;
            })
            .addCase(fetchBookSales.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default bookSalesSlice.reducer;
