import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/contact/my-messages');
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contact/${id}`);
      toast.success('Deleted');
      setMessages((m) => m.filter((x) => x._id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
      toast.error('Delete failed');
    }
  };

  const editMessage = async (msg) => {
    const updated = prompt('Edit message', msg.message);
    if (updated === null) return;
    if (!updated.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    try {
      await api.put(`/contact/${msg._id}`, { message: updated.trim() });
      toast.success('Updated');
      await load();
    } catch (e) {
      console.error('Update failed:', e);
      toast.error('Update failed');
    }
  };

  if (loading)
    return (
      <div className="py-6 text-center">
        <div className="inline-block animate-pulse px-6 py-3 bg-teal-900 text-white rounded-lg shadow-lg">
          Loading your messages...
        </div>
      </div>
    );
  if (!messages.length)
    return (
      <div className="py-6 text-center text-gray-600 italic select-none">
        No messages found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className="border border-teal-300 rounded-lg p-5 bg-white bg-opacity-90 shadow-md
                     hover:shadow-xl transition-shadow duration-300 ease-in-out
                     transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="text-xs text-teal-700 font-semibold select-text">
              Sent on{' '}
              <time dateTime={msg.createdAt}>
                {new Date(msg.createdAt).toLocaleString()}
              </time>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => editMessage(msg)}
                className="text-xs bg-teal-100 text-teal-800 px-3 py-1 rounded-lg
                           hover:bg-teal-200 shadow-sm transition duration-200"
                aria-label={`Edit message sent on ${new Date(msg.createdAt).toLocaleString()}`}
              >
                Edit
              </button>
              <button
                onClick={() => deleteMessage(msg._id)}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg
                           hover:bg-red-200 shadow-sm transition duration-200"
                aria-label={`Delete message sent on ${new Date(msg.createdAt).toLocaleString()}`}
              >
                Delete
              </button>
            </div>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-gray-800 text-sm leading-relaxed select-text">
            {msg.message}
          </p>
        </div>
      ))}
    </div>
  );
}
