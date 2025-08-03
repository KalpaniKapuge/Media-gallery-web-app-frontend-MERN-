import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(storedUser);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-teal-700 text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="font-bold text-xl hover:text-teal-300">
        Media Gallery
      </Link>

      <div className="space-x-6 flex items-center">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link to="/gallery" className="hover:underline">
              Gallery
            </Link>
            <Link to="/upload" className="hover:underline">
              Upload
            </Link>
            <Link to="/zip-download" className="hover:underline">
              ZIP Download
            </Link>
            <Link to="/profile" className="hover:underline">
              Profile
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>

            {isAdmin && (
              <>
                <Link to="/admin/users" className="hover:underline">
                  User Management
                </Link>
                <Link to="/admin/contact-messages" className="hover:underline">
                  Contact Messages
                </Link>
              </>
            )}

            <span className="mx-2">Hello, {user.name}</span>

            <button
              onClick={logout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
