import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
      toast.success(`Loaded ${res.data.length} users`);
    } catch (e) {
      toast.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/user/${user._id}`, {
        name: user.name,
        role: user.role,
        isActive: !user.isActive,
      });
      toast.success(
        `${user.name} is now ${user.isActive ? "Deactivated" : "Activated"}`
      );
      load();
    } catch (e) {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          User Management
        </h2>

        {/* User list container with glassmorphism style */}
        <div className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg border border-gray-100 space-y-4">
          {users.length === 0 ? (
            <div className="text-center text-gray-600 py-10 text-lg">
              No users found.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-teal-400 transition"
              >
                <div>
                  <div className="text-lg font-semibold text-teal-700">
                    {u.name}
                  </div>
                  <div className="text-sm text-teal-500">{u.email}</div>
                  <div className="text-sm text-gray-500">Role: {u.role}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      u.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.isActive ? "Active" : "Deactivated"}
                  </span>

                  <button
                    onClick={() => toggleActive(u)}
                    className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                      u.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-teal-500 hover:bg-teal-600"
                    }`}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={load}
            disabled={loading}
            className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition cursor-pointer"
          >
            <svg
              className={`w-6 h-6 animate-spin`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
