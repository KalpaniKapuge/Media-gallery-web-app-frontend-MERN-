import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import MessageList from '../components/MessageList.jsx';
import api from '../api.js';
import toast from 'react-hot-toast';

export default function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading user messages...');
      const res = await api.get('/contact/my-messages');
      console.log('Received messages:', res.data);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error(' Failed to load messages:', err);
      const errorMessage = err?.response?.data?.error || 'Failed to load messages';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const newMessage = location.state?.newMessage;
    if (newMessage) {
      console.log('New message from navigation state:', newMessage);
      setMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg._id === newMessage._id)) {
          return [newMessage, ...prevMessages];
        }
        return prevMessages;
      });
    }
    loadMessages();
  }, [loadMessages, location.state]);

  useEffect(() => {
    const handleMessageSent = () => {
      console.log('MyMessages: messageSent event triggered');
      loadMessages();
    };
    window.addEventListener('messageSent', handleMessageSent);
    return () => window.removeEventListener('messageSent', handleMessageSent);
  }, [loadMessages]);

  const handleMessageDeleted = (deletedId) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== deletedId));
    toast.success('Message deleted successfully');
  };

  const handleMessageUpdated = (updatedMessage) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
    toast.success('Message updated successfully');
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-10 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 px-4 relative overflow-hidden text-gray-800">
      {/* Background animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      

         <div className="bg-white/80 backdrop-blur-sm max-w-4xl w-full mx-auto rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r mb-10  from-teal-500 via-cyan-500 to-teal-600 px-8 py-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-teal-400/20 animate-pulse"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-1">My Messages</h2>
             
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-2 right-4 w-8 h-8 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-5 h-5 bg-white/40 rounded-full"></div>
          </div>

        {loading ? (
          <div className="text-center bg-white/30 rounded-lg p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto mb-4"></div>
            Loading your messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-teal-700 bg-white/30 rounded-lg p-8">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl italic">No messages found.</p>
            <p className="mt-2 text-sm opacity-75">Your sent messages will appear here.</p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            onMessageDeleted={handleMessageDeleted}
            onMessageUpdated={handleMessageUpdated}
            adminView={false}
          />
        )}
      </div>
    </div>
  );
}
