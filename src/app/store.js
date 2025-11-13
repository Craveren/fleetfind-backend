import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from '../features/workspaceSlice';
import themeReducer from '../features/themeSlice';
import campaignsReducer from '../features/campaignsSlice';
import bookSalesReducer from '../features/bookSalesSlice';
import authorOnboardingReducer from '../features/authorOnboardingSlice';
import resourceLibraryReducer from '../features/resourceLibrarySlice';
import teamMembersReducer from '../features/teamMembersSlice';
import userPreferencesReducer from '../features/userPreferencesSlice';

const store = configureStore({
    reducer: {
        workspace: workspaceReducer,
        theme: themeReducer,
        campaigns: campaignsReducer,
        bookSales: bookSalesReducer,
        authorOnboarding: authorOnboardingReducer,
        resourceLibrary: resourceLibraryReducer,
        teamMembers: teamMembersReducer,
        userPreferences: userPreferencesReducer,
    },
});

export default store;