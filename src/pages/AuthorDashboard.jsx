import React from 'react';
import { useSelector } from 'react-redux';
import BookCard from '../components/BookCard';
import { DollarSignIcon, Percent } from 'lucide-react';
import { convertToZAR, calculateVAT, addVAT, formatZAR } from '../utils/currency';
import { VAT_RATE } from '../utils/constants';

export default function AuthorDashboard() {
  const { currentWorkspace, status } = useSelector((state) => state.workspace);
  const language = useSelector((state) => state?.userPreferences?.preferences?.language_preference) || 'en-ZA';
  const authorBooks = currentWorkspace?.books || [];

  if (status === 'loading' || !currentWorkspace) {
    return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading author dashboard...</div>;
  }

  const totalEstimatedRoyaltiesUSD = authorBooks.filter(book => book.type === 'HYBRID').flatMap(book => book.royalties || []).reduce((sum, royalty) => sum + (parseFloat(royalty.earnings) || 0), 0);
  const totalEstimatedRoyaltiesZARExclVAT = convertToZAR(totalEstimatedRoyaltiesUSD);
  const estimatedVATAmount = calculateVAT(totalEstimatedRoyaltiesZARExclVAT);
  const totalEstimatedRoyaltiesZARInclVAT = addVAT(totalEstimatedRoyaltiesZARExclVAT);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Author Dashboard</h1>
      <p className="text-gray-500 dark:text-zinc-400 text-sm">Welcome, Author! Here's an overview of your publishing books.</p>

      {/* Royalty Overview */}
      <div className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Royalty Overview</h2>
        <div className="flex items-center gap-4">
          <DollarSignIcon className="size-6 text-green-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Estimated Royalties (Excl. VAT)</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatZAR(parseFloat(totalEstimatedRoyaltiesZARExclVAT), language)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Incl. VAT: {formatZAR(parseFloat(totalEstimatedRoyaltiesZARInclVAT), language)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Percent className="size-6 text-orange-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Estimated VAT (15%)</p>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-400">
              {formatZAR(parseFloat(estimatedVATAmount), language)}
            </p>
          </div>
        </div>
      </div>

      {/* Author Books */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authorBooks.length === 0 ? (
          <p className="col-span-full text-center text-zinc-600 dark:text-zinc-400">No author books found.</p>
        ) : (
          authorBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))
        )}
      </div>
    </div>
  );
}
