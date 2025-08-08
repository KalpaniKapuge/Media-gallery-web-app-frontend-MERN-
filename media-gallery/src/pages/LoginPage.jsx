import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Email and password are required');
      return;
    }

    if (!form.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success('Logged in successfully!');
      navigate('/gallery');
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.error || 'Login failed');
      } else if (error.request) {
        toast.error('Unable to connect to server');
      } else {
        toast.error('Unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in
  useState(() => {
    const initGoogleSignIn = () => {
      if (!window.google) {
        setTimeout(initGoogleSignIn, 100);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const idToken = response.credential;
            const res = await api.post('/auth/google-login', { idToken });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success('Logged in with Google successfully!');
            navigate('/gallery');
          } catch (error) {
            toast.error(error.response?.data?.error || 'Google login failed');
          }
        },
      });

      const googleButtonDiv = document.getElementById('googleSignInDiv');
      if (googleButtonDiv) {
        window.google.accounts.id.renderButton(googleButtonDiv, {
          theme: 'outline',
          size: 'large',
          width: 300,
          text: 'signin_with',
          shape: 'rectangular',
        });
      }
    };

    initGoogleSignIn();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full border border-teal-100">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-4">Welcome Back</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Login to your account to continue</p>

        <form onSubmit={submit} className="space-y-5" aria-label="login form">
          <div>
            <label className="block text-teal-700 font-medium mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              required
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="border border-teal-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-teal-700 font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              required
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="border border-teal-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-between items-center">
            <div></div>
            <Link to="/forgot-password" className="text-sm text-teal-600 hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Login in...' : 'Login'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <div id="googleSignInDiv" className="flex justify-center" />

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 font-medium hover:underline transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
