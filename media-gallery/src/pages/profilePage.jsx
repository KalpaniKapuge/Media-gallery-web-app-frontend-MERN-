import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        navigate('/login');
      } else {
        setUser(storedUser);
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <p className="text-teal-700 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500 rounded-full w-20 h-20 text-white text-4xl font-bold uppercase mx-auto">
            {user.name?.[0] || 'U'}
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-teal-800 mb-2">{user.name}</h1>
        <p className="text-teal-600 mb-1">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-teal-600 mb-6">
          <strong>Role:</strong> {user.role || 'User'}
        </p>

        <button
          onClick={logout}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
