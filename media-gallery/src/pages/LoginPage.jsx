import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Logged in');
      navigate('/gallery');
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  // Google Sign-In
  function GoogleSignIn() {
    useEffect(() => {
      window.google?.accounts.id.initialize({
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
      window.google?.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large' }
      );
    }, []);

    return <div id="googleSignInDiv" className="mt-4"></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full border border-teal-100">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          Welcome Back
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-teal-700 font-medium mb-1">Email</label>
            <input
              required
              placeholder="Enter your email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="border border-teal-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-teal-700 font-medium mb-1">Password</label>
            <input
              required
              placeholder="Enter your password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="border border-teal-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <button
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-200"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Google Sign-in */}
        <GoogleSignIn />

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-teal-600 font-medium hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
