import { SearchIcon, PanelLeft } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom';
import { UserButton, SignInButton, useUser, useClerk } from '@clerk/clerk-react'; // Clerk UI

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);
    const { isSignedIn } = useUser() || {};
    const { signOut } = useClerk();

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 sm:px-6 xl:px-16 py-3 flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <PanelLeft size={20} />
                    </button>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
                        <input
                            type="text"
                            placeholder="Search author books, manuscripts, publishing steps..."
                            className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3 shrink-0">

                    {/* Author Dashboard Link (Temporary, will be role-based later) */}
                    <Link to="/author-dashboard" className="hidden md:inline-flex px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-all">
                        Author Dashboard
                    </Link>

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-4 text-yellow-400" />)
                        }
                    </button>

                    {/* Auth */}
                    {isSignedIn ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => signOut(() => window.location.assign('/landing'))} className="px-3 py-2 rounded-lg text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                Sign out
                            </button>
                            <UserButton afterSignOutUrl="/landing" />
                        </div>
                    ) : (
                        <SignInButton mode="modal">
                            <button className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:opacity-90 transition">
                                Sign in
                            </button>
                        </SignInButton>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Navbar
