import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon } from "lucide-react";
import { assets } from "../assets/assets";
import { addCommentToTask, updateTask } from "../features/workspaceSlice"; // Assuming updateTask is here
import { useUser } from "@clerk/clerk-react";
import { fetchTeamMembers } from "../features/teamMembersSlice";

const TaskDetails = () => {

    const [searchParams] = useSearchParams();
    const bookId = searchParams.get("bookId");
    const taskId = searchParams.get("taskId");

    const { user: clerkUser } = useUser(); // Get Clerk user
    const clerkUserId = clerkUser?.id; // Get Clerk user ID

    const [task, setTask] = useState(null);
    const [book, setBook] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [editedTask, setEditedTask] = useState({});

    const { currentWorkspace, status: workspaceStatus } = useSelector((state) => state.workspace);
    const { members: teamMembers, status: teamMembersStatus } = useSelector((state) => state.teamMembers);
    const notifyPrefs = useSelector((state) => state?.userPreferences?.preferences?.notifications || {});
    const dispatch = useDispatch();

    const fetchTaskDetails = async () => {
        setLoading(true);
        if (!bookId || !taskId || !currentWorkspace) {
          setLoading(false); 
          return;
        }

        const bk = currentWorkspace.books?.find((p) => p.id === bookId);
        if (!bk) {
          setLoading(false);
          return;
        }

        const tsk = bk.tasks?.find((t) => t.id === taskId);
        if (!tsk) {
          setLoading(false);
          return;
        }

        // Enrich task assignee and comment users with full Clerk data (if available)
        const assignee = (teamMembers || []).find(member => member.user_id === (tsk.assignee_id || tsk.assigneeId));
        const enrichedTask = { ...tsk, assignee: assignee };

        setTask(enrichedTask);
        setBook(bk);
        setEditedTask(enrichedTask); // Initialize editedTask state
        setLoading(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !clerkUserId || !task?.id || !book?.id) return;

        try {
            toast.loading("Adding comment...");

            const newCommentObject = {
                id: crypto.randomUUID(),
                userId: clerkUserId, // server expects userId
                content: newComment,
                createdAt: new Date().toISOString(),
            };

            await dispatch(addCommentToTask({ bookId: book.id, taskId: task.id, comment: newCommentObject })).unwrap();
            setNewComment("");
            toast.dismiss();
            toast.success("Comment added.");
            // Notify (in-app or browser) if enabled
            if (notifyPrefs.new_comments) {
                const { tryBrowserNotify } = await import('../utils/notify');
                tryBrowserNotify('New comment', `A new comment was added to "${task.title}".`);
            }
            // Re-fetch task details to update comments with new data
            fetchTaskDetails(); 
        } catch (error) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || error.message);
            console.error(error);
        }
    };

    const handleEditTask = async () => {
        if (!editedTask.title) {
            toast.error("Task title cannot be empty.");
            return;
        }

        try {
            toast.loading("Updating task...");
            await dispatch(updateTask({ ...editedTask, id: taskId, updatedAt: new Date().toISOString() })).unwrap();
            toast.dismiss();
            toast.success("Task updated successfully!");
            setIsEditingTask(false);
            fetchTaskDetails(); // Re-fetch to ensure UI is updated
        } catch (error) {
            toast.dismiss();
            toast.error(`Failed to update task: ${error.message || error}`);
            console.error("Failed to update task:", error);
        }
    };

    useEffect(() => {
        if (currentWorkspace?.id) {
            dispatch(fetchTeamMembers(currentWorkspace.id));
        }
    }, [dispatch, currentWorkspace?.id]);

    useEffect(() => { 
        if (workspaceStatus === 'succeeded' && currentWorkspace) {
            // proceed even if team members haven't loaded yet; we'll enrich later
            fetchTaskDetails();
        }
    }, [taskId, bookId, currentWorkspace, workspaceStatus, teamMembersStatus, teamMembers]);

    if (loading || workspaceStatus === 'loading') return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task details...</div>;
    if (!task) return <div className="text-red-500 px-4 py-6">Task not found.</div>;

    // Filter comments based on fetched task comments and enrich with Clerk user data
    const commentsWithUserData = (task.comments || []).map(comment => {
        const commentUser = teamMembers.find(member => member.user_id === comment.user_id);
        return { ...comment, user: commentUser };
    });

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">
            {/* Left: Comments / Chatbox */}
            <div className="w-full lg:w-2/3">
                <div className="p-5 rounded-md  border border-gray-300 dark:border-zinc-800  flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Manuscript / Book Draft Discussion ({commentsWithUserData.length})
                    </h2>

                    <div className="flex-1 md:overflow-y-scroll no-scrollbar">
                        {commentsWithUserData.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {commentsWithUserData.map((comment) => (
                                    <div key={comment.id} className={`sm:max-w-4/5 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-md ${comment.user?.user_id === clerkUserId ? "ml-auto" : "mr-auto"}`} >
                                        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400">
                                            <img src={comment.user?.profile_image_url || assets.profile_img_o} alt="avatar" className="size-5 rounded-full" />
                                            <span className="font-medium text-gray-900 dark:text-white">{comment.user?.full_name || 'Unknown User'}</span>
                                            <span className="text-xs text-gray-400 dark:text-zinc-600">
                                                • {comment.createdAt ? format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm") : 'N/A'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 dark:text-zinc-200">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-zinc-500 mb-4 text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleAddComment();
                            }}
                            placeholder="Write a comment... (Ctrl/Cmd + Enter to post)"
                            className="w-full dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                            rows={3}
                        />
                        <button onClick={handleAddComment} disabled={!newComment.trim()} className="bg-gradient-to-l from-blue-500 to-blue-600 transition-colors text-white text-sm px-5 py-2 rounded disabled:opacity-50" >
                            Post
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Task + Book Info */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                {/* Task Info */}
                <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 ">
                    <div className="mb-3">
                        <div className="flex justify-between items-center">
                            <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                            <button onClick={() => setIsEditingTask(true)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                <PenIcon className="size-4" />
                            </button>
                        </div>
                        {isEditingTask ? (
                            <input
                                type="text"
                                value={editedTask.title}
                                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        ) : (
                            <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 text-xs">
                                {task.status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-300 text-xs">
                                {task.type}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-green-200 dark:bg-emerald-900 text-green-900 dark:text-emerald-300 text-xs">
                                {task.priority}
                            </span>
                        </div>
                    </div>
    
                    {isEditingTask ? (
                        <textarea
                            value={editedTask.description}
                            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                            rows={4}
                            className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    ) : (
                        task.description && (
                            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>
                        )
                    )}
    
                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />
    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                            <img src={task.assignee?.profile_image_url || assets.profile_img_o} className="size-5 rounded-full" alt="avatar" />
                            {task.assignee?.full_name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500" />
                            Due : {task.due_date ? format(new Date(task.due_date), "dd MMM yyyy") : 'N/A'}
                        </div>
                    </div>
                    {isEditingTask && (
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setIsEditingTask(false)} className="px-4 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                                Cancel
                            </button>
                            <button onClick={handleEditTask} className="px-4 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition">
                                Save
                            </button>
                        </div>
                    )}
                </div>
    
                {/* Book Info */}
                {book && (
                    <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800 ">
                        <p className="text-xl font-medium mb-4">Author Book Details</p>
                        <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2"> <PenIcon className="size-4" /> {book.name}</h2>
                        <p className="text-xs mt-3">Book Start Date: {book.start_date ? format(new Date(book.start_date), "dd MMM yyyy") : 'N/A'}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
                            <span>Status: {book.status}</span>
                            <span>Priority: {book.priority}</span>
                            <span>Progress: {book.progress}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
