import React, { useState, useCallback } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback((accepted) => {
    if (accepted && accepted.length) {
      setFile(accepted[0]);
      if (!title) setTitle(accepted[0].name.split('.').slice(0, -1).join('.'));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  const submit = async (e) => {
    e?.preventDefault();
    if (!file) {
      toast.error('Please choose an image to upload');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title || file.name);
      fd.append('description', description);
      fd.append('tags', tags);
      const token = localStorage.getItem('token');
      await api.post('/media/upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Uploaded');
      navigate('/gallery');
    } catch (err) {
      console.error('upload error', err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Image</h1>

      <div {...getRootProps()} className={`border-dashed border-2 p-8 rounded mb-4 text-center ${isDragActive ? 'border-teal-500 bg-teal-50' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive ? <p className="text-teal-600">Drop image here...</p> : <p>Drag & drop an image here, or click to select (max 10MB)</p>}
        {file && <div className="mt-3 text-sm text-gray-700">Selected: {file.name} ({Math.round(file.size / 1024)} KB)</div>}
      </div>

      <form onSubmit={submit} className="card max-w-xl">
        <label className="block mb-2 text-sm">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" />

        <label className="block mb-2 text-sm">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" rows={4} />

        <label className="block mb-2 text-sm">Tags (comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 border rounded mb-4" />

        <div className="flex gap-2">
          <button disabled={uploading} className="px-4 py-2 bg-teal-600 text-white rounded">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button type="button" onClick={() => { setFile(null); setTitle(''); setDescription(''); setTags(''); }} className="px-4 py-2 bg-gray-100 rounded">Reset</button>
        </div>
      </form>
    </div>
  );
}
