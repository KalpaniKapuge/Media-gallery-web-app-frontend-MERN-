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
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
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
        email: form.email.trim().toLowerCase(),
        otp: form.otp.trim(),
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
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 px-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md w-full mx-auto">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 px-8 py-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-teal-400/20 animate-pulse"></div>
            <div className="relative">
              <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
              <p className="text-teal-100 text-sm">Sign up to get started</p>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-2 right-4 w-6 h-6 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-white/40 rounded-full"></div>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={requestOTP} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="flex items-center text-gray-700 font-semibold text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  disabled={loading || otpSent}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center text-gray-700 font-semibold text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={loading || otpSent}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="flex items-center text-gray-700 font-semibold text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4m0-6v6m-7-6h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z"
                    />
                  </svg>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={loading || otpSent}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                />
                <div className="mt-1 text-right text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-teal-600 hover:text-teal-700 transition-colors duration-300 font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otpSent}
                className={`w-full py-4 font-semibold rounded-xl text-white transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading || otpSent
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">Register</div>
                )}
              </button>
            </form>

            {otpSent && (
              <div className="mt-8 border-t border-gray-200 pt-6">
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
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-center tracking-widest text-lg"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 font-semibold rounded-xl text-white transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                      loading
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">Verify OTP</div>
                    )}
                  </button>
                </form>
                <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
                  <button
                    onClick={resendOTP}
                    disabled={loading}
                    className="underline hover:text-teal-600 transition-colors duration-300"
                  >
                    Resend OTP
                  </button>
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setForm({ name: '', email: '', password: '', otp: '' });
                    }}
                    disabled={loading}
                    className="underline hover:text-red-600 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-teal-600 font-semibold hover:text-teal-700 transition-colors duration-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}