// AdminMessagesList.jsx
import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function AdminMessagesList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/contact-messages');
      setMessages(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await api.delete(`/admin/contact-messages/${id}`);
      toast.success('Deleted');
      setMessages((m) => m.filter((x) => x._id !== id));
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="py-6 text-center">Loading messages...</div>;
  if (!messages.length) return <div className="py-6 text-center text-gray-600">No messages.</div>;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {messages.map((msg) => (
        <div key={msg._id} className="border rounded-lg p-4 bg-white shadow flex justify-between">
          <div>
            <div className="text-sm font-semibold">
              {msg.name} &lt;{msg.email}&gt;
            </div>
            <div className="text-xs text-gray-500 mb-1">
              {new Date(msg.createdAt).toLocaleString()}
            </div>
            <p className="whitespace-pre-wrap">{msg.message}</p>
          </div>
          <div className="flex flex-col justify-start gap-2">
            <button
              onClick={() => deleteMessage(msg._id)}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
