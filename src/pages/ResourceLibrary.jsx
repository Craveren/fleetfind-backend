import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, FileText, BookOpen, ExternalLink, Upload } from 'lucide-react';
import { fetchResources, incrementResourceView, addResource } from '../features/resourceLibrarySlice';
import toast from 'react-hot-toast';

const ResourceLibrary = () => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { resources, status: resourcesStatus, error: resourcesError } = useSelector((state) => state.resourceLibrary);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspace?.id) {
      const queryParams = {
        workspace_id: currentWorkspace.id,
        ...(filterCategory !== 'All' && { category: filterCategory }),
        ...(searchTerm && { search_term: searchTerm }),
      };
      dispatch(fetchResources(queryParams));
    }
  }, [dispatch, currentWorkspace?.id, filterCategory, searchTerm]);

  const categories = [...new Set(resources.map(resource => resource.category))];

  const handleViewResource = async (resourceId, url) => {
    // Increment view count via API
    try {
      await dispatch(incrementResourceView(resourceId)).unwrap();
      window.open(url, '_blank'); // Open resource in new tab
    } catch (error) {
      toast.error(`Failed to increment view or open resource: ${error.message || error}`);
      console.error("Failed to increment view or open resource:", error);
    }
  };

  if (resourcesStatus === 'loading' || !currentWorkspace) {
    return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading resource library...</div>;
  }

  if (resourcesStatus === 'failed') {
    return <div className="p-6 text-center text-red-500">Error: {resourcesError}</div>;
  }

  const mostViewedResources = [...resources].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  const recentlyAddedResources = [...resources].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Resource Library</h1>
      <p className="text-gray-500 dark:text-zinc-400 text-sm">Explore training materials and helpful guides for authors and editors.</p>

      {/* Search Bar and Add Resource */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-4" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 text-sm pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:border-blue-500 outline-none"
          />
        </div>
        <button onClick={() => setIsAddResourceDialogOpen(true)} className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition">
          <Upload size={16} /> Upload Resource
        </button>
      </div>

      {/* Resource Categories Filter */}
      <div className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Filter by Category</h2>
        <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm w-full md:w-auto">
          <option value="All">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Most Viewed Resources */}
      <div className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Most Viewed Resources</h2>
        {mostViewedResources.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No resources to display.</p>
        ) : (
          <div className="space-y-4">
            {mostViewedResources.map(resource => (
              <div key={resource.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-md">
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="size-4 text-blue-500" /> {resource.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 ml-6">{resource.description}</p>
                  <span className="ml-6 mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400">
                    {resource.category}
                  </span>
                </div>
                <button onClick={() => handleViewResource(resource.id, resource.url)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <ExternalLink className="mr-2 h-4 w-4" /> View Resource ({resource.views || 0})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Added Resources */}
      <div className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recently Added Resources</h2>
        {recentlyAddedResources.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No resources to display.</p>
        ) : (
          <div className="space-y-4">
            {recentlyAddedResources.map(resource => (
              <div key={resource.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-md">
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="size-4 text-blue-500" /> {resource.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 ml-6">{resource.description}</p>
                  <span className="ml-6 mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400">
                    {resource.category}
                  </span>
                </div>
                <button onClick={() => handleViewResource(resource.id, resource.url)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <ExternalLink className="mr-2 h-4 w-4" /> View Resource ({resource.views || 0})
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placeholder for Add Resource Dialog */}
      {/* <AddResourceDialog isOpen={isAddResourceDialogOpen} onClose={() => setIsAddResourceDialogOpen(false)} /> */}
    </div>
  );
};

export default ResourceLibrary;
