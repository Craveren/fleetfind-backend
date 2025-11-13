import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Team from "./pages/Team";
import AuthorBookDetail from "./pages/BookDetails";
import TaskDetails from "./pages/TaskDetails";
import AuthorDashboard from "./pages/AuthorDashboard";
import EditorDashboard from "./pages/EditorDashboard";
import Settings from "./pages/Settings";
import MarketingCampaigns from "./pages/MarketingCampaigns";
import BookSales from "./pages/BookSales";
import BookCatalog from "./pages/BookCatalog";
import Landing from "./pages/Landing";
import RequireAuth from "./components/RequireAuth";
import ResourceLibrary from "./pages/ResourceLibrary";
import LocalPrintPartners from "./pages/LocalPrintPartners";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaces, fetchWorkspaceById, setCurrentWorkspace } from "./features/workspaceSlice";
import { loadTheme } from "./features/themeSlice";

const App = () => {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.theme.theme);

    // Load theme from localStorage on initial render
    useEffect(() => {
        dispatch(loadTheme());
    }, [dispatch]);

    // Apply theme to document element and localStorage whenever currentTheme changes
    useEffect(() => {
        if (currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

    useEffect(() => {
        const loadInitialData = async () => {
            // Fetch all workspaces
            const workspaces = await dispatch(fetchWorkspaces()).unwrap();
            if (workspaces.length > 0) {
                // For now, let's hardcode a workspace ID or fetch the first one
                // In a real app, you'd get this from user preferences or a login flow
                const defaultWorkspaceId = workspaces[0].id;
                await dispatch(fetchWorkspaceById(defaultWorkspaceId));
            }
        };
        loadInitialData();
    }, [dispatch]);

    return (
        <>
            <Toaster />
            <Routes>
                {/* Public landing */}
                <Route path="/landing" element={<Landing />} />

                {/* Protected app */}
                <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
                    <Route index element={<Dashboard />} />
                    <Route path="team" element={<Team />} />
                    <Route path="books" element={<Books />} />
                    <Route path="authorBooksDetail" element={<AuthorBookDetail />} />
                    <Route path="taskDetails" element={<TaskDetails />} />
                    <Route path="author-dashboard" element={<AuthorDashboard />} />
                    <Route path="editor-dashboard" element={<EditorDashboard />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="marketing-campaigns" element={<MarketingCampaigns />} />
                    <Route path="book-sales" element={<BookSales />} />
                    <Route path="author-onboarding" element={<BookCatalog />} />
                    <Route path="book-catalog" element={<BookCatalog />} />
                    <Route path="resource-library" element={<ResourceLibrary />} />
                    <Route path="local-print-partners" element={<LocalPrintPartners />} />
                </Route>
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/landing" replace />} />
            </Routes>
        </>
    );
};

export default App;
