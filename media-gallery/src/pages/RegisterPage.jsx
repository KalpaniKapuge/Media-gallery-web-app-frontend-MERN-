import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const emailIsValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const passwordIsValid = (p) => p.length >= 6;

  const requestOTP = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name required');
    if (!emailIsValid(form.email)) return toast.error('Invalid email');
    if (!passwordIsValid(form.password)) return toast.error('Password needs >=6 chars');

    setLoading(true);
    try {
      await api.post('/auth/register/request-otp', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!form.otp.trim()) return toast.error('OTP required');
    setLoading(true);
    try {
      const res = await api.post('/auth/register/verify-otp', {
        email: form.email,
        otp: form.otp,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Registration complete');
      navigate('/gallery');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!form.name || !emailIsValid(form.email) || !passwordIsValid(form.password)) {
      return toast.error('Fill valid registration info to resend');
    }
    setLoading(true);
    try {
      await api.post('/auth/register/request-otp', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success('OTP resent');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Resend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white px-4">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-md w-full border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-6 text-teal-700">Create Account</h1>

        <form onSubmit={requestOTP} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              disabled={loading || otpSent}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              disabled={loading || otpSent}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              disabled={loading || otpSent}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <div className="mt-1 text-right text-sm">
              <Link to="/forgot-password" className="text-teal-600 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || otpSent}
            className="w-full bg-teal-600 text-white font-semibold py-3 rounded-md hover:bg-teal-700 transition disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Register'}
          </button>
        </form>

        {otpSent && (
          <div className="mt-8 border-t pt-6">
            <p className="text-center text-gray-700 mb-4">
              OTP sent to <strong>{form.email}</strong>. Enter it below.
            </p>
            <form onSubmit={verifyOTP} className="flex flex-col space-y-4 max-w-xs mx-auto">
              <input
                type="text"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={(e) => setForm(f => ({ ...f, otp: e.target.value }))}
                disabled={loading}
                required
                className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 text-center tracking-widest text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
              <button onClick={resendOTP} disabled={loading} className="underline hover:text-teal-600">
                Resend OTP
              </button>
              <button
                onClick={() => {
                  setOtpSent(false);
                  setForm({ name: '', email: '', password: '', otp: '' });
                }}
                disabled={loading}
                className="underline hover:text-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
