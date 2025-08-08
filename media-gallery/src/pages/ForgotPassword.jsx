import { useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error('Enter your email');
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
      toast.success('OTP sent to your email for password reset');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send reset OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-2 text-teal-700">Forgot Password</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Enter your email and we&apos;ll send an OTP to reset your password.
        </p>
        <form onSubmit={requestReset} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              required
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-300"
              disabled={loading || sent}
            />
          </div>
          <button
            type="submit"
            disabled={loading || sent}
            className="w-full bg-orange-600 text-white py-2 rounded font-semibold hover:bg-orange-700 transition disabled:opacity-50"
          >
            {sent ? 'OTP Sent' : loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Remembered?{' '}
          <Link to="/login" className="text-teal-600 hover:underline">
            Login
          </Link>
        </p>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already got an OTP?{' '}
          <Link to="/reset-password" className="text-teal-600 hover:underline">
            Reset password
          </Link>
        </p>
      </div>
    </div>
  );
}
