import { useState, useEffect } from 'react';
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
      window.dispatchEvent(new Event('storage'));

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

  useEffect(() => {
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
            window.dispatchEvent(new Event('storage'));

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
    <div className="min-h-screen mt-10 flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 px-4">
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
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-teal-100 text-sm">Login to your account to continue</p>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-2 right-4 w-6 h-6 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-white/40 rounded-full"></div>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={submit} className="space-y-6" aria-label="login form">
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
                  name="email"
                  required
                  placeholder="Enter your email address"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                  disabled={loading}
                  autoComplete="email"
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
                  name="password"
                  required
                  placeholder="Enter your password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <div className="flex justify-between items-center">
                <div></div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-700 transition-colors duration-300"
                >
                  Forgot password?
                </Link>
              </div>

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
                    Logging in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">Login</div>
                )}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-3 text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Google Sign-In Button container */}
            <div id="googleSignInDiv" className="flex justify-center border-2 border-teal-600 rounded-xl" />

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-teal-600 font-semibold hover:text-teal-700 transition-colors duration-300"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}