import React, { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [totalMedia, setTotalMedia] = useState(0);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/media");
        const items = res.data?.data || res.data || [];
        setTotalMedia(items.length);
        const rec = items
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);
        setRecent(rec);
      } catch (err) {
        console.error("Dashboard load error", err);
        toast.error("Failed to load media");
        setTotalMedia(0);
        setRecent([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-14 text-center text-teal-700 drop-shadow-lg">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Total Media Card */}
          <div className="rounded-3xl shadow-xl border border-white/25 bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 flex flex-col justify-center items-center h-48 text-white">
            <div className="text-4xl font-extrabold">{loading ? "..." : totalMedia}</div>
            <div className="text-xl mt-3 tracking-wide font-medium opacity-90">
              Total Media
            </div>
          </div>

          {/* Recent Uploads Card */}
          <div className="rounded-3xl shadow-xl border border-white/25 bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 flex flex-col justify-center items-center h-48 text-white">
            <div className="text-4xl font-extrabold">{loading ? "..." : recent.length}</div>
            <div className="text-xl mt-3 tracking-wide font-medium opacity-90">
              Recent Uploads
            </div>
          </div>

          {/* User Profile Card */}
          <div className="rounded-3xl shadow-xl border border-white/25 bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 h-48 flex flex-col justify-center items-center p-6 text-white">
            <div className="flex flex-col items-center gap-4">
              {user?.profilePic && user.profilePic !== "/uploads/default-avatar.png" && user.profilePic !== "undefined" ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="h-14 w-14 rounded-full object-cover shadow-lg border-4 border-white"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                  {user?.name?.[0] || "U"}
                </div>
              )}
              <h2 className="text-xl font-bold">{user ? user.name : "Guest"}</h2>
              <p className="text-sm opacity-90">{user ? user.email : "Not logged in"}</p>
              <p className="capitalize text-xs opacity-70">Role: {user?.role || "No role"}</p>
            </div>
          </div>
        </div>

        {/* Recent Uploads Section */}
        <section className="relative max-w-7xl mx-auto rounded-3xl border border-gray-300 bg-white shadow-lg p-8">
          <h2 className="text-3xl font-extrabold mb-8 text-teal-700">
            Recent Uploads
          </h2>

          {loading ? (
            <div className="text-teal-600 font-semibold text-lg">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="text-teal-600 font-semibold text-lg">No recent uploads</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {recent.map((it) => (
                <a
                  key={it._id}
                  href={`/image/${it._id}`}
                  className="block rounded-2xl shadow-md hover:shadow-teal-500 transition-transform transform hover:scale-[1.03] overflow-hidden bg-white border border-gray-200"
                  title={it.title}
                >
                  <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={it.url}
                      alt={it.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-teal-700 truncate text-lg">{it.title}</div>
                    <div className="text-xs text-teal-500 mt-1">
                      {new Date(it.createdAt).toLocaleString()}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
