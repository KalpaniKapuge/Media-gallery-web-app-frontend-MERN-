import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(stored);
    } catch {
      setUser(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const handleFile = (file) => {
    if (!file) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }
    
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/zip'];
    const allowedExtensions = ['.zip'];
    const isZip = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!allowedTypes.includes(file.type) && !isZip) {
      toast.error('Only image files (PNG, JPG, GIF, WebP) or ZIP files are allowed');
      return;
    }
    
    setSelectedFile(file);
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
  };

  const submitUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!user) {
      toast.error('Please login to upload files');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', selectedFile.name.split('.')[0]); // Use filename without extension as title
    formData.append('description', '');
    formData.append('tags', '');

    setUploading(true);
    
    try {
      console.log('Starting upload...');
      const res = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', res.data);
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      
      // Refresh gallery if on gallery page
      if (window.location.pathname === '/gallery') {
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Upload failed';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onSelectClick = () => {
    inputRef.current?.click();
  };

  return (
    <nav className="bg-teal-700 text-white p-4 flex flex-wrap justify-between items-center gap-2">
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/" className="font-bold text-lg hover:text-teal-200 transition-colors">
          Media Gallery
        </Link>

        {user && (
          <>
            <Link 
              to="/gallery" 
              className="hover:underline hover:text-teal-200 transition-colors"
            >
              Gallery
            </Link>
            
            {/* Upload component - only show when logged in */}
            <div className="relative">
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-2 bg-white text-teal-700 rounded px-3 py-1 cursor-pointer select-none hover:bg-teal-50 transition-colors"
                onClick={onSelectClick}
                aria-label="upload area"
              >
                <span className="text-sm font-medium">Upload</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" 
                  />
                </svg>
              </div>
              
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.zip"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              
              {selectedFile && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded shadow-lg p-3 z-50 border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-sm">{selectedFile.name}</div>
                      <div className="text-xs text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
                      aria-label="clear selection"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={submitUpload}
                      disabled={uploading}
                      className="flex-1 bg-teal-600 text-white py-2 px-3 rounded font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      onClick={() => setSelectedFile(null)}
                      disabled={uploading}
                      className="flex-1 bg-gray-500 text-white py-2 px-3 rounded font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              to="/contact" 
              className="hover:underline hover:text-teal-200 transition-colors"
            >
              Contact
            </Link>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        {user ? (
          <>
            {isAdmin && (
              <>
                <Link 
                  to="/admin/users" 
                  className="hover:underline hover:text-teal-200 transition-colors"
                >
                  Users
                </Link>
                <Link 
                  to="/admin/contact-messages" 
                  className="hover:underline hover:text-teal-200 transition-colors"
                >
                  Messages
                </Link>
              </>
            )}
            
            <span className="mx-2 hidden sm:inline text-teal-200">
              Hi, {user?.name}
            </span>
            
            <button
              onClick={logout}
              className="bg-red-600 px-3 py-2 rounded hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="hover:underline hover:text-teal-200 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="hover:underline hover:text-teal-200 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}