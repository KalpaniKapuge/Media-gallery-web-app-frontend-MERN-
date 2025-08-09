import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

export default function ImageDetailPage() {
  const { id } = useParams();
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadImage = async () => {
      try {
        const res = await api.get(`/media/${id}`); // expects media object
        // backend returns media object directly
        setImage(res.data);
      } catch (err) {
        console.error("load item", err);
        toast.error(err?.response?.data?.error || 'Failed to load image');
      }
    };
    if (id) loadImage();
  }, [id]);

  if (!image) return <div className="p-6">Loading...</div>;

  const handleDelete = async () => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/media/${id}`);
      toast.success('Deleted');
      navigate('/gallery');
    } catch (err) {
      console.error('delete error', err);
      toast.error('Delete failed');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="bg-black rounded overflow-hidden">
            <img src={image.url} alt={image.title} className="w-full max-h-[70vh] object-contain" />
          </div>

          <div className="flex gap-2 mt-3">
            <a href={image.url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-green-600 text-white rounded">Open Full</a>
          </div>
        </div>

        <aside className="w-80">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold">{image.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{image.description || 'No description'}</p>

            <div className="mt-3">
              <div className="text-xs text-gray-500">Tags</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(image.tags || []).map((t, i) => <span key={i} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">{t}</span>)}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div>Uploaded: {new Date(image.createdAt).toLocaleString()}</div>
              <div>Owner: {image.uploadedBy || 'Unknown'}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={handleDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
              <a href="/gallery" className="px-3 py-2 bg-gray-100 rounded">Back</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
