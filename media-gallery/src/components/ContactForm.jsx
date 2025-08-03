import { useState } from 'react';
import api from '../api';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact', form);
      alert('Message sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      alert('Failed: ' + err?.response?.data?.error || err.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-md">
      <input
        required
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        className="border p-2 w-full"
      />
      <input
        required
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className="border p-2 w-full"
      />
      <textarea
        required
        placeholder="Message"
        value={form.message}
        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        className="border p-2 w-full"
      />
      <button className="bg-indigo-600 text-white px-4 py-2 rounded">Send</button>
    </form>
  );
}
