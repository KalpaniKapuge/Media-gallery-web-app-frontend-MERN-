import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/gallery');
    }
  }, [navigate]);

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
      console.log('Attempting login with:', { email: form.email });
      
      const res = await api.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      
      console.log('Login response:', res.data);
      
      // Store authentication data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success('Logged in successfully!');
      navigate('/gallery');
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || 'Login failed';
        toast.error(errorMessage);
        
        if (error.response.status === 500) {
          console.error('Server error details:', error.response.data);
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Unable to connect to server. Please check your connection.');
        console.error('Network error:', error.request);
      } else {
        // Something else happened
        toast.error('An unexpected error occurred');
        console.error('Unexpected error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in setup
  useEffect(() => {
    const initGoogleSignIn = () => {
      if (!window.google) {
        // If Google script hasn't loaded yet, try again in 100ms
        setTimeout(initGoogleSignIn, 100);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              const idToken = response.credential;
              console.log('Google sign-in initiated');
              
              const res = await api.post('/auth/google-login', { idToken });
              
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('user', JSON.stringify(res.data.user));
              
              toast.success('Logged in with Google successfully!');
              navigate('/gallery');
              
            } catch (error) {
              console.error('Google login error:', error);
              const errorMessage = error.response?.data?.error || 'Google login failed';
              toast.error(errorMessage);
            }
          },
        });

        // Render the Google Sign-In button
        const googleButtonDiv = document.getElementById('googleSignInDiv');
        if (googleButtonDiv) {
          window.google.accounts.id.renderButton(googleButtonDiv, {
            theme: 'outline',
            size: 'large',
            width: 300,
            text: 'signin_with',
            shape: 'rectangular'
          });
        }
      } catch (error) {
        console.error('Google Sign-In initialization error:', error);
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
            <Link 
              to="/forgot-password" 
              className="text-sm text-teal-600 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
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
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}