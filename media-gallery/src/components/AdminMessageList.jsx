import { useEffect, useState, useCallback } from "react";
import api from "../api";
import toast from "react-hot-toast";
import {
  FaTrash,
  FaCopy,
  FaSearch,
  FaSync,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

export default function AdminMessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await api.get("/admin/contact-messages");
      } catch {
        res = await api.get("/admin/contact");
      }
      const messageData = res.data.data || res.data || [];
      setMessages(messageData);
      toast.success(`Loaded ${messageData.length} messages`);
    } catch (err) {
      toast.error(
        err?.response?.data?.error || "Failed to load messages"
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = messages.filter((msg) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        msg.name?.toLowerCase().includes(searchLower) ||
        msg.email?.toLowerCase().includes(searchLower) ||
        msg.message?.toLowerCase().includes(searchLower);

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "recent" &&
          new Date(msg.createdAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterBy === "old" &&
          new Date(msg.createdAt) <=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        default:
          return 0;
      }
    });

    setFilteredMessages(filtered);
    setCurrentPage(1);
  }, [messages, searchTerm, sortBy, filterBy]);

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;

    try {
      try {
        await api.delete(`/admin/contact-messages/${id}`);
      } catch {
        await api.delete(`/admin/contact/${id}`);
      }
      toast.success("Message deleted successfully");
      setMessages((m) => m.filter((x) => x._id !== id));
    } catch (e) {
      toast.error(e?.response?.data?.error || "Delete failed");
    }
  };

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(
    indexOfFirstMessage,
    indexOfLastMessage
  );
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <div className="relative max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Admin Messages
        </h1>

        {/* Statistics with glass/gradient */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total", value: messages.length },
            { label: "Filtered", value: filteredMessages.length },
            { label: "Current Page", value: currentMessages.length },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 px-6 py-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-teal-400/20 animate-pulse"></div>
                <div className="relative">
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-teal-100 text-sm">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white/90 backdrop-blur rounded-xl p-4 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all cursor-pointer text-teal-700 bg-white"
            >
              <option value="newest" className="text-teal-700 bg-white">Newest First</option>
              <option value="oldest" className="text-teal-700 bg-white">Oldest First</option>
              <option value="name" className="text-teal-700 bg-white">Name A-Z</option>
              <option value="email" className="text-teal-700 bg-white">Email A-Z</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all cursor-pointer text-teal-700 bg-white"
            >
              <option value="all" className="text-teal-700 bg-white">All</option>
              <option value="recent" className="text-teal-700 bg-white">Last 7 Days</option>
              <option value="old" className="text-teal-700 bg-white">Older than 7 Days</option>
            </select>

          </div>
          {(searchTerm || sortBy !== "newest" || filterBy !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSortBy("newest");
                setFilterBy("all");
              }}
              className="mt-3 w-full py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white rounded-lg transition cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Messages */}
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-600">No messages found.</p>
            <button
              onClick={load}
              className="mt-3 w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <FaSync />
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {currentMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="bg-white rounded-xl shadow-xl hover:shadow-teal-600 border border-gray-100 hover:shadow-md transition"
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-teal-700">
                        {msg.name}{" "}
                        <span className="text-teal-500">
                          &lt;{msg.email}&gt;
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                      <div className="bg-teal-50 mt-10 rounded p-3 ">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                      <div className="mt-4 text-xs text-gray-500">
                        ID: {msg._id}
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition cursor-pointer"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.message);
                          toast.success("Message copied");
                        }}
                        className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white rounded-full flex items-center justify-center transition cursor-pointer"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition cursor-pointer"
                >
                  <FaArrowLeft />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition cursor-pointer"
                >
                  <FaArrowRight />
                </button>
              </div>
            )}
          </>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-6">
          <button
            onClick={load}
            disabled={loading}
            className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition cursor-pointer"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
