import React from 'react';
import { DollarSignIcon } from 'lucide-react';
import AddRoyaltyDialog from './AddRoyaltyDialog';
import { useState } from 'react';
import { calculateVAT, addVAT } from '../utils/currency';
import { VAT_RATE } from '../utils/constants';

const RoyaltyTrackerTab = ({ authorBook }) => {
  const royalties = authorBook?.royalties || [];
  const [isAddRoyaltyDialogOpen, setIsAddRoyaltyDialogOpen] = useState(false);

  const handleAddRoyalty = () => {
    setIsAddRoyaltyDialogOpen(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Royalty Tracker for {authorBook.name}</h2>
      {authorBook.type === 'HYBRID' ? (
        <div className="space-y-4">
          <button
            onClick={handleAddRoyalty}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            Add Royalty
          </button>

          {royalties.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">No royalty records found for this hybrid book.</p>
          ) : (
            royalties.map((royalty) => (
              <div key={royalty.id} className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <DollarSignIcon className="size-6 text-green-500" />
                <div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-200">Share: {royalty.sharePercentage}%</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">Earnings (Excl. VAT): R{royalty.earnings ? parseFloat(royalty.earnings).toFixed(2) : '0.00'}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Incl. VAT: R{royalty.earnings ? addVAT(royalty.earnings) : '0.00'}</p>
                </div>
              </div>
            ))
          )}
          <AddRoyaltyDialog
              isDialogOpen={isAddRoyaltyDialogOpen}
              setIsDialogOpen={setIsAddRoyaltyDialogOpen}
              authorBookId={authorBook.id}
          />
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">Royalty tracking is only applicable to Hybrid Publishing books.</p>
      )}
    </div>
  );
};

export default RoyaltyTrackerTab;
