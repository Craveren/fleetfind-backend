import { FolderOpen, CheckCircle, Users, AlertTriangle, Percent } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DollarSignIcon } from 'lucide-react';
import { convertToZAR, calculateVAT, addVAT, formatZAR } from '../utils/currency';
import { VAT_RATE } from '../utils/constants';

export default function StatsGrid() {
    const currentWorkspace = useSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );
    const navigate = useNavigate();
    const language = useSelector((state) => state?.userPreferences?.preferences?.language_preference) || 'en-ZA';

    const [stats, setStats] = useState({
        totalBooks: 0,
        activeBooks: 0,
        completedBooks: 0,
        myPublishingSteps: 0,
        overdueIssues: 0,
        totalRoyalties: 0,
    });

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Books",
            value: stats.totalBooks,
            subtitle: `books in ${currentWorkspace?.name}`,
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-500",
        },
        {
            icon: CheckCircle,
            title: "Completed Books",
            value: stats.completedBooks,
            subtitle: `of ${stats.totalBooks} total`,
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-500",
        },
        {
            icon: Users,
            title: "My Publishing Steps",
            value: stats.myPublishingSteps,
            subtitle: "assigned to me",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-500",
        },
        {
            icon: DollarSignIcon,
            title: "Total Royalties (Excl. VAT)",
            value: formatZAR(parseFloat(convertToZAR(stats.totalRoyalties)), language),
            subtitle: `Incl. VAT: ${formatZAR(parseFloat(addVAT(convertToZAR(stats.totalRoyalties))), language)} estimated earnings`,
            bgColor: "bg-green-500/10",
            textColor: "text-green-500",
        },
        {
            icon: Percent,
            title: "Estimated VAT (15%)",
            value: formatZAR(parseFloat(calculateVAT(convertToZAR(stats.totalRoyalties))), language),
            subtitle: "on estimated earnings",
            bgColor: "bg-orange-500/10",
            textColor: "text-orange-500",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-500",
        },
    ];

    useEffect(() => {
        if (currentWorkspace) {
            setStats({
                totalBooks: currentWorkspace.books?.length || 0,
                activeBooks: currentWorkspace.books?.filter(
                    (b) => b.status !== "CANCELLED" && b.status !== "COMPLETED"
                )?.length || 0,
                completedBooks: currentWorkspace.books?.filter((b) => b.status === "COMPLETED")
                    ?.reduce((acc, book) => acc + (book.tasks?.length || 0), 0) || 0,
                myPublishingSteps: currentWorkspace.books?.reduce(
                    (acc, book) =>
                        acc +
                        (book.tasks?.filter(
                            (t) => t.assignee?.email === currentWorkspace.owner?.email
                        )?.length || 0),
                    0
                ) || 0,
                overdueIssues: currentWorkspace.books?.reduce(
                    (acc, book) =>
                        acc + (book.tasks?.filter((t) => t.due_date < new Date()).length || 0),
                    0
                ) || 0,
                totalRoyalties: currentWorkspace.books?.filter(book => book.type === 'HYBRID')
                    .flatMap(book => book.royalties || [])
                    .reduce((sum, royalty) => sum + (parseFloat(royalty.earnings) || 0), 0) || 0,
            });
        }
    }, [currentWorkspace]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-9">
            {statCards.map(
                ({ icon: Icon, title, value, subtitle, bgColor, textColor }, i) => (
                    <button
                        key={i}
                        className="text-left elevated radius-card hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => {
                            if (title.includes("Royalties")) navigate("/book-sales");
                            else if (title.includes("Overdue")) navigate("/books");
                            else if (title.includes("Completed")) navigate("/books");
                        }}
                    >
                        <div className="p-6 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                                        {title}
                                    </p>
                                    <p className="text-3xl font-bold text-zinc-800 dark:text-white">
                                        {value}
                                    </p>
                                    {subtitle && (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl ${bgColor} bg-opacity-20`}>
                                    <Icon size={20} className={textColor} />
                                </div>
                            </div>
                        </div>
                    </button>
                )
            )}
        </div>
    );
}
