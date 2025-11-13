import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaceById, fetchWorkspaces } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { assets } from '../assets/assets'; // Import assets for fallback image

function WorkspaceDropdown() {

    const { workspaces, status } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newWsName, setNewWsName] = useState("");
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = async (organizationId) => {
        await dispatch(fetchWorkspaceById(organizationId));
        // refresh list in background so counts reflect the new workspace
        dispatch(fetchWorkspaces());
        setIsOpen(false);
        navigate('/');
    }

    const createWorkspace = async () => {
        if (!newWsName.trim()) return;
        try {
            const res = await fetch('http://localhost:5000/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newWsName }),
            });
            if (!res.ok) {
                // eslint-disable-next-line no-console
                console.error('Failed to create workspace');
                setShowCreate(false);
                return;
            }
            const data = await res.json();
            setShowCreate(false);
            setNewWsName("");
            // Redirect to root; initial loader will fetch workspaces again on app mount
            onSelectWorkspace(data.id);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            setShowCreate(false);
        }
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (status === 'loading') {
      return <div className="p-4 text-center text-gray-500 dark:text-zinc-400">Loading workspaces...</div>;
    }

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center gap-2 p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                <img src={currentWorkspace?.image_url || assets.profile_img_o} alt={currentWorkspace?.name || "Selected Workspace"} className="w-8 h-8 rounded shadow" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm whitespace-normal break-words line-clamp-2">
                        {currentWorkspace?.name || "Select Workspace"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0 overflow-hidden">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            Workspaces
                        </p>
                        {workspaces.length === 0 ? (
                          <p className="text-center text-sm text-gray-500 dark:text-zinc-400 py-2">No workspaces available.</p>
                        ) : (
                          workspaces.map((ws) => (
                            <div key={ws.id} onClick={() => onSelectWorkspace(ws.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                                <img src={ws.image_url || assets.profile_img_o} alt={ws.name} className="w-6 h-6 rounded" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                        {ws.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                        {ws.membersCount || 0} members
                                    </p>
                                </div>
                                {currentWorkspace?.id === ws.id && (
                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                )}
                            </div>
                          ))
                        )}
                    </div>

                    <hr className="border-gray-200 dark:border-zinc-700" />

                    <div className="p-2">
                        {showCreate ? (
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    value={newWsName}
                                    onChange={(e) => setNewWsName(e.target.value)}
                                    placeholder="Workspace name"
                                    className="min-w-0 w-0 flex-1 max-w-full px-2 py-1 rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm"
                                />
                                <button onClick={createWorkspace} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Create</button>
                                <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowCreate(true)} className="w-full p-2 rounded group hover:bg-gray-100 dark:hover:bg-zinc-800 text-left">
                                <span className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
                                    <Plus className="w-4 h-4" /> Create Workspace
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
