import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Logged in successfully');
      navigate('/gallery');
    } catch (e) {
      alert(e?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In component
  function GoogleSignIn() {
    useEffect(() => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const idToken = response.credential;
          try {
            const res = await api.post('/auth/google-login', { idToken });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/gallery';
          } catch (e) {
            alert('Google login failed');
          }
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large' }
      );
    }, []);

    return <div id="googleSignInDiv" className="mt-4" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full border border-teal-100">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-4">
          Welcome Back
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Login to your account to continue
        </p>
        <form onSubmit={submit} className="space-y-5" aria-label="login form">
          <div>
            <label className="block text-teal-700 font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              required
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="border border-teal-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-teal-700 font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              required
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="border border-teal-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
              disabled={loading}
            />
          </div>
          <div className="flex justify-between items-center">
            <div></div>
            <Link to="/forgot-password" className="text-sm text-teal-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <GoogleSignIn />

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
