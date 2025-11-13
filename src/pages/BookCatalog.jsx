import React from 'react';
import Books from './Books';

export default function BookCatalog() {
  return (
    <div className="space-y-2">
      <div className="max-w-6xl mx-auto px-0 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Book Catalog</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm">Browse all books with search and filters.</p>
      </div>
      <Books />
    </div>
  );
}


