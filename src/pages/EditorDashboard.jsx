import React from 'react';
import { useSelector } from 'react-redux';
import BookPublishingSteps from '../components/BookPublishingSteps';
import { CircleDashedIcon, CheckCircle2Icon } from 'lucide-react';

export default function EditorDashboard() {
  const { currentWorkspace, status } = useSelector((state) => state.workspace);
  const books = currentWorkspace?.books || [];

  if (status === 'loading' || !currentWorkspace) {
    return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading editor dashboard...</div>;
  }

  const allTasks = (books || []).flatMap(book =>
    (book.tasks || []).map(task => ({ ...task, bookName: book.name, bookPublishingStages: book.publishingStages }))
  );

  // Filter tasks assigned to the editor (assuming 'user_1' is the editor)
  const editorTasks = allTasks.filter(task => task.assigneeId === 'user_1');

  // Create a map of all publishing stages for easy lookup
  const allPublishingStagesMap = new Map();
  (books || []).forEach(bookItem => {
    bookItem.publishingStages?.forEach(stage => {
      allPublishingStagesMap.set(stage.id, stage);
    });
  });

  // Group editor tasks by publishing stage
  const tasksGroupedByStage = editorTasks.reduce((acc, task) => {
    if (task.publishingStageId) {
      const stage = allPublishingStagesMap.get(task.publishingStageId);
      if (stage) {
        if (!acc[stage.id]) {
          acc[stage.id] = { ...stage, tasks: [] };
        }
        acc[stage.id].tasks.push(task);
      }
    } else {
      // Handle tasks without a publishing stage
      if (!acc.unassigned) {
        acc.unassigned = { id: 'unassigned', name: 'Unassigned', description: 'Tasks not yet assigned to a publishing stage.', order: Infinity, tasks: [] };
      }
      acc.unassigned.tasks.push(task);
    }
    return acc;
  }, {});

  const sortedStages = Object.values(tasksGroupedByStage).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Editor Dashboard</h1>
      <p className="text-gray-500 dark:text-zinc-400 text-sm">Welcome, Editor! Here's an overview of your assigned manuscripts and publishing steps, grouped by stage.</p>

      <div className="space-y-8 mt-6">
        {sortedStages.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No tasks assigned to you or no publishing stages defined.</p>
        ) : (
          sortedStages.map((stage) => (
            <div key={stage.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                {stage.actualEndDate ? <CheckCircle2Icon className="size-5 text-emerald-500" /> : <CircleDashedIcon className="size-5 text-zinc-500 dark:text-zinc-400" />}
                <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-200">{stage.name}</h2>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">{stage.description}</p>

              {stage.tasks.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">No manuscripts or publishing steps in this stage.</p>
              ) : (
                <BookPublishingSteps publishingSteps={stage.tasks} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
