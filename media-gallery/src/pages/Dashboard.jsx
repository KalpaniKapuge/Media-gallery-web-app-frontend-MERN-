import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [totalMedia, setTotalMedia] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // load user from localStorage (Navbar uses same storage)
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // backend list endpoint returns many items; we fetch them and compute stats
        const res = await api.get('/media');
        const items = res.data?.data || res.data || [];
        setTotalMedia(items.length);
        // sort by createdAt desc and take 6
        const rec = items
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);
        setRecent(rec);
      } catch (err) {
        console.error('Dashboard load error', err);
        setTotalMedia(0);
        setRecent([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <h3 className="text-sm text-gray-500">Welcome</h3>
          <p className="mt-2 text-lg font-semibold">
            {user ? `Hello, ${user.name}` : 'Hello, Guest'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {user ? user.email : 'Please login to manage your media.'}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-500">Total Media</h3>
          <p className="mt-2 text-3xl font-bold">{loading ? '...' : totalMedia}</p>
          <p className="text-sm text-gray-600 mt-2">All uploaded images in your gallery</p>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-500">Quick Actions</h3>
          <div className="mt-3 flex flex-col gap-2">
            <a href="/upload" className="text-sm px-3 py-2 bg-teal-600 text-white rounded inline-block w-max">Upload Image</a>
            <a href="/gallery" className="text-sm px-3 py-2 bg-gray-100 rounded inline-block w-max">Open Gallery</a>
          </div>
        </div>
      </div>

      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Recent Uploads</h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="text-gray-500">No recent uploads</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recent.map((it) => (
              <a key={it._id} href={`/image/${it._id}`} className="block overflow-hidden rounded-md shadow-sm hover:shadow-md bg-white">
                <div className="w-full h-44 bg-gray-200">
                  <img
                    src={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + it.url}
                    alt={it.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <div className="font-medium truncate">{it.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(it.createdAt).toLocaleString()}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
