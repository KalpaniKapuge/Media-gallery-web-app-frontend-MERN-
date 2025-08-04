import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api';
import toast from 'react-hot-toast';

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState('');

  // Load gallery media with optional search and tags filters
  const loadGallery = async () => {
    try {
      setLoading(true);

      // Prepare params for axios GET request
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterTags) params.tags = filterTags;

      console.log('Loading gallery with params:', params);

      // Send request with params object (axios handles query string)
      const res = await api.get('/media/gallery', { params });

      console.log('Gallery response:', res.data);

      // Support old/new response formats
      const mediaData = res.data.data || res.data;
      setMedia(Array.isArray(mediaData) ? mediaData : []);
    } catch (error) {
      console.error('Failed to load gallery:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to load gallery';
      toast.error(errorMessage);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  // Load gallery on mount
  useEffect(() => {
    loadGallery();
  }, []);

  // Reload gallery when search/filter changes, with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadGallery();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterTags]);

  // Handle file upload via dropzone
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0]);
    formData.append('description', 'Uploaded via drag and drop');
    formData.append('tags', 'upload');

    setUploading(true);
    try {
      console.log('Uploading file:', file.name);
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Upload successful:', res.data);
      toast.success('File uploaded successfully!');
      await loadGallery();
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error?.response?.data?.error || 'Upload failed';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, []);

  // Dropzone hooks and config
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10 MB max
    multiple: false,
  });

  // Toggle selection of an item
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Select all media items
  const selectAll = () => {
    setSelected(media.map((item) => item._id));
  };

  // Clear all selections
  const clearSelection = () => {
    setSelected([]);
  };

  // Delete selected items after confirmation
  const deleteSelected = async () => {
    if (!selected.length) return;

    if (!window.confirm(`Delete ${selected.length} selected items?`)) return;

    try {
      const deletePromises = selected.map((id) => api.delete(`/media/${id}`));
      await Promise.all(deletePromises);
      toast.success(`${selected.length} items deleted successfully`);
      setSelected([]);
      await loadGallery();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete some items');
    }
  };

  // Download selected items as ZIP file
  const downloadZip = async () => {
    if (!selected.length) {
      toast.error('Please select at least one item to download');
      return;
    }

    try {
      console.log('Downloading ZIP for:', selected);
      const res = await api.post(
        '/media/download-zip',
        { ids: selected },
        { responseType: 'blob' }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `media-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${selected.length} items as ZIP`);
    } catch (error) {
      console.error('ZIP download failed:', error);
      const errorMessage = error?.response?.data?.error || 'ZIP download failed';
      toast.error(errorMessage);
    }
  };

  // Helper to format file sizes
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show loading spinner while loading gallery
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Media Gallery</h1>

        {/* Search and Filter Inputs */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="text"
            placeholder="Filter by tags (comma separated)"
            value={filterTags}
            onChange={(e) => setFilterTags(e.target.value)}
            className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Upload Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={uploading} />
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-2"></div>
              <p className="text-gray-600">Uploading...</p>
            </div>
          ) : isDragActive ? (
            <p className="text-teal-600 font-medium">Drop your image here...</p>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-2"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-gray-600">
                <span className="font-medium text-teal-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">Images up to 10MB</p>
            </>
          )}
        </div>
      </div>

      {/* Selection Controls */}
      {media.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            {selected.length} of {media.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              disabled={selected.length === 0}
            >
              Clear
            </button>
            {selected.length > 0 && (
              <>
                <button
                  onClick={downloadZip}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Download ZIP ({selected.length})
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete ({selected.length})
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {media.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
          <p className="text-gray-500">Upload some images to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                selected.includes(item._id) ? 'ring-2 ring-teal-500' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(item._id)}
                    onChange={() => toggleSelect(item._id)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{formatFileSize(item.fileSize)}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
