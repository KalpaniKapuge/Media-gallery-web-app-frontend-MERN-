import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();
  const [openUserMenu, setOpenUserMenu] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(stored);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const navItemClass = (path) => {
    const base = 'px-4 py-2 font-medium transition relative';
    const active =
      location.pathname === path
        ? 'text-white'
        : 'text-teal-100 hover:text-white';
    return `${base} ${active}`;
  };

  return (
    <nav className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-lg">
      {/* Left: Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.jpg" // replace with your logo
            alt="Logo"
            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-lg tracking-tight">Media Gallery</span>
            <span className="text-xs text-teal-200">Your visual archive</span>
          </div>
        </Link>
      </div>

      {/* Center: Primary Links */}
      <div className="flex-1 flex justify-center gap-8">
        {user && (
          <>
            <Link to="/gallery" className={navItemClass('/gallery')}>
              <div className="relative">
                Gallery
                {location.pathname === '/gallery' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-green-300 to-teal-400" />
                )}
              </div>
            </Link>
            <Link to="/contact" className={navItemClass('/contact')}>
              <div className="relative">
                Contact
                {location.pathname === '/contact' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-green-300 to-teal-400" />
                )}
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Right: Admin / User */}
      <div className="flex items-center gap-4 flex-shrink-0 relative">
        {user ? (
          <>
            {isAdmin && (
              <div className="flex gap-4">
                <Link to="/admin/users" className={navItemClass('/admin/users')}>
                  Users
                </Link>
                <Link
                  to="/admin/contact-messages"
                  className={navItemClass('/admin/contact-messages')}
                >
                  Messages
                </Link>
              </div>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenUserMenu((o) => !o)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition rounded-full px-3 py-1 text-sm font-medium backdrop-blur-sm"
                aria-label="User menu"
              >
                <div className="h-8 w-8 flex items-center justify-center bg-gradient-to-r from-green-300 to-teal-400 rounded-full text-xs font-semibold uppercase text-white">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="hidden sm:block text-sm text-white">
                  Hi, {user?.name}
                </div>
                <svg
                  className={`h-4 w-4 transition-transform ${openUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white text-teal-800 rounded-lg shadow-xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-enter">
                  <div className="relative px-4 py-2">
                    {/* Arrow */}
                    <div className="absolute top-0 right-4 -mt-2 w-4 h-4 bg-white rotate-45 shadow-md" />
                    <div className="text-xs mb-1">
                      Signed in as <strong>{user?.email || user?.name}</strong>
                    </div>
                    <div className="divide-y divide-gray-100">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-200 text-sm"
                        onClick={() => setOpenUserMenu(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={navItemClass('/login')}>
              Login
            </Link>
            <Link to="/register" className={navItemClass('/register')}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
