import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Trash2,
  Calendar,
  User,
  Tag,
  Eye,
  Share2,
  Heart,
  Maximize2,
  X,
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function ImageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const res = await api.get(`/media/${id}`);
        setImage(res.data);
      } catch (err) {
        console.error('load item', err);
        toast.error(err?.response?.data?.error || 'Failed to load image');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadImage();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this image? This action cannot be undone.')) return;
    try {
      await api.delete(`/media/${id}`);
      toast.success('Image deleted successfully');
      navigate('/gallery');
    } catch (err) {
      console.error('delete error', err);
      toast.error('Delete failed');
    }
  };

  const handleDownload = () => {
    if (!image?.url) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.title || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!image) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href,
        });
      } catch {
        toast.error('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading image...</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Image not found</h2>
          <p className="text-slate-600 mb-6">The image you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/gallery')}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/gallery')}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Gallery</span>
            </button>
            <div className="h-6 w-px bg-slate-300"></div>
            <h1 className="text-lg font-bold text-slate-800 truncate max-w-md" title={image.title}>
              {image.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-lg ${liked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}
              title={liked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleShare} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg" title="Share image">
              <Share2 className="w-5 h-5" />
            </button>
            
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image */}
        <div className="lg:col-span-2 relative group bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <img src={image.url} alt={image.title} className="w-full max-h-[90vh] object-contain" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition">
            <div className="opacity-0 group-hover:opacity-100 flex gap-3 transition">
              <button
                onClick={() => setFullscreen(true)}
                className="p-3 bg-white/90 rounded-full shadow-lg hover:scale-110"
                title="View fullscreen"
              >
                <Maximize2 className="w-5 h-5 text-slate-700" />
              </button>
              <a
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-white/90 rounded-full shadow-lg hover:scale-110"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5 text-slate-700" />
              </a>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 sticky top-24 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <h2 className="text-xl font-bold text-slate-800 mb-2">{image.title}</h2>
            <p className="text-sm text-slate-600">{image.description || 'No description available'}</p>
          </div>
          {image.tags?.length > 0 && (
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-slate-700">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {image.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 rounded-full border border-teal-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" /> Image Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Dimensions</span>
                <span className="text-sm font-medium text-slate-800">
                  {image.width && image.height ? `${image.width}×${image.height}` : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">File Size</span>
                <span className="text-sm font-medium text-slate-800">{image.fileSize || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Format</span>
                <span className="text-sm font-medium text-slate-800">{image.format || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Uploaded
                </span>
                <span className="text-sm font-medium text-slate-800">{new Date(image.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3" /> Owner
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {image.uploadedBy?.username || image.uploadedBy || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={image.url} alt={image.title} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
