import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import BooksSidebar from './BooksSidebar'
import WorkspaceDropdown from './WorkspaceDropdown'
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon, UserIcon, BookIcon, LineChartIcon, ShoppingCartIcon, GraduationCapIcon, LibraryIcon, PrinterIcon } from 'lucide-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {

    const dashboardItems = [
        { name: 'Main Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Author Dashboard', href: '/author-dashboard', icon: UserIcon },
        { name: 'Editor Dashboard', href: '/editor-dashboard', icon: BookIcon },
    ];

    const bookManagementItems = [
        { name: 'All Author Books', href: '/books', icon: FolderOpenIcon },
        { name: 'Marketing Campaigns', href: '/marketing-campaigns', icon: LineChartIcon },
        { name: 'Book Sales', href: '/book-sales', icon: ShoppingCartIcon },
    ];

    const resourcesAndTeamItems = [
        { name: 'Book Catalog', href: '/book-catalog', icon: GraduationCapIcon },
        { name: 'Resource Library', href: '/resource-library', icon: LibraryIcon },
        { name: 'Team Management', href: '/team', icon: UsersIcon },
        { name: 'Local Print Partners', href: '/local-print-partners', icon: PrinterIcon },
    ];

    const administrationItems = [
        { name: 'App Settings', href: '/settings', icon: SettingsIcon },
    ];

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    return (
        <div
            ref={sidebarRef}
            className={`z-20 bg-white dark:bg-zinc-900 w-64 sm:w-72 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800
            sm:static max-sm:fixed max-sm:inset-y-0 max-sm:left-0
            transition-transform duration-200 ease-in-out
            ${isSidebarOpen ? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'}`}
        >
            <WorkspaceDropdown />
            <hr className='border-gray-200 dark:border-zinc-800' />
            <div className='flex-1 overflow-y-scroll no-scrollbar flex flex-col'>
                <div className='p-4'>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase px-4 mb-2">Dashboards</h3>
                    {dashboardItems.map((item) => (
                        <NavLink to={item.href} key={item.name} className={({ isActive }) => `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${isActive ? 'bg-gray-100 dark:bg-zinc-900 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50 dark:ring-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'}`} >
                            <item.icon size={16} />
                            <p className='text-sm truncate'>{item.name}</p>
                        </NavLink>
                    ))}
                </div>
                <MyTasksSidebar />

                <hr className='my-4 border-gray-200 dark:border-zinc-800' />

                <div className='p-4 pt-0'>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase px-4 mb-2">Books & Projects</h3>
                    {bookManagementItems.map((item) => (
                        <NavLink to={item.href} key={item.name} className={({ isActive }) => `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${isActive ? 'bg-gray-100 dark:bg-zinc-900 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50 dark:ring-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'}`} >
                            <item.icon size={16} />
                            <p className='text-sm truncate'>{item.name}</p>
                        </NavLink>
                    ))}
                </div>
                <BooksSidebar />

                <hr className='my-4 border-gray-200 dark:border-zinc-800' />

                <div className='p-4 pt-0'>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase px-4 mb-2">Tools & Resources</h3>
                    {resourcesAndTeamItems.map((item) => (
                        <NavLink to={item.href} key={item.name} className={({ isActive }) => `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${isActive ? 'bg-gray-100 dark:bg-zinc-900 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50 dark:ring-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'}`} >
                            <item.icon size={16} />
                            <p className='text-sm truncate'>{item.name}</p>
                        </NavLink>
                    ))}
                </div>

                <hr className='my-4 border-gray-200 dark:border-zinc-800' />

                <div className='p-4 pt-0'>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase px-4 mb-2">Administration</h3>
                    {administrationItems.map((item) => (
                        <NavLink to={item.href} key={item.name} className={({ isActive }) => `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${isActive ? 'bg-gray-100 dark:bg-zinc-900 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50 dark:ring-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'}`} >
                            <item.icon size={16} />
                            <p className='text-sm truncate'>{item.name}</p>
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
