import { useEffect, useMemo, useState } from "react";
import { UsersIcon, Search, UserPlus, Shield, Activity } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { useSelector, useDispatch } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import { fetchTeamMembers, updateTeamMemberRole } from "../features/teamMembersSlice";
import { fetchWorkspaceById } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import { assets } from '../assets/assets'; // Corrected import path

const Team = () => {
    const dispatch = useDispatch();
    const { user: clerkUser } = useUser();
    const clerkUserId = clerkUser?.id;

    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { members: teamMembers, status: teamMembersStatus, error: teamMembersError } = useSelector((state) => state.teamMembers);
    const books = currentWorkspace?.books || [];

    useEffect(() => {
        if (currentWorkspace?.id && clerkUserId) {
            dispatch(fetchTeamMembers(currentWorkspace.id));
        }
    }, [dispatch, currentWorkspace?.id, clerkUserId]);

    const filteredMembers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return teamMembers;
        return teamMembers.filter(
            (member) =>
                member?.user_id?.toLowerCase().includes(term) ||
                member?.email?.toLowerCase().includes(term) ||
                member?.full_name?.toLowerCase().includes(term) ||
                member?.role?.toLowerCase().includes(term)
        );
    }, [teamMembers, searchTerm]);

    const handleRoleChange = async (memberId, newRole) => {
        toast.loading("Updating role...");
        try {
            await dispatch(updateTeamMemberRole({ memberId, role: newRole })).unwrap();
            toast.dismiss();
            toast.success("Member role updated!");
        } catch (error) {
            toast.dismiss();
            toast.error(`Failed to update role: ${error.message || error}`);
            console.error("Failed to update team member role:", error);
        }
    };

    const handleChatWithMember = (memberName) => {
        toast.info(`Chat with ${memberName} is not yet implemented.`);
    };

    if (teamMembersStatus === 'loading' || !currentWorkspace) {
        return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading team data...</div>;
    }

    if (teamMembersStatus === 'failed') {
        const errText = typeof teamMembersError === 'string'
            ? teamMembersError
            : (teamMembersError?.message || teamMembersError?.error || 'Failed to load team members');
        return <div className="p-6 text-center text-red-500">Error: {errText}</div>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Team</h1>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">
                        Manage team members and their contributions
                    </p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="flex items-center px-5 py-2 rounded text-sm bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white transition" >
                    <UserPlus className="w-4 h-4 mr-2" /> Invite Member
                </button>
                {/* InviteMemberDialog will be updated to handle actual invites */}
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} workspaceId={currentWorkspace.id} />
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4">
                {/* Total Members */}
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Total Members</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{teamMembers.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/10">
                            <UsersIcon className="size-4 text-blue-500 dark:text-blue-200" />
                        </div>
                    </div>
                </div>

                {/* Active Books - Keep existing logic for now, as books are from workspaceSlice */}
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Active Books</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {books.filter((b) => b.status !== "CANCELLED" && b.status !== "COMPLETED").length}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                            <Activity className="size-4 text-emerald-500 dark:text-emerald-200" />
                        </div>
                    </div>
                </div>

                {/* Total Tasks - Keep existing logic for now, as tasks are from workspaceSlice */}
                <div className="max-sm:w-full dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between gap-8 md:gap-22">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Total Publishing Steps</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{books.reduce((acc, book) => acc + (book.tasks?.length || 0), 0)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/10">
                            <Shield className="size-4 text-purple-500 dark:text-purple-200" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3" />
                <input placeholder="Search team members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full text-sm rounded-md border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 py-2 focus:outline-none focus:border-blue-500" />
            </div>

            {/* Team Members List */}
            <div className="w-full">
                {filteredMembers.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <UsersIcon className="w-12 h-12 text-gray-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {teamMembers.length === 0
                                ? "No team members yet"
                                : "No members match your search"}
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 mb-6">
                            {teamMembers.length === 0
                                ? "Invite team members to start collaborating"
                                : "Try adjusting your search term"}
                        </p>
                    </div>
                ) : (
                    <div className="max-w-4xl w-full">
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto rounded-md border border-gray-200 dark:border-zinc-800">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                                <thead className="bg-gray-50 dark:bg-zinc-900/50">
                                    <tr>
                                        <th className="px-6 py-2.5 text-left font-medium text-sm">
                                            Name
                                        </th>
                                        <th className="px-6 py-2.5 text-left font-medium text-sm">
                                            User ID
                                        </th>
                                        <th className="px-6 py-2.5 text-left font-medium text-sm">
                                            Role
                                        </th>
                                        <th className="px-6 py-2.5 text-left font-medium text-sm">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    {filteredMembers.map((member) => (
                                        <tr
                                            key={member.id}
                                            className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-2.5 whitespace-nowrap flex items-center gap-3">
                                                <img
                                                    src={member.profile_image_url || assets.profile_img_o}
                                                    alt={member.full_name || "Unknown User"}
                                                    className="size-7 rounded-full bg-gray-200 dark:bg-zinc-800"
                                                />
                                                <span className="text-sm text-zinc-800 dark:text-white truncate">
                                                    {member.full_name || "Unknown User"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2.5 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                                                {member.email || "N/A"}
                                            </td>
                                            <td className="px-6 py-2.5 whitespace-nowrap">
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                    className={`px-2 py-1 text-xs rounded-md border ${member.role === "ADMIN"
                                                            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400 border-purple-300 dark:border-purple-600"
                                                            : "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-600"
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="editor">Editor</option>
                                                    <option value="author">Author</option>
                                                    <option value="member">Member</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-2.5 whitespace-nowrap text-sm">
                                                <button onClick={() => handleChatWithMember(member.full_name || member.email)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">Chat</button>
                                                {/* Assign Book button can be added here, opening a dialog */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden space-y-3">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="p-4 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <img
                                            src={member.profile_image_url || assets.profile_img_o}
                                            alt={member.full_name || "Unknown User"}
                                            className="size-9 rounded-full bg-gray-200 dark:bg-zinc-800"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {member.full_name || "Unknown User"}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                                                {member.email || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                            className={`px-2 py-1 text-xs rounded-md border ${member.role === "ADMIN"
                                                    ? "bg-purple-100 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400 border-purple-300 dark:border-purple-600"
                                                    : "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-600"
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="editor">Editor</option>
                                            <option value="author">Author</option>
                                            <option value="member">Member</option>
                                        </select>
                                    </div>
                                    <div className="mt-2">
                                        <button onClick={() => handleChatWithMember(member.full_name || member.email)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">Chat</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
