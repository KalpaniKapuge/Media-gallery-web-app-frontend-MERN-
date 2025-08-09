// src/pages/MyMessages.jsx
import { useEffect, useState, useCallback } from 'react';
import MessageList from '../components/MessageList.jsx';
import api from '../api.js';
import toast from 'react-hot-toast';

export default function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📥 Loading user messages...');
      const res = await api.get('/contact/my-messages');
      console.log('📋 Received messages:', res.data);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      const errorMessage = err?.response?.data?.error || 'Failed to load messages';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMessageDeleted = (deletedId) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg._id !== deletedId));
    toast.success('Message deleted successfully');
  };

  return (
    <main className="min-h-screen p-8 text-white bg-gradient-to-br from-teal-600 to-cyan-700">
      {/* Background blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-400 rounded-full opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-teal-400 rounded-full opacity-15 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-20 w-48 h-48 bg-cyan-300 rounded-full opacity-25 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-md">Your Messages</h1>

        {loading ? (
          <div className="text-center text-white bg-white/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            Loading your messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-teal-200 bg-white/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl italic">No messages found.</p>
            <p className="mt-2 text-sm opacity-75">Your sent messages will appear here.</p>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            onMessageDeleted={handleMessageDeleted}
            adminView={false}
          />
        )}
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