import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitReset = async (e) => {
    e.preventDefault();
    if (!form.email || !form.otp || !form.newPassword) {
      return toast.error('All fields are required');
    }

    if (form.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: form.email.trim().toLowerCase(),
        otp: form.otp.trim(),
        newPassword: form.newPassword,
      });
      toast.success('Password reset successful. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-3 text-teal-700">Reset Password</h2>
        <p className="text-center text-sm text-gray-500 mb-5">
          Provide email, OTP you received, and new password.
        </p>
        <form onSubmit={submitReset} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">OTP</label>
            <input
              required
              placeholder="Enter OTP"
              value={form.otp}
              onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))}
              className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">New Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-300"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Back to{' '}
          <Link to="/login" className="text-teal-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
