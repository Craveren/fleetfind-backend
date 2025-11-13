import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { updateTask, deleteTask } from "../features/workspaceSlice";
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Trash, XIcon, Zap, FileTextIcon, BookTextIcon, BookOpenIcon } from "lucide-react";
import { assets } from '../assets/assets';

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-600 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-600 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-green-600 dark:text-green-400" },
    IMPROVEMENT: { icon: GitCommit, color: "text-purple-600 dark:text-purple-400" },
    OTHER: { icon: MessageSquare, color: "text-amber-600 dark:text-amber-400" },
    MANUSCRIPT: { icon: FileTextIcon, color: "text-indigo-600 dark:text-indigo-400" },
    BOOK_DRAFT: { icon: BookTextIcon, color: "text-teal-600 dark:text-teal-400" },
    PUBLISHING_STAGE: { icon: BookOpenIcon, color: "text-cyan-600 dark:text-cyan-400" },
};

const priorityTexts = {
    LOW: { background: "bg-red-100 dark:bg-red-950", prioritycolor: "text-red-600 dark:text-red-400" },
    MEDIUM: { background: "bg-blue-100 dark:bg-blue-950", prioritycolor: "text-blue-600 dark:text-blue-400" },
    HIGH: { background: "bg-emerald-100 dark:bg-emerald-950", prioritycolor: "text-emerald-600 dark:text-emerald-400" },
};

