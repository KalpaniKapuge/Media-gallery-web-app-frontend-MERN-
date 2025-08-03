import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
  const navigate = useNavigate();

  const requestOTP = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register/request-otp', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setStep(2);
      alert('OTP sent to your email');
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
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
      alert(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 1 ? (
        <form onSubmit={requestOTP} className="space-y-4">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border p-2 w-full"
          />
          <input
            required
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="border p-2 w-full"
          />
          <input
            required
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="border p-2 w-full"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Request OTP</button>
        </form>
      ) : (
        <form onSubmit={verifyOTP} className="space-y-4">
          <input
            required
            placeholder="OTP"
            value={form.otp}
            onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value }))}
            className="border p-2 w-full"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded">Verify OTP</button>
        </form>
      )}
    </div>
  );
}
