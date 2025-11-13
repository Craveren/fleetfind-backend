import React from 'react';
import { RocketIcon } from 'lucide-react';
import { format } from 'date-fns';

const LaunchPlannerTab = ({ authorBook }) => {
  const launchPlans = authorBook?.launchPlans || [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Launch Planner for {authorBook.name}</h2>
      <div className="space-y-4">
        {launchPlans.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No launch plans defined for this book.</p>
        ) : (
          launchPlans.map((plan) => (
            <div key={plan.id} className="flex items-start gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <RocketIcon className="size-6 text-orange-500" />
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-200">Launch Date: {plan.launchDate ? format(new Date(plan.launchDate), 'PPP') : 'N/A'}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">Status: {plan.status}</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">Budget: R{plan.marketingBudget ? plan.marketingBudget.toFixed(2) : '0.00'}</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">Channels: {(plan.promotionChannels || []).join(', ')}</p>
                {plan.notes && <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">Notes: {plan.notes}</p>}
              </div>
            </div>
          ))
        )}
        {/* TODO: Add UI for adding/editing launch plans */}
      </div>
    </div>
  );
};

export default LaunchPlannerTab;
