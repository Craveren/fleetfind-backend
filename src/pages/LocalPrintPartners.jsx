import React, { useEffect, useRef, useState } from 'react';
import { PrinterIcon, MapPinIcon, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const LocalPrintPartners = () => {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', url: '', location: '' });
  const hasFetched = useRef(false);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const qs = new URLSearchParams();
      qs.set('category', 'PRINT_PARTNER');
      if (currentWorkspace?.id) qs.set('workspace_id', currentWorkspace.id);
      const res = await fetch(`http://localhost:5000/api/resources?${qs.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to fetch partners');
      }
      const data = await res.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError(e?.message || 'Server unreachable');
      // avoid spamming toasts under StrictEffects
      if (!hasFetched.current) toast.error('Failed to load print partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchPartners();
  }, []);

  const addPartner = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location) {
      toast.error('Title and location are required');
      return;
    }
    try {
      toast.loading('Adding partner...');
      const res = await fetch('http://localhost:5000/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: currentWorkspace?.id || null,
          title: form.title,
          category: 'PRINT_PARTNER',
          description: `${form.description || ''}${form.location ? ` | ${form.location}` : ''}`.trim(),
          url: form.url || '',
          uploaded_by: null,
        }),
      });
      toast.dismiss();
      if (!res.ok) {
        const err = await res.json();
        toast.error(err?.error || 'Failed to add partner');
        return;
      }
      toast.success('Partner added');
      setForm({ title: '', description: '', url: '', location: '' });
      fetchPartners();
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to add partner');
    }
  };

  const removePartner = async (id) => {
    try {
      toast.loading('Removing...');
      const res = await fetch(`http://localhost:5000/api/resources/${id}`, { method: 'DELETE' });
      toast.dismiss();
      if (!res.ok) {
        const err = await res.json();
        toast.error(err?.error || 'Failed to remove');
        return;
      }
      toast.success('Removed');
      setPartners((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Local Print Partners</h1>
      <p className="text-gray-500 dark:text-zinc-400 text-sm">Manage local printing partners in South Africa for your book production needs.</p>

      {/* Add Partner */}
      <form onSubmit={addPartner} className="rounded-lg border p-4 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
        <h2 className="text-md font-semibold mb-3 text-zinc-900 dark:text-zinc-200">Add Partner</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Partner name" className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Website URL (optional)" className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
          <div className="flex">
            <button type="submit" className="ml-auto px-4 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center gap-1">
              <Plus className="size-4" /> Add
            </button>
          </div>
        </div>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description (optional)" className="w-full mt-3 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-sm" />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        ) : partners.length === 0 ? (
          <div>
            {loadError ? (
              <p className="text-red-600 dark:text-red-400">
                {loadError} — ensure the backend server is running on http://localhost:5000.
              </p>
            ) : (
              <p className="text-zinc-600 dark:text-zinc-400">No partners yet. Add your first partner above.</p>
            )}
          </div>
        ) : (
          partners.map((p) => (
            <div key={p.id} className="rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800">
              <PrinterIcon className="size-8 text-blue-600 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{p.title}</h2>
              <p className="text-sm text-gray-700 dark:text-zinc-300">{p.description || '—'}</p>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-blue-600 hover:underline text-sm">Visit Website</a>
              )}
              <div className="flex justify-end pt-4">
                <button onClick={() => removePartner(p.id)} className="px-3 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600 flex items-center gap-1">
                  <Trash2 className="size-4" /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LocalPrintPartners;
