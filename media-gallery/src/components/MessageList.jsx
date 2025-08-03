import { useEffect, useState } from 'react';
import api from '../api';

export default function MessageList({ adminView = false }) {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      if (adminView) {
        const res = await api.get('/admin/contact');
        setMessages(res.data);
      } else {
        const res = await api.get('/contact/my-messages');
        setMessages(res.data);
      }
    } catch (e) {
      alert('Error loading messages');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [adminView]);

  const deleteMsg = async (id) => {
    try {
      if (adminView) await api.delete(`/admin/contact/${id}`);
      else await api.delete(`/contact/${id}`);
      fetchMessages();
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div key={m._id} className="border p-3 rounded">
          {adminView && m.userId && (
            <div className="text-sm text-gray-600">
              {m.userId.name} ({m.userId.email})
            </div>
          )}
          <p>{m.message}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => deleteMsg(m._id)} className="text-red-600 underline">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
