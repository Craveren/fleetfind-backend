import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addRoyalty } from '../features/workspaceSlice';
import toast from 'react-hot-toast';

const AddRoyaltyDialog = ({ isDialogOpen, setIsDialogOpen, authorBookId }) => {
    const [sharePercentage, setSharePercentage] = useState('');
    const [earnings, setEarnings] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!sharePercentage || !earnings) {
            toast.error('Please fill in all fields.');
            return;
        }

        const newRoyalty = {
            id: crypto.randomUUID(),
            sharePercentage: Number(sharePercentage),
            earnings: Number(earnings),
            authorBookId,
            bookId: authorBookId, // Assuming bookId is the same as authorBookId for simplicity
        };

        dispatch(addRoyalty({ authorBookId, royalty: newRoyalty }));
        toast.success('Royalty added successfully!');
        setIsDialogOpen(false);
        setSharePercentage('');
        setEarnings('');
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 relative">
                <button className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" onClick={() => setIsDialogOpen(false)} >
                    <XIcon className="size-5" />
                </button>

                <h2 className="text-xl font-medium mb-4">Add New Royalty</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Share Percentage (%)</label>
                        <input
                            type="number"
                            value={sharePercentage}
                            onChange={(e) => setSharePercentage(e.target.value)}
                            placeholder="e.g., 50"
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Earnings (R) <span className="text-xs text-zinc-500 dark:text-zinc-400">(Excl. VAT)</span></label>
                        <input
                            type="number"
                            value={earnings}
                            onChange={(e) => setEarnings(e.target.value)}
                            placeholder="e.g., 1500.75"
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 text-sm">
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(false)}
                            className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:text-zinc-200">
                            Add Royalty
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRoyaltyDialog;
