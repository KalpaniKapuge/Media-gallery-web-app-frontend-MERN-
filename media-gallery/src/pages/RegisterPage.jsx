import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestOTP = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert('Name, email, and password are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register/request-otp', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setStep(2);
      alert('OTP sent to your email');
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!form.otp) {
      alert('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register/verify-otp', {
        email: form.email,
        otp: form.otp,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Registration complete');
      navigate('/gallery');
    } catch (e) {
      alert(e?.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-lg w-full border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-4 text-teal-700">
          {step === 1 ? 'Create Account' : 'Verify OTP'}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          {step === 1
            ? 'Enter your details to register. You will receive an OTP on email to verify.'
            : 'Enter the OTP sent to your email to complete registration.'}
        </p>

        {step === 1 ? (
          <form onSubmit={requestOTP} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Name</label>
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-300"
                disabled={loading}
              />
            </div>
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
              <label className="block mb-1 font-medium text-gray-700">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-300"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Request OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="space-y-4">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="text-center text-sm text-gray-500">
              Didn&apos;t receive?{' '}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-teal-600 hover:underline font-medium"
              >
                Go back
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
