import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function MessageList({ messages = [], adminView = false, onMessageDeleted }) {
  const [adminMessages, setAdminMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminView) {
      // Only fetch admin messages if adminView is true
      const fetchAdminMessages = async () => {
        try {
          setLoading(true);
          console.log('📥 Loading admin messages...');
          const res = await api.get('/admin/contact');
          console.log('📋 Admin messages received:', res.data);
          setAdminMessages(res.data.data || []);
        } catch (err) {
          console.error('❌ Error loading admin messages:', err);
          const errorMessage = err?.response?.data?.error || 'Error loading admin messages';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchAdminMessages();
    }
  }, [adminView]);

  const deleteMsg = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting message:', id);
      if (adminView) {
        await api.delete(`/admin/contact/${id}`);
        setAdminMessages((msgs) => msgs.filter((m) => m._id !== id));
        toast.success('Message deleted successfully');
      } else {
        await api.delete(`/contact/${id}`);
        if (onMessageDeleted) {
          onMessageDeleted(id);
        } else {
          toast.success('Message deleted. Refresh to see updates.');
        }
      }
    } catch (err) {
      console.error('❌ Delete failed:', err);
      const errorMessage = err?.response?.data?.error || 'Delete failed';
      toast.error(errorMessage);
    }
  };

  const msgsToShow = adminView ? adminMessages : messages;

  if (adminView && loading) {
    return (
      <div className="text-center text-white bg-white/10 rounded-lg p-8 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        Loading messages...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {msgsToShow.map((m) => (
        <div key={m._id} className="bg-white/10 backdrop-blur-sm border border-teal-400 p-4 rounded-lg text-white shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="text-sm text-teal-200 mb-1">
                <span className="font-semibold">From:</span> {m.name}
              </div>
              <div className="text-sm text-teal-200 mb-1">
                <span className="font-semibold">Email:</span> {m.email}
              </div>
              {adminView && m.userId && (
                <div className="text-sm text-teal-300 mb-2">
                  <span className="font-semibold">User:</span> {m.userId.name} ({m.userId.email})
                </div>
              )}
              <div className="text-xs text-teal-300 mb-2">
                <span className="font-semibold">Sent:</span> {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <div className="text-sm text-teal-200 mb-1 font-semibold">Message:</div>
            <p className="text-white whitespace-pre-wrap">{m.message}</p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => deleteMsg(m._id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}