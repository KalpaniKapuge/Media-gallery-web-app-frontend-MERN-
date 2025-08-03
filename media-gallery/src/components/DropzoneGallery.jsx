import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api';

export default function DropzoneGallery({ onUpload }) {
  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const form = new FormData();
      form.append('file', file);
      form.append('title', file.name);
      form.append('description', '');
      form.append('tags', 'example');
      try {
        await api.post('/media/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onUpload && onUpload();
      } catch (e) {
        alert('Upload failed: ' + e?.response?.data?.error || e.message);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className="border-dashed border-2 p-6 text-center cursor-pointer rounded"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop image here...</p>
      ) : (
        <p>Drag & drop image or click to upload (JPG/PNG, max 5MB)</p>
      )}
    </div>
  );
}
