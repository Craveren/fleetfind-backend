import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Plus, Search, FolderOpen } from "lucide-react";
import BookCard from "../components/BookCard";
import CreateBookDialog from "../components/CreateBookDialog";
import useDebouncedValue from "../utils/useDebouncedValue";

export default function Books() {
    
    const { currentWorkspace, status } = useSelector((state) => state.workspace);
    const books = currentWorkspace?.books || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: "ALL",
        priority: "ALL",
    });
    const debouncedSearch = useDebouncedValue(searchTerm, 200);

    const filteredBooks = useMemo(() => {
        let filtered = books || [];
        const term = debouncedSearch.trim().toLowerCase();
        if (term) {
            filtered = filtered.filter(
                (book) =>
                    book.name.toLowerCase().includes(term) ||
                    book.description?.toLowerCase().includes(term)
            );
        }
        if (filters.status !== "ALL") {
            filtered = filtered.filter((book) => book.status === filters.status);
        }
        if (filters.priority !== "ALL") {
            filtered = filtered.filter((book) => book.priority === filters.priority);
        }
        return filtered;
    }, [books, debouncedSearch, filters]);

    // "Did you mean" suggestions based on title similarity
    const suggestions = useMemo(() => {
        if (!searchTerm || filteredBooks.length > 0) return [];
        const term = searchTerm.trim().toLowerCase();
        const titles = (books || []).map((b) => b.name);
        const score = (a, b) => {
            // simple similarity: common subsequence length over avg length
            const s1 = a.toLowerCase(), s2 = b.toLowerCase();
            let i = 0, j = 0, common = 0;
            while (i < s1.length && j < s2.length) {
                if (s1[i] === s2[j]) { common++; i++; j++; } else { s1[i] < s2[j] ? i++ : j++; }
            }
            const denom = (s1.length + s2.length) / 2 || 1;
            return common / denom;
        };
        const ranked = titles
            .map((t) => ({ t, s: score(term, t) }))
            .filter((x) => x.s > 0.2)
            .sort((a, b) => b.s - a.s)
            .slice(0, 3)
            .map((x) => x.t);
        return ranked;
    }, [searchTerm, filteredBooks, books]);

    if (status === 'loading' || !currentWorkspace) {
        return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading books...</div>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1"> Author Books </h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm"> Manage and track your author books </p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="flex items-center px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition" >
                    <Plus className="size-4 mr-2" /> New Author Book
                </button>
                <CreateBookDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-400 w-4 h-4" />
                    <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} className="w-full pl-10 text-sm pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:border-blue-500 outline-none" placeholder="Search author books..." />
                </div>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm" >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PLANNING">Planning</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm" >
                    <option value="ALL">All Priority</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <FolderOpen className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            No author books found
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-sm">
                            Create your first author book to get started
                        </p>
                        {searchTerm && suggestions.length > 0 && (
                            <div className="mb-6 text-sm text-gray-600 dark:text-zinc-400">
                                Did you mean:{' '}
                                {suggestions.map((s, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSearchTerm(s)}
                                        className="underline text-blue-600 dark:text-blue-400 mx-1"
                                    >
                                        {s}
                                    </button>
                                ))}
                                ?
                            </div>
                        )}
                        <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mx-auto text-sm" >
                            <Plus className="size-4" />
                            Create Author Book
                        </button>
                    </div>
                ) : (
                    filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))
                )}
            </div>
        </div>
    );
}
