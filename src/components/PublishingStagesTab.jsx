import React from 'react';
import { CheckCircle2Icon, CircleDashedIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updatePublishingStage } from '../features/workspaceSlice';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PublishingStagesTab = ({ authorBook }) => {
  const dispatch = useDispatch();
  const publishingStages = authorBook?.publishingStages || [];

  const handleToggleCompletion = async (stage) => {
    const newActualEndDate = stage.actualEndDate ? null : new Date().toISOString();

    toast.loading("Updating stage status...");
    try {
      await dispatch(updatePublishingStage({
        stageId: stage.id,
        updatedData: { actual_end_date: newActualEndDate, name: stage.name, description: stage.description, order: stage.order },
      })).unwrap();
      toast.dismiss();
      toast.success("Publishing stage updated!");
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to update stage: ${error.message || error}`);
      console.error("Failed to update publishing stage:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Publishing Stages for {authorBook.name}</h2>
      <div className="space-y-4">
        {publishingStages.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No publishing stages defined for this book.</p>
        ) : (
          [...publishingStages].sort((a, b) => a.order - b.order).map((stage) => (
            <div key={stage.id} className="flex items-start gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <button onClick={() => handleToggleCompletion(stage)} className="pt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
                {stage.actual_end_date ? <CheckCircle2Icon className="size-5 text-emerald-500" /> : <CircleDashedIcon className="size-5 text-zinc-500 dark:text-zinc-400" />}
              </button>
              <div>
                <h3 className={`font-semibold text-lg ${stage.actual_end_date ? 'text-gray-500 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-200'}`}>{stage.name}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{stage.description}</p>
                {stage.actual_end_date && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Completed on: {format(new Date(stage.actual_end_date), "dd MMM yyyy")}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* TODO: Implement UI for managing publishing stages (e.g., reordering, adding/editing stages, marking complete) */}
    </div>
  );
};

export default PublishingStagesTab;
