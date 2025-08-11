import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function ContactForm({ onMessageSent }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/contact', form);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => onMessageSent?.(res.data.data), 500);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 px-4">
      {/* Background Animated Circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md w-full mx-auto">
        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 px-8 py-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-teal-400/20 animate-pulse"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-1 select-none drop-shadow-sm">Get in Touch</h2>
              <p className="text-teal-100 text-sm">Send us a message and we'll get back to you shortly.</p>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-2 right-4 w-6 h-6 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-white/40 rounded-full"></div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="px-8 py-8 space-y-6" aria-label="contact form">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center text-gray-700 font-semibold text-sm">
                <svg
                  className="w-4 h-4 mr-2 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A4 4 0 117.5 9.5a4 4 0 01-2.379 8.304zM15 20h3.5a2.5 2.5 0 002.5-2.5V14"
                  />
                </svg>
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter your name"
                value={form.name}
                onChange={updateField('name')}
                disabled={submitting}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                autoComplete="name"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center text-gray-700 font-semibold text-sm">
                <svg
                  className="w-4 h-4 mr-2 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                value={form.email}
                onChange={updateField('email')}
                disabled={submitting}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                autoComplete="email"
              />
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label htmlFor="message" className="flex items-center text-gray-700 font-semibold text-sm">
                <svg
                  className="w-4 h-4 mr-2 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 8h10M7 12h5m-5 4h7"
                  />
                </svg>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                placeholder="Write your message here..."
                value={form.message}
                onChange={updateField('message')}
                disabled={submitting}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 resize-none text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 font-semibold rounded-xl text-white transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                submitting
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center">Send Message</div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
