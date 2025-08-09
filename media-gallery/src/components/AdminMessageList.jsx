// src/components/AdminMessagesList.jsx
import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function AdminMessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📥 Loading admin messages...');
      
      // Try both possible endpoints to ensure compatibility
      let res;
      try {
        res = await api.get('/admin/contact-messages');
      } catch (err) {
        // Fallback to the other endpoint
        res = await api.get('/admin/contact');
      }
      
      console.log('📋 Admin messages received:', res.data);
      const messageData = res.data.data || res.data || [];
      setMessages(messageData);
      toast.success(`Loaded ${messageData.length} messages`);
    } catch (err) {
      console.error('❌ Failed to load admin messages:', err);
      const errorMessage = err?.response?.data?.error || 'Failed to load messages';
      toast.error(errorMessage);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Filter and sort messages
  useEffect(() => {
    let filtered = messages.filter(msg => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        msg.name?.toLowerCase().includes(searchLower) ||
        msg.email?.toLowerCase().includes(searchLower) ||
        msg.message?.toLowerCase().includes(searchLower);

      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'recent' && new Date(msg.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterBy === 'old' && new Date(msg.createdAt) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesFilter;
    });

    // Sort messages
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        default:
          return 0;
      }
    });

    setFilteredMessages(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [messages, searchTerm, sortBy, filterBy]);

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    
    try {
      console.log('🗑️ Deleting admin message:', id);
      
      // Try both possible endpoints
      try {
        await api.delete(`/admin/contact-messages/${id}`);
      } catch (err) {
        // Fallback to the other endpoint
        await api.delete(`/admin/contact/${id}`);
      }
      
      toast.success('Message deleted successfully');
      setMessages((m) => m.filter((x) => x._id !== id));
      console.log('✅ Message deleted successfully');
    } catch (e) {
      console.error('❌ Delete failed:', e);
      const errorMessage = e?.response?.data?.error || 'Delete failed';
      toast.error(errorMessage);
    }
  };

  // Pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <main className="min-h-screen p-8 text-white bg-gradient-to-br from-purple-600 to-indigo-700">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-md">
            Admin - All Messages
          </h1>
          <div className="text-center text-white bg-white/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            Loading messages...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 text-white bg-gradient-to-br from-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-400 rounded-full opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-indigo-400 rounded-full opacity-15 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-20 w-48 h-48 bg-purple-300 rounded-full opacity-25 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-md">
          Admin - All Messages
        </h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-purple-200">{messages.length}</div>
            <div className="text-sm text-purple-300">Total Messages</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-purple-200">{filteredMessages.length}</div>
            <div className="text-sm text-purple-300">Filtered Results</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm text-center">
            <div className="text-2xl font-bold text-purple-200">{currentMessages.length}</div>
            <div className="text-sm text-purple-300">Current Page</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Search Messages
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or message content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-purple-400 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-purple-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="newest" className="bg-purple-800">Newest First</option>
                <option value="oldest" className="bg-purple-800">Oldest First</option>
                <option value="name" className="bg-purple-800">Name A-Z</option>
                <option value="email" className="bg-purple-800">Email A-Z</option>
              </select>
            </div>

            {/* Filter By */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Filter By
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-purple-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="all" className="bg-purple-800">All Messages</option>
                <option value="recent" className="bg-purple-800">Last 7 Days</option>
                <option value="old" className="bg-purple-800">Older than 7 Days</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || sortBy !== 'newest' || filterBy !== 'all') && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSortBy('newest');
                  setFilterBy('all');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Messages List */}
        {!messages.length ? (
          <div className="text-center text-purple-200 bg-white/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl">No messages found.</p>
            <button
              onClick={load}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              Refresh Messages
            </button>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center text-purple-200 bg-white/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl">No messages match your search criteria.</p>
            <p className="text-sm opacity-75 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {currentMessages.map((msg) => (
                <div 
                  key={msg._id} 
                  className="bg-white/10 backdrop-blur-sm border border-purple-400 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div className="text-lg font-semibold text-purple-100">
                            {msg.name} <span className="text-purple-300">&lt;{msg.email}&gt;</span>
                          </div>
                          <div className="text-sm text-purple-300 mt-1 sm:mt-0">
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {/* User Info (if available) */}
                        {msg.userId && (
                          <div className="mb-3 text-sm text-purple-200 bg-white/5 rounded-lg p-2">
                            <span className="font-medium">Registered User:</span> {msg.userId.name} ({msg.userId.email})
                          </div>
                        )}

                        {/* Message Content */}
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-sm text-purple-200 mb-2 font-medium">Message:</div>
                          <p className="text-white whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </p>
                        </div>

                        {/* Message Stats */}
                        <div className="mt-3 text-xs text-purple-300 flex gap-4">
                          <span>ID: {msg._id}</span>
                          <span>Length: {msg.message?.length || 0} chars</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:ml-4">
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.message);
                            toast.success('Message copied to clipboard');
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-purple-200 text-sm">
                    Showing {indexOfFirstMessage + 1} to {Math.min(indexOfLastMessage, filteredMessages.length)} of {filteredMessages.length} messages
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded transition-colors duration-200"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-3 py-1 rounded transition-colors duration-200 ${
                            currentPage === pageNumber
                              ? 'bg-purple-500 text-white'
                              : 'bg-purple-700 hover:bg-purple-600 text-purple-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded transition-colors duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-6">
          <button
            onClick={load}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {loading ? 'Loading...' : '🔄 Refresh Messages'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </main>
  );
}