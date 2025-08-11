import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function MessageList({ messages = [], adminView = false, onMessageDeleted, onMessageUpdated }) {
  const [adminMessages, setAdminMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (adminView) {
      const fetchAdminMessages = async () => {
        try {
          setLoading(true);
          const res = await api.get('/admin/contact');
          setAdminMessages(res.data.data || []);
        } catch (err) {
          toast.error(err?.response?.data?.error || 'Error loading admin messages');
        } finally {
          setLoading(false);
        }
      };
      fetchAdminMessages();
    }
  }, [adminView]);

  const deleteMsg = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    setDeletingId(id);
    try {
      if (adminView) {
        await api.delete(`/admin/contact/${id}`);
        setAdminMessages((msgs) => msgs.filter((m) => m._id !== id));
        toast.success('Message deleted successfully');
      } else {
        await api.delete(`/contact/${id}`);
        onMessageDeleted?.(id);
        toast.success('Message deleted');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (message) => {
    setEditingId(message._id);
    setEditMessage(message.message);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditMessage('');
  };

  const saveEdit = async (id) => {
    if (!editMessage.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    try {
      const res = await api.put(`/contact/${id}`, { message: editMessage });
      toast.success('Message updated successfully');
      setEditingId(null);
      setEditMessage('');
      onMessageUpdated?.(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update message');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const msgsToShow = adminView ? adminMessages : messages;

  // Loading state for admin view
  if (adminView && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-teal-600 border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold text-teal-800 mb-2">Loading Messages</h3>
            <p className="text-teal-600">Fetching your messages...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (msgsToShow.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-teal-800 mb-3">No Messages Yet</h3>
            <p className="text-teal-600 text-lg">
              {adminView 
                ? "No contact messages have been received yet." 
                : "You haven't sent any messages yet. Start a conversation!"
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  from-teal-50 via-cyan-50 to-blue-50 py-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-100/10 to-cyan-100/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mb-6 shadow-xl">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-teal-800 mb-3">
            {adminView ? 'Contact Messages' : 'Your Messages'}
          </h2>
          <p className="text-teal-600 text-lg">
            {adminView 
              ? `Managing ${msgsToShow.length} contact message${msgsToShow.length !== 1 ? 's' : ''}` 
              : `You have ${msgsToShow.length} message${msgsToShow.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Messages Grid */}
        <div className="space-y-6">
          {msgsToShow.map((message, index) => (
            <div
              key={message._id}
              className="group bg-white/70 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {/* Message Header */}
              <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 px-8 py-6 border-b border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {message.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    </div>
                    
                    {/* Sender Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-teal-800 truncate">
                          {message.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          {adminView ? 'Contact' : 'Sent'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-teal-600">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{message.email}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      </div>
                      
                      {adminView && message.userId && (
                        <div className="mt-2 flex items-center space-x-1 text-sm text-cyan-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>User: {message.userId.name} ({message.userId.email})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="px-8 py-6">
                {editingId === message._id && !adminView ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border-2 border-teal-200 rounded-2xl focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-300 text-teal-900 resize-none shadow-inner"
                        rows={4}
                        placeholder="Edit your message..."
                      />
                      <div className="absolute top-3 right-3 text-xs text-teal-500">
                        {editMessage.length} characters
                      </div>
                    </div>
                    
                   <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => saveEdit(message._id)}
                    className="group relative flex items-center justify-center w-11 h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl"
                    title="Save changes"
                  >
                    <svg
                      className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>

                  </button>

                  <button
                    onClick={cancelEditing}
                    className="group relative flex items-center justify-center w-11 h-11 bg-gray-500 hover:bg-gray-600 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl"
                    title="Cancel editing"
                  >
                    <svg
                      className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>

                  
                  </button>
                </div>


                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50 backdrop-blur-sm rounded-2xl p-6 border border-teal-100/50">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-teal-800 leading-relaxed whitespace-pre-wrap font-medium">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-4 bg-gradient-to-r from-gray-50/50 to-white/50 border-t border-white/20">
                <div className="flex gap-4 justify-end">
                  {!adminView && editingId !== message._id && (
                    <button
                      onClick={() => startEditing(message)}
                      className="group relative flex items-center justify-center w-11 h-11 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl"
                      title="Edit message"
                    >
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      
                      
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteMsg(message._id)}
                    disabled={deletingId === message._id}
                    className="group relative flex items-center justify-center w-11 h-11 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-red-300 disabled:to-pink-300 text-white rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none"
                    title={deletingId === message._id ? "Deleting..." : "Delete message"}
                  >
                    {deletingId === message._id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    
                   
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Message Count */}
        <div className="text-center mt-12 p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30">
          <p className="text-teal-600 font-medium">
            {adminView 
              ? `Total contact messages: ${msgsToShow.length}` 
              : `You have ${msgsToShow.length} message${msgsToShow.length !== 1 ? 's' : ''} in your inbox`
            }
          </p>
        </div>
      </div>

      {/* Add CSS animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}