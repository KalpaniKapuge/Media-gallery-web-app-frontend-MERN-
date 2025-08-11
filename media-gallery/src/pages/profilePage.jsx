// profilePage.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api'; // your axios instance

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', profilePic: '' });
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        navigate('/login');
      } else {
        setUser(storedUser);
        setForm({
          name: storedUser.name || '',
          email: storedUser.email || '',
          profilePic: storedUser.profilePic || '',
        });
        // Set preview, but handle undefined/null cases
        const profilePicUrl = storedUser.profilePic;
        if (profilePicUrl && profilePicUrl !== 'undefined' && profilePicUrl !== '/uploads/default-avatar.png') {
          setPreview(profilePicUrl);
        } else {
          setPreview('');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userDataChanged'));
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const uploadProfilePic = async (formData) => {
    try {
      console.log('📸 Uploading profile picture...');
      
      // Get token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.post('/media/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('✅ Upload successful:', response.data);
      return response;
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/login');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        toast.error(errorMessage);
      }
      
      throw error;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, or WEBP files are allowed');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Max file size is 2MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Prepare form data
      const formData = new FormData();
      formData.append('profilePic', file);

      console.log('📁 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

      // Upload to server
      const response = await uploadProfilePic(formData);

      if (response.data.success) {
        const newProfilePic = response.data.url;
        console.log('🎉 New profile picture URL:', newProfilePic);

        // Update form state
        setForm((f) => ({ ...f, profilePic: newProfilePic }));
        setPreview(newProfilePic);

        // Update user in localStorage and trigger events
        const updatedUser = { ...user, profilePic: newProfilePic };
        updateUserInStorage(updatedUser);

        toast.success('Profile picture uploaded successfully!');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      // Reset preview to previous state
      setPreview(user?.profilePic || '');
      
      // The error toast is already shown in uploadProfilePic function
    } finally {
      setUploading(false);
    }
  };

  const updateUserInStorage = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('userDataChanged'));
    setUser(updatedUser);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      const payload = {
        name: form.name,
        email: form.email,
        profilePic: form.profilePic,
      };

      console.log('💾 Updating profile with payload:', payload);

      const response = await api.put('/users/profile', payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        console.log('✅ Profile updated:', updatedUser);

        updateUserInStorage(updatedUser);

        setForm({
          name: updatedUser.name,
          email: updatedUser.email,
          profilePic: updatedUser.profilePic,
        });

        // Update preview
        if (updatedUser.profilePic && updatedUser.profilePic !== 'undefined') {
          setPreview(updatedUser.profilePic);
        } else {
          setPreview('');
        }

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.data.message || 'Update failed');
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/login');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-teal-600 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 px-8 py-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-teal-400/20 animate-pulse"></div>
            <div className="relative">
              <h1 className="text-2xl font-bold text-white mb-1">Your Profile</h1>
              <p className="text-teal-100 text-sm">Manage your account settings</p>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-2 right-4 w-6 h-6 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-white/40 rounded-full"></div>
            
            
          </div>

          <div className="px-8 py-8">
            {/* Profile Picture Section */}
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-teal-400 to-cyan-400 shadow-2xl mx-auto relative group">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.log('❌ Image failed to load:', preview);
                        e.currentTarget.onerror = null;
                        setPreview('');
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-teal-200 via-cyan-200 to-teal-300 text-teal-700 text-4xl font-bold uppercase">
                      {form.name?.[0] || user.name?.[0] || 'U'}
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Upload Button */}
                <label
                  htmlFor="profilePic"
                  className={`absolute -bottom-2 -right-2 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                  }`}
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  )}
                </label>
                <input
                  id="profilePic"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6 mt-10">
              <div className="space-y-2">
                <label
                  htmlFor="name"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

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
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="Enter your email address"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className={`w-full py-4 font-semibold rounded-xl text-white transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  uploading
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {form.profilePic !== user?.profilePic ? 'Uploading...' : 'Updating...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">Save Changes</div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">Your profile information is secure and private</p>
        </div>
      </div>
    </div>
  );
}