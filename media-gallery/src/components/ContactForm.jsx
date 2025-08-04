// ContactForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent');
      setForm({ name: '', email: '', message: '' });
      navigate('/my-messages');
    } catch (err) {
      console.error('Contact submit error:', err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to send message';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
   <form
  onSubmit={onSubmit}
  className="
    max-w-xs mx-auto mt-8 bg-red bg-opacity-20 backdrop-blur-md
    border border-teal-300 rounded-xl shadow-md 
    p-4 space-y-2
  "
  style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
>

      <h2 className="text-xl font-semibold text-teal-700 text-center drop-shadow-sm select-none">
        Get in Touch
      </h2>
      <div className="space-y-3">
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={updateField('name')}
          disabled={submitting}
          className="
            w-full px-3 py-2 border border-teal-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-cyan-300 
            transition duration-300 ease-in-out placeholder:text-gray-400 text-sm
            bg-transparent
          "
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={updateField('email')}
          disabled={submitting}
          className="
            w-full px-3 py-2 border border-teal-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-cyan-300 
            transition duration-300 ease-in-out placeholder:text-gray-400 text-sm
            bg-transparent
          "
        />
        <textarea
          required
          placeholder="Message"
          value={form.message}
          onChange={updateField('message')}
          disabled={submitting}
          rows={3}
          className="
            w-full px-3 py-2 border border-teal-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-cyan-300 
            transition duration-300 ease-in-out resize-none placeholder:text-gray-400 text-sm
            bg-transparent
          "
        />
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={submitting}
          className="
            bg-gradient-to-r from-teal-700 to-cyan-600 
            text-white font-semibold px-6 py-2 rounded-full 
            shadow-md hover:scale-105 transform transition duration-300
            disabled:opacity-60 select-none
          "
        >
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
