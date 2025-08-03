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

  return (
    <nav className="bg-indigo-700 text-white p-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">
        Media Gallery
      </Link>
      <div className="space-x-4">
        {user ? (
          <>
            <Link to="/gallery" className="hover:underline">
              Gallery
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin/users" className="hover:underline">
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
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
