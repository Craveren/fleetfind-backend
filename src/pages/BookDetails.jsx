import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { createSelector } from 'reselect';
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, SettingsIcon, BarChart3Icon, CalendarIcon, FileStackIcon, ZapIcon } from "lucide-react";
import BookAnalytics from "../components/BookAnalytics";
import BookSettings from "../components/BookSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import BookCalendar from "../components/BookCalendar";
import BookPublishingSteps from "../components/BookPublishingSteps";
import PublishingStagesTab from "../components/PublishingStagesTab"; // New import
import RoyaltyTrackerTab from "../components/RoyaltyTrackerTab"; // New import
import LaunchPlannerTab from "../components/LaunchPlannerTab"; // New import
import { BookOpenIcon, DollarSignIcon, RocketIcon } from 'lucide-react'; // New import

const selectBooks = createSelector(
    (state) => state.workspace?.currentWorkspace?.books,
    (books) => [...(books || [])]
);

export default function AuthorBookDetail() { // Renamed from ProjectDetail

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const id = searchParams.get('id');

    const navigate = useNavigate();
    const books = useSelector(selectBooks);

    const [book, setBook] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || "tasks");

    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        if (books && books.length > 0) {
            const foundBook = books.find((b) => b.id === id);
            if (foundBook) {
                setBook({
                    ...foundBook,
                    start_date: new Date(foundBook.start_date).toISOString(),
                    end_date: new Date(foundBook.end_date).toISOString(),
                });
                console.log("BookDetails - Updated book state:", foundBook);
            } else {
                setBook(null);
            }
            setTasks(foundBook?.tasks || []);
        }
    }, [id, books]);

    const statusColors = {
        PLANNING: "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-zinc-200",
        ACTIVE: "bg-emerald-200 text-emerald-900 dark:bg-emerald-500 dark:text-emerald-900",
        ON_HOLD: "bg-amber-200 text-amber-900 dark:bg-amber-500 dark:text-amber-900",
        COMPLETED: "bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-blue-900",
        CANCELLED: "bg-red-200 text-red-900 dark:bg-red-500 dark:text-red-900",
    };

    if (!book) {
        return (
            <div className="p-6 text-center text-zinc-900 dark:text-zinc-200">
                <p className="text-3xl md:text-5xl mt-40 mb-10">Author Book not found</p>
                <button onClick={() => navigate('/books')} className="mt-4 px-4 py-2 rounded bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600" >
                    Back to Author Books
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5 max-w-6xl mx-auto text-zinc-900 dark:text-white">
            {/* Header */}
            <div className="flex max-md:flex-col gap-4 flex-wrap items-start justify-between max-w-6xl">
                <div className="flex items-center gap-4">
                    <button className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400" onClick={() => navigate('/books')}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-medium">{book.name} ({(book.type || "HYBRID").replace("_", " ")})</h1>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${statusColors[book.status]}`} >
                            {book.status.replace("_", " ")}
                        </span>
                    </div>
                </div>
                <button onClick={() => setShowCreateTask(true)} className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white" >
                    <PlusIcon className="size-4" />
                    New Manuscript / Book Draft
                </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:flex flex-wrap gap-6">
                {[
                    { label: "Total Publishing Steps", value: tasks.length, color: "text-zinc-900 dark:text-white" },
                    { label: "Completed", value: tasks.filter((t) => t.status === "DONE").length, color: "text-emerald-700 dark:text-emerald-400" },
                    { label: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "TODO").length, color: "text-amber-700 dark:text-amber-400" },
                    { label: "Team Members", value: book.members?.length || 0, color: "text-blue-700 dark:text-blue-400" },
                ].map((card, idx) => (
                    <div key={idx} className=" dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex justify-between sm:min-w-60 p-4 py-2.5 rounded">
                        <div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">{card.label}</div>
                            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                        </div>
                        <ZapIcon className={`size-4 ${card.color}`} />
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div>
                <div className="inline-flex flex-wrap max-sm:grid grid-cols-3 gap-2 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
                    {[
                        { key: "tasks", label: "Manuscripts / Book Drafts", icon: FileStackIcon }, // Updated label
                        { key: "stages", label: "Publishing Stages", icon: BookOpenIcon }, // New tab
                        { key: "royalties", label: "Royalty Tracker", icon: DollarSignIcon }, // New tab
                        { key: "launch", label: "Launch Planner", icon: RocketIcon }, // New tab
                        { key: "calendar", label: "Calendar", icon: CalendarIcon },
                        { key: "analytics", label: "Analytics", icon: BarChart3Icon },
                        { key: "settings", label: "Settings", icon: SettingsIcon },
                    ].map((tabItem) => (
                        <button key={tabItem.key} onClick={() => { setActiveTab(tabItem.key); setSearchParams({ id: id, tab: tabItem.key }) }} className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${activeTab === tabItem.key ? "bg-zinc-100 dark:bg-zinc-800/80" : "hover:bg-zinc-50 dark:hover:bg-zinc-700"}`} >
                            <tabItem.icon className="size-3.5" />
                            {tabItem.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {activeTab === "tasks" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <BookPublishingSteps publishingSteps={tasks} />
                        </div>
                    )}
                    {activeTab === "stages" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <PublishingStagesTab authorBook={book} />
                        </div>
                    )}
                    {activeTab === "royalties" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <RoyaltyTrackerTab authorBook={book} />
                        </div>
                    )}
                    {activeTab === "launch" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <LaunchPlannerTab authorBook={book} />
                        </div>
                    )}
                    {activeTab === "calendar" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <BookCalendar publishingSteps={tasks} />
                        </div>
                    )}
                    {activeTab === "analytics" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <BookAnalytics tasks={tasks} book={book} />
                        </div>
                    )}
                    {activeTab === "settings" && (
                        <div className=" dark:bg-zinc-900/40 rounded max-w-6xl">
                            <BookSettings book={book} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateTask && <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} bookId={id} />}
        </div>
    );
}
