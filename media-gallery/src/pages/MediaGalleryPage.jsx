import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import ZipPanel from '../components/ZipPanel';

export default function MediaGalleryPage() {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // backend expects q or tags? We'll use q and tags query params. Backend listMedia supports $text search and tags exact match.
      const params = {};
      if (search && search.trim()) params.q = search.trim();
      if (tags && tags.trim()) params.tag = tags.trim(); // backend looks for filter.tags = tag (single)
      const res = await api.get('/media', { params });
      const items = res.data?.data || res.data || [];
      // For image URL compatibility: backend stores url like "/uploads/filename" — prepend API base for images in <img src>
      setMedia(items);
    } catch (err) {
      console.error('load gallery', err);
      toast.error('Failed to load gallery');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [search, tags]);

  useEffect(() => {
    load();
    // debounce for search/tags
  }, [load]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, tags, load]);

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectAll = () => setSelected(media.map((m) => m._id));
  const clearSelection = () => setSelected([]);

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/media/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deleted');
      await load();
      setSelected((s) => s.filter((x) => x !== id));
    } catch (err) {
      console.error('delete error', err);
      toast.error('Delete failed');
    }
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} items?`)) return;
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selected.map((id) => api.delete(`/media/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
      toast.success('Deleted selected items');
      setSelected([]);
      await load();
    } catch (err) {
      console.error('bulk delete', err);
      toast.error('Failed to delete some items');
    }
  };

  // quick inline edit using prompt (replace with modal in future)
  const editItem = async (item) => {
    const title = window.prompt('Title', item.title || '');
    if (title === null) return;
    const description = window.prompt('Description', item.description || '');
    if (description === null) return;
    const tags = window.prompt('Tags (comma separated)', (item.tags || []).join(', '));
    if (tags === null) return;
    try {
      const token = localStorage.getItem('token');
      await api.put(`/media/${item._id}`, { title, description, tags }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Updated');
      await load();
    } catch (err) {
      console.error('edit failed', err);
      toast.error('Update failed');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">Media Gallery</h1>
        <div className="flex gap-2">
          <a href="/upload" className="px-3 py-2 bg-teal-600 text-white rounded">Upload</a>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title/description..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Filter by tag"
          className="w-64 px-3 py-2 border rounded"
        />
        <button onClick={load} className="px-3 py-2 bg-gray-200 rounded">Apply</button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{selected.length} selected</span>
          <button onClick={selectAll} className="px-2 py-1 bg-teal-600 text-white rounded text-sm">Select all</button>
          <button onClick={clearSelection} className="px-2 py-1 bg-gray-200 rounded text-sm">Clear</button>
          <button onClick={bulkDelete} className="px-2 py-1 bg-red-600 text-white rounded text-sm" disabled={!selected.length}>Delete selected</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 animate-pulse rounded" />
          ))
        ) : media.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No media found</div>
        ) : (
          media.map((item) => (
            <div key={item._id} className={`bg-white rounded shadow overflow-hidden ${selected.includes(item._id) ? 'ring-2 ring-teal-500' : ''}`}>
              <div className="relative h-44 bg-gray-200">
                <a href={`/image/${item._id}`}>
                  <img src={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + item.url} alt={item.title} className="w-full h-full object-cover" />
                </a>
                <div className="absolute top-2 left-2">
                  <input type="checkbox" checked={selected.includes(item._id)} onChange={() => toggleSelect(item._id)} />
                </div>
              </div>

              <div className="p-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold truncate">{item.title}</div>
                    <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => editItem(item)} className="text-xs px-2 py-1 bg-yellow-100 rounded">Edit</button>
                    <button onClick={() => deleteItem(item._id)} className="text-xs px-2 py-1 bg-red-100 rounded">Delete</button>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.slice(0, 4).map((t, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ZIP panel (component shows selection & download) */}
      <div className="mt-6">
        <ZipPanel selectedIds={selected} onDownloaded={() => setSelected([])} />
      </div>
    </div>
  );
}
