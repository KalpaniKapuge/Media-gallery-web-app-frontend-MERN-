import { useState } from 'react';
import api from '../api';
import { useEffect } from 'react';
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

  
// Move GoogleSignIn outside of LoginPage
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

  return <div id="googleSignInDiv"></div>;
}

  return (
      <><form onSubmit={submit} className="space-y-4">
      <input
        required
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        className="border p-2 w-full" />
      <input
        required
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        className="border p-2 w-full" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form><GoogleSignIn /></>
  );
}
