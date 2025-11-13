import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, BarChart2, TrendingUp, CalendarDays } from 'lucide-react';
import { fetchCampaigns, addCampaign } from '../features/campaignsSlice';
import { format, isFuture, isPast, isToday } from 'date-fns';
import CreateCampaignDialog from '../components/CreateCampaignDialog';
import EditCampaignDialog from '../components/EditCampaignDialog';

const MarketingCampaigns = () => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { campaigns, status: campaignsStatus, error: campaignsError } = useSelector((state) => state.campaigns);
  const [isCreateCampaignDialogOpen, setIsCreateCampaignDialogOpen] = useState(false);
  const [isEditCampaignDialogOpen, setIsEditCampaignDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    if (currentWorkspace?.id) {
      dispatch(fetchCampaigns(currentWorkspace.id));
    }
  }, [dispatch, currentWorkspace?.id]);

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Active') {
      return !isPast(new Date(campaign.start_date)) && !isFuture(new Date(campaign.end_date));
    }
    if (filterStatus === 'Upcoming') {
      return isFuture(new Date(campaign.start_date));
    }
    if (filterStatus === 'Completed') {
      return isPast(new Date(campaign.end_date));
    }
    return campaign.status === filterStatus; // Fallback to direct status match
  });

  const totalCampaigns = filteredCampaigns.length;
  const activeCampaigns = filteredCampaigns.filter(c => !isPast(new Date(c.start_date)) && !isFuture(new Date(c.end_date))).length;
  const upcomingCampaigns = filteredCampaigns.filter(c => isFuture(new Date(c.start_date))).length;

  const handleEditClick = (campaign) => {
    setSelectedCampaign(campaign);
    setIsEditCampaignDialogOpen(true);
  };

  if (campaignsStatus === 'loading' || !currentWorkspace) {
    return <div className="p-6 text-center text-gray-500 dark:text-zinc-400">Loading marketing campaigns...</div>;
  }

  if (campaignsStatus === 'failed') {
    return <div className="p-6 text-center text-red-500">Error: {campaignsError}</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Marketing Campaigns</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">Manage author PR and social media posts here.</p>
        </div>
        <button onClick={() => setIsCreateCampaignDialogOpen(true)} className="flex items-center gap-2 px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white space-x-2 hover:opacity-90 transition">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {/* Campaign Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border p-5 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800 flex items-center gap-4">
          <BarChart2 className="size-6 text-blue-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Campaigns</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCampaigns}</p>
          </div>
        </div>
        <div className="rounded-lg border p-5 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800 flex items-center gap-4">
          <TrendingUp className="size-6 text-emerald-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Campaigns</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCampaigns}</p>
          </div>
        </div>
        <div className="rounded-lg border p-5 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800 flex items-center gap-4">
          <CalendarDays className="size-6 text-orange-500" />
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Upcoming Campaigns</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingCampaigns}</p>
          </div>
        </div>
      </div>

      {/* Campaign Filters */}
      <div className="flex justify-end mb-4">
        <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm">
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Recent Campaigns List */}
      <div className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Campaigns List</h2>
        {filteredCampaigns.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No campaigns found {filterStatus !== 'All' ? `for status: ${filterStatus}` : ''} .</p>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map(campaign => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={() => handleEditClick(campaign)}
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{campaign.title}</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {campaign.start_date ? format(new Date(campaign.start_date), 'PPP') : 'N/A'} to {campaign.end_date ? format(new Date(campaign.end_date), 'PPP') : 'N/A'}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {campaign.platforms?.join(', ') || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateCampaignDialog
        isOpen={isCreateCampaignDialogOpen}
        onClose={() => setIsCreateCampaignDialogOpen(false)}
      />

      <EditCampaignDialog
        isOpen={isEditCampaignDialogOpen}
        onClose={() => setIsEditCampaignDialogOpen(false)}
        existingCampaign={selectedCampaign}
      />

    </div>
  );
};

export default MarketingCampaigns;
