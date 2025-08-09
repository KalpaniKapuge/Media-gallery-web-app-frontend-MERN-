import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function ImageDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [allIds, setAllIds] = useState([]); // for prev/next
  const navigate = useNavigate();

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await api.get('/media');
        const items = res.data?.data || res.data || [];
        setAllIds(items.map((it) => it._id));
      } catch (err) {
        console.error('load all', err);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/media/${id}`);
        setItem(res.data?.data || res.data);
      } catch (err) {
        console.error('load item', err);
        toast.error('Failed to load image');
      }
    };
    if (id) load();
  }, [id]);

  if (!item) return <div className="p-6">Loading...</div>;

  const idx = allIds.indexOf(id);
  const prevId = idx > 0 ? allIds[idx - 1] : null;
  const nextId = idx >= 0 && idx < allIds.length - 1 ? allIds[idx + 1] : null;

  const handleDelete = async () => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/media/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deleted');
      navigate('/gallery');
    } catch (err) {
      console.error('delete error', err);
      toast.error('Delete failed');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="bg-black rounded overflow-hidden">
            <img src={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + item.url} alt={item.title} className="w-full max-h-[70vh] object-contain" />
          </div>

          <div className="flex gap-2 mt-3">
            {prevId && <a href={`/image/${prevId}`} className="px-3 py-2 bg-gray-100 rounded">Prev</a>}
            {nextId && <a href={`/image/${nextId}`} className="px-3 py-2 bg-gray-100 rounded">Next</a>}
            <a href={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + item.url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-green-600 text-white rounded">Open Full</a>
          </div>
        </div>

        <aside className="w-80">
          <div className="card">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{item.description || 'No description'}</p>

            <div className="mt-3">
              <div className="text-xs text-gray-500">Tags</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(item.tags || []).map((t, i) => <span key={i} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">{t}</span>)}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div>Uploaded: {new Date(item.createdAt).toLocaleString()}</div>
              <div>Owner: {item.owner || 'Unknown'}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={handleDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
              <a href="/gallery" className="px-3 py-2 bg-gray-100 rounded">Back</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