const BookPublishingSteps = ({ publishingSteps }) => {
    const [selectedPublishingSteps, setSelectedPublishingSteps] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        status: "",
        type: "",
        priority: "",
        assignee: "",
    });

    const assigneeList = useMemo(
        () => Array.from(new Set(publishingSteps.map((s) => s.assignee?.name).filter(Boolean))),
        [publishingSteps]
    );

    const filteredPublishingSteps = useMemo(() => {
        return publishingSteps.filter((step) => {
            const { status, type, priority, assignee } = filters;
            return (
                (!status || step.status === status) &&
                (!type || step.type === type) &&
                (!priority || step.priority === priority) &&
                (!assignee || step.assignee?.name === assignee)
            );
        });
    }, [filters, publishingSteps]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (stepId, newStatus) => {
        try {
            toast.loading("Updating status...");

            //  Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            let updatedStep = structuredClone(publishingSteps.find((s) => s.id === stepId));
            updatedStep.status = newStatus;
            dispatch(updateTask(updatedStep));

            toast.dismissAll();
            toast.success("Publishing step status updated successfully");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDelete = async () => {
        try {
            const confirm = window.confirm("Are you sure you want to delete the selected publishing steps?");
            if (!confirm) return;

            toast.loading("Deleting publishing steps...");

            // No longer simulating API call, directly dispatching thunk
            await Promise.all(selectedPublishingSteps.map(taskId => dispatch(deleteTask({ taskId })).unwrap()));

            toast.dismissAll();
            toast.success("Publishing steps deleted successfully");
            setSelectedPublishingSteps([]); // Clear selection after deletion
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
                {["status", "type", "priority", "assignee"].map((name) => {
                    const options = {
                        status: [
                            { label: "All Statuses", value: "" },
                            { label: "To Do", value: "TODO" },
                            { label: "In Progress", value: "IN_PROGRESS" },
                            { label: "Done", value: "DONE" },
                        ],
                        type: [
                            { label: "All Types", value: "" },
                            { label: "Manuscript", value: "MANUSCRIPT" },
                            { label: "Book Draft", value: "BOOK_DRAFT" },
                            { label: "Publishing Stage", value: "PUBLISHING_STAGE" },
                            { label: "Other", value: "OTHER" },
                        ],
                        priority: [
                            { label: "All Priorities", value: "" },
                            { label: "Low", value: "LOW" },
                            { label: "Medium", value: "MEDIUM" },
                            { label: "High", value: "HIGH" },
                        ],
                        assignee: [
                            { label: "All Assignees", value: "" },
                            ...assigneeList.map((n) => ({ label: n, value: n })),
                        ],
                    };
                    return (
                        <select key={name} name={name} onChange={handleFilterChange} className=" border not-dark:bg-white border-zinc-300 dark:border-zinc-800 outline-none px-3 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200" >
                            {options[name].map((opt, idx) => (
                                <option key={idx} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    );
                })}

                {/* Reset filters */}
                {(filters.status || filters.type || filters.priority || filters.assignee) && (
                    <button type="button" onClick={() => setFilters({ status: "", type: "", priority: "", assignee: "" })} className="px-3 py-1 flex items-center gap-2 rounded bg-gradient-to-br from-purple-400 to-purple-500 text-zinc-100 dark:text-zinc-200 text-sm transition-colors" >
                        <XIcon className="size-3" /> Reset
                    </button>
                )}

                {selectedPublishingSteps.length > 0 && (
                    <button type="button" onClick={handleDelete} className="px-3 py-1 flex items-center gap-2 rounded bg-gradient-to-br from-indigo-400 to-indigo-500 text-zinc-100 dark:text-zinc-200 text-sm transition-colors" >
                        <Trash className="size-3" /> Delete
                    </button>
                )}
            </div>

            {/* Tasks Table */}
            <div className="overflow-auto rounded-lg lg:border border-zinc-300 dark:border-zinc-800">
                <div className="w-full">
                    {/* Desktop/Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full text-sm text-left not-dark:bg-white text-zinc-900 dark:text-zinc-300">
                            <thead className="text-xs uppercase dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400 ">
                                <tr>
                                    <th className="pl-2 pr-1">
                                        <input onChange={() => selectedPublishingSteps.length > 1 ? setSelectedPublishingSteps([]) : setSelectedPublishingSteps(publishingSteps.map((s) => s.id))} checked={selectedPublishingSteps.length === publishingSteps.length} type="checkbox" className="custom-checkbox align-middle" />
                                    </th>
                                    <th className="px-4 pl-0 py-3">Title</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Priority</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Assignee</th>
                                    <th className="px-4 py-3">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPublishingSteps.length > 0 ? (
                                    filteredPublishingSteps.map((step) => {
                                        const { icon: Icon, color } = typeIcons[step.type] || {};
                                        const { background, prioritycolor } = priorityTexts[step.priority] || {};

                                        return (
                                            <tr key={step.id} onClick={() => navigate(`/taskDetails?bookId=${step.bookId || step.book_id || ''}&taskId=${step.id}`)} className=" border-t border-zinc-300 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer" >
                                                <td onClick={e => e.stopPropagation()} className="pl-2 pr-1">
                                                    <input type="checkbox" className="custom-checkbox align-middle" onChange={() => selectedPublishingSteps.includes(step.id) ? setSelectedPublishingSteps(selectedPublishingSteps.filter((i) => i !== step.id)) : setSelectedPublishingSteps((prev) => [...prev, step.id])} checked={selectedPublishingSteps.includes(step.id)} />
                                                </td>
                                                <td className="px-4 pl-0 py-2">{step.title}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        {Icon && <Icon className={`size-4 ${color}`} />}
                                                        <span className={`uppercase text-xs ${color}`}>{step.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`text-xs px-2 py-1 rounded ${background} ${prioritycolor}`}>
                                                        {step.priority}
                                                    </span>
                                                </td>
                                                <td onClick={e => e.stopPropagation()} className="px-4 py-2">
                                                    <select name="status" onChange={(e) => handleStatusChange(step.id, e.target.value)} value={step.status} className="group-hover:ring ring-zinc-100 outline-none px-2 pr-4 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200 cursor-pointer" >
                                                        <option value="TODO">To Do</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="DONE">Done</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <img src={step.assignee?.image || assets.profile_img_o} className="size-5 rounded-full" alt="avatar" />
                                                        {step.assignee?.name || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                                        <CalendarIcon className="size-4" />
                                                        {format(new Date(step.due_date), "dd MMMM")}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-zinc-500 dark:text-zinc-400 py-6">
                                            No manuscripts/book drafts found for the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Card View */}
                    <div className="lg:hidden flex flex-col gap-4">
                        {filteredPublishingSteps.length > 0 ? (
                            filteredPublishingSteps.map((step) => {
                                const { icon: Icon, color } = typeIcons[step.type] || {};
                                const { background, prioritycolor } = priorityTexts[step.priority] || {};

                                return (
                                    <div key={step.id} className=" dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-zinc-900 dark:text-zinc-200 text-sm font-semibold">{step.title}</h3>
                                            <input type="checkbox" className="custom-checkbox align-middle" onChange={() => selectedPublishingSteps.includes(step.id) ? setSelectedPublishingSteps(selectedPublishingSteps.filter((i) => i !== step.id)) : setSelectedPublishingSteps((prev) => [...prev, step.id])} checked={selectedPublishingSteps.includes(step.id)} />
                                        </div>

                                        <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                            {Icon && <Icon className={`size-4 ${color}`} />}
                                            <span className={`${color} uppercase`}>{step.type}</span>
                                        </div>

                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded ${background} ${prioritycolor}`}>
                                                {step.priority}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="text-zinc-600 dark:text-zinc-400 text-xs">Status</label>
                                            <select name="status" onChange={(e) => handleStatusChange(step.id, e.target.value)} value={step.status} className="w-full mt-1 bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-700 outline-none px-2 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200" >
                                                <option value="TODO">To Do</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="DONE">Done</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                            <img src={step.assignee?.image || assets.profile_img_o} className="size-5 rounded-full" alt="avatar" />
                                            {step.assignee?.name || "-"}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                            <CalendarIcon className="size-4" />
                                            {format(new Date(step.due_date), "dd MMMM")}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">
                                No manuscripts/book drafts found for the selected filters.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookPublishingSteps;
