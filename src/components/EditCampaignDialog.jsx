import React, { useState, useEffect } from 'react';
import { X, CalendarDays, BookOpen, Tag, DollarSign, EditIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import { updateCampaign } from '../features/campaignsSlice';
import { selectAllBooks } from '../features/workspaceSlice';
import toast from 'react-hot-toast';

const platforms = ['Facebook', 'TikTok', 'Instagram', 'Amazon', 'Takealot'];
const campaignStatuses = ['Upcoming', 'Active', 'Completed', 'Cancelled'];

const EditCampaignDialog = ({ isOpen, onClose, existingCampaign }) => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const allBooks = useSelector(selectAllBooks);

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('Upcoming');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && existingCampaign) {
      setTitle(existingCampaign.title || '');
      setStartDate(existingCampaign.start_date ? new Date(existingCampaign.start_date) : null);
      setEndDate(existingCampaign.end_date ? new Date(existingCampaign.end_date) : null);
      setSelectedBooks(existingCampaign.books || []);
      setSelectedPlatforms(existingCampaign.platforms || []); // Ensure platforms are correctly initialized
      setBudget(existingCampaign.budget_zar ? existingCampaign.budget_zar.toString() : '');
      setStatus(existingCampaign.status || 'Upcoming');
    } else if (!isOpen) {
      // Reset form when dialog closes
      setTitle('');
      setStartDate(null);
      setEndDate(null);
      setSelectedBooks([]);
      setSelectedPlatforms([]);
      setBudget('');
      setStatus('Upcoming');
    }
  }, [isOpen, existingCampaign]);

  const handleBookSelect = (bookId) => {
    setSelectedBooks(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const handlePlatformSelect = (e) => {
    const platform = e.target.value;
    const isChecked = e.target.checked;
    setSelectedPlatforms(prev =>
      isChecked ? [...prev, platform] : prev.filter(p => p !== platform)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentWorkspace || !existingCampaign?.id) {
      toast.error("Workspace or Campaign not found.");
      return;
    }

    if (!title || !startDate || !endDate || selectedPlatforms.length === 0) {
      toast.error("Please fill in all required fields (Title, Dates, Platforms).");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Updating campaign...");

    try {
      const campaignData = {
        workspace_id: currentWorkspace.id,
        title,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status,
        platforms: selectedPlatforms,
        budget_zar: budget ? parseFloat(budget) : 0,
        books: selectedBooks,
        performance_stats: existingCampaign.performance_stats || {},
      };

      await dispatch(updateCampaign({ campaignId: existingCampaign.id, updatedData: campaignData })).unwrap();
      toast.dismiss();
      toast.success("Campaign updated successfully!");
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to update campaign: ${error.message || error}`);
      console.error("Failed to update campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-2xl text-zinc-900 dark:text-zinc-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <EditIcon className="size-5" /> Edit Marketing Campaign
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-1">Campaign Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-1">Start Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4 pointer-events-none" />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="w-full pl-9 p-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  dateFormat="yyyy/MM/dd"
                  placeholderText="Select start date"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-1">End Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4 pointer-events-none" />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="w-full pl-9 p-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  dateFormat="yyyy/MM/dd"
                  placeholderText="Select end date"
                  required
                />
              </div>
            </div>
          </div>

          {/* Associated Books */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-1">Associated Books</label>
            <div className="flex flex-wrap gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 dark:bg-zinc-800">
              {allBooks.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-zinc-400">No books available in this workspace.</p>
              ) : (
                allBooks.map(book => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleBookSelect(book.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedBooks.includes(book.id) ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600'}`}
                  >
                    <BookOpen className="inline-block mr-1 size-3" /> {book.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-1">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(platform => (
                <label key={platform} htmlFor={`platform-${platform}`} className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`platform-${platform}`}
                    value={platform}
                    checked={selectedPlatforms.includes(platform)}
                    onChange={handlePlatformSelect}
                    className="form-checkbox size-4 text-blue-600 rounded dark:bg-zinc-700 dark:border-zinc-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-zinc-900 dark:text-zinc-200">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-1">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {campaignStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-1">Budget (R)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">R</span>
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-7 p-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 1500.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaignDialog;
