import { useState, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRightIcon, SettingsIcon, KanbanIcon, ChartColumnIcon, CalendarIcon, ArrowRightIcon, BookOpenIcon, DollarSignIcon, RocketIcon } from 'lucide-react';
import { useSelector, shallowEqual } from 'react-redux';

const BooksSidebar = () => {

    const location = useLocation();

    const [expandedBooks, setExpandedBooks] = useState(new Set());
    const [searchParams] = useSearchParams();

    const books = useSelector(
        (state) => state?.workspace?.currentWorkspace?.books || [],
        shallowEqual
    );

    const getBookSubItems = (bookId) => [
        { title: 'Manuscripts / Book Drafts', icon: KanbanIcon, url: `/authorBooksDetail?id=${bookId}&tab=publishingSteps` },
        { title: 'Publishing Stages', icon: BookOpenIcon, url: `/authorBooksDetail?id=${bookId}&tab=stages` },
        { title: 'Royalty Tracker', icon: DollarSignIcon, url: `/authorBooksDetail?id=${bookId}&tab=royalties` }, // New sub-item
        { title: 'Launch Planner', icon: RocketIcon, url: `/authorBooksDetail?id=${bookId}&tab=launch` }, // New sub-item
        { title: 'Analytics', icon: ChartColumnIcon, url: `/authorBooksDetail?id=${bookId}&tab=analytics` },
        { title: 'Calendar', icon: CalendarIcon, url: `/authorBooksDetail?id=${bookId}&tab=calendar` },
        { title: 'Settings', icon: SettingsIcon, url: `/authorBooksDetail?id=${bookId}&tab=settings` }
    ];

    const toggleBook = (id) => {
        const newSet = new Set(expandedBooks);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setExpandedBooks(newSet);
    };

    return (
        <div className="mt-6 px-3">
            <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Author Books
                </h3>
                <Link to="/books">
                    <button className="size-5 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded flex items-center justify-center transition-colors duration-200">
                        <ArrowRightIcon className="size-3" />
                    </button>
                </Link>
            </div>

            <div className="space-y-1 px-3">
                {books.map((book) => (
                    <div key={book.id}>
                        <button onClick={() => toggleBook(book.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white" >
                            <ChevronRightIcon className={`size-3 text-gray-500 dark:text-zinc-400 transition-transform duration-200 ${expandedBooks.has(book.id) && 'rotate-90'}`} />
                            <div className="size-2 rounded-full bg-blue-500" />
                            <span className="truncate max-w-40 text-sm">{book.name}</span>
                        </button>

                        {expandedBooks.has(book.id) && (
                            <div className="ml-5 mt-1 space-y-1">
                                {getBookSubItems(book.id).map((subItem) => {
                                    // checking if the current path matches the sub-item's URL
                                    const isActive =
                                        location.pathname === `/authorBooksDetail` &&
                                        searchParams.get('id') === book.id &&
                                        searchParams.get('tab') === subItem.title.toLowerCase().replace(/\s\/\s/g, '/').replace(/\s/g, '-');

                                    return (
                                        <Link key={subItem.title} to={subItem.url} className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs ${isActive ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20' : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'}`} >
                                            <subItem.icon className="size-3" />
                                            {subItem.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BooksSidebar;