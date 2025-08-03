import { useEffect, useState } from 'react';
import api from '../api';
import DropzoneGallery from '../components/DropzoneGallery';

export default function GalleryPage() {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/media/gallery');
      setMedia(res.data);
    } catch (e) {
      alert('Failed to load gallery');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));
  };

  const downloadZip = async () => {
    if (!selected.length) return;
    try {
      const res = await api.post(
        '/media/download-zip',
        { ids: selected },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selected_images.zip';
      a.click();
    } catch (e) {
      alert('ZIP download failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Media Gallery</h2>
      <DropzoneGallery onUpload={load} />
      <div className="mt-6 grid grid-cols-3 gap-4">
        {media.map((m) => (
          <div key={m._id} className="border p-2 relative">
            <img src={m.url} alt={m.title} className="w-full h-32 object-cover" />
            <div className="mt-1 font-semibold">{m.title}</div>
            <div className="flex items-center gap-2 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(m._id)}
                  onChange={() => toggleSelect(m._id)}
                  className="mr-1"
                />
                Select
              </label>
            </div>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <button
          onClick={downloadZip}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Download {selected.length} as ZIP
        </button>
      )}
    </div>
  );
}
