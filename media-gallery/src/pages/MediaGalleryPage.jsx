import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import Swal from "sweetalert2";
import ZipPanel from '../components/ZipPanel';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';


export default function MediaGalleryPage() {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (tags && tags.trim()) params.tags = tags.trim();
      const res = await api.get('/media', { params });
      const items = res.data?.data || res.data || [];
      setMedia(items);
    } catch (err) {
      console.error('load gallery', err);
      toast.error('Failed to load gallery');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [search, tags]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, tags, load]);

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selectAll = () => setSelected(media.map((m) => m._id));
  const clearSelection = () => setSelected([]);
const deleteItem = async (id) => {
  const result = await Swal.fire({
    title: "Delete?",
    text: "This media will be removed permanently.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#F33939FF", // teal
    cancelButtonColor: "#C0C2C4FF", // gray
    confirmButtonText: "Yes,delete",
    cancelButtonText: "No,cancel",
    width: "300px",
    background: "#F9FAFBFB", // light teal background
    customClass: {
      popup: "rounded-lg shadow-lg text-sm",
      title: "text-lg font-bold",
      confirmButton: "px-3 py-1 rounded font-semibold",
      cancelButton: "px-3 py-1 rounded font-semibold",
    },
    showClass: {
      popup: "animate__animated animate__fadeInDown animate__faster"
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp animate__faster"
    }
  });

  if (!result.isConfirmed) return;

  try {
    await api.delete(`/media/${id}`);
    toast.success("Deleted");
    await load();
    setSelected((s) => s.filter((x) => x !== id));
  } catch (err) {
    console.error("delete error", err);
    toast.error("Delete failed");
  }
};

  const bulkDelete = async () => {
  if (!selected.length) return;

  const result = await Swal.fire({
    title: `Delete ${selected.length} items?`,
    text: "These media files will be permanently removed.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#F33939FF", // red for delete
    cancelButtonColor: "#C0C2C4FF", // gray
    confirmButtonText: "Yes, delete",
    cancelButtonText: "No, cancel",
    width: "300px",
    background: "#F9FAFBFB", // light teal background
    customClass: {
      popup: "rounded-lg shadow-lg text-sm",
      title: "text-lg font-bold",
      confirmButton: "px-3 py-1 rounded font-semibold cursor-pointer",
      cancelButton: "px-3 py-1 rounded font-semibold cursor-pointer",
    },
    showClass: {
      popup: "animate__animated animate__fadeInDown animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp animate__faster",
    },
  });

  if (!result.isConfirmed) return;

  try {
    await Promise.all(selected.map((id) => api.delete(`/media/${id}`)));
    toast.success("Deleted selected items");
    setSelected([]);
    await load();
  } catch (err) {
    console.error("bulk delete", err);
    toast.error("Failed to delete some items");
  }
};


 const editItem = async (item) => {
  const swalOptions = {
    width: "260px", 
    background: "#F9FAFBFB", 
    confirmButtonColor: "#0982A0FF", 
    cancelButtonColor: "#C0C2C4FF", 
    showCancelButton: true,
    reverseButtons: true, 
   customClass: {
  popup: "rounded-lg shadow-lg text-sm",
  title: "text-lg font-bold text-gray-800",
  confirmButton: "px-2.5 py-1.5 text-xs rounded font-semibold cursor-pointer",
  cancelButton: "px-2.5 py-1.5 text-xs rounded font-semibold cursor-pointer"
},
inputAttributes: {
  class:
    "text-sm p-1.5 rounded border-2 border-teal-500 focus:border-teal-600 focus:ring focus:ring-teal-400 focus:ring-opacity-50 outline-none"
},

    showClass: { popup: "animate__animated animate__fadeInDown animate__faster" },
    hideClass: { popup: "animate__animated animate__fadeOutUp animate__faster" }
  };

  const { value: title } = await Swal.fire({
    ...swalOptions,
    title: "Edit Title",
    input: "text",
    inputValue: item.title || "",
  });
  if (title === undefined) return;

  const { value: description } = await Swal.fire({
    ...swalOptions,
    title: "Edit Description",
    input: "textarea",
    inputValue: item.description || "",
  });
  if (description === undefined) return;

  const { value: tagStr } = await Swal.fire({
    ...swalOptions,
    title: "Edit Tags",
    input: "text",
    inputValue: (item.tags || []).join(", "),
  });
  if (tagStr === undefined) return;

  try {
    await api.put(`/media/${item._id}`, { title, description, tags: tagStr });
    toast.success("Updated");
    await load();
  } catch (err) {
    console.error("edit failed", err);
    toast.error("Update failed");
  }
};


  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Media Gallery</h1>
        <div>
          <a
            href="/upload"
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 transition text-white font-semibold rounded shadow cursor-pointer text-sm sm:text-base"
          >
            + Upload Media
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title/description..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-sm"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Filter by tags (comma separated)"
          className="w-full sm:w-60 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-sm"
        />
        <button
          onClick={load}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-500 hover:text-white rounded shadow text-sm font-semibold transition cursor-pointer"
        >
          Apply
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600">{selected.length} selected</span>
        <button
          onClick={selectAll}
          className="px-2 py-1 bg-cyan-700 hover:bg-cyan-500 hover:text-black transition text-white rounded text-xs font-medium shadow cursor-pointer"
        >
          Select all
        </button>
        <button
          onClick={clearSelection}
          className="px-2 py-1 text-white  bg-teal-600 hover:bg-teal-400 hover:text-black rounded text-xs font-medium shadow cursor-pointer"
        >
          Clear
        </button>
        <button
          onClick={bulkDelete}
          disabled={!selected.length}
          className={`px-2 py-1 rounded text-xs font-medium shadow transition ${
            selected.length
              ? 'bg-red-600 hover:bg-red-300 hover:text-black/90  text-white cursor-pointer'
              : 'bg-red-300 text-white cursor-not-allowed'
          }`}
        >
          Delete selected
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg shadow" />
          ))
        ) : media.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 text-base">No media found</div>
        ) : (
          media.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col text-sm ${
                selected.includes(item._id)
                  ? 'ring-3 ring-teal-600 ring-opacity-50'
                  : 'ring-1 ring-transparent'
              } transition-all duration-200`}
            >
              <div className="relative h-36 bg-gray-200 overflow-hidden">
                <a href={`/image/${item._id}`} className="block h-full w-full">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </a>
                <div className="absolute top-2 left-2 bg-opacity-90 rounded p-[2px]">
                  <input
                    type="checkbox"
                    checked={selected.includes(item._id)}
                    onChange={() => toggleSelect(item._id)}
                    className="w-4 h-4 cursor-pointer"
                    aria-label={`Select media ${item.title}`}
                  />
                </div>
              </div>

              <div className="p-3 flex flex-col flex-grow justify-between">
                <div>
                  <h2
                    title={item.title}
                    className="font-semibold text-base text-gray-900 truncate max-h-[2.8rem] leading-snug overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.title}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.slice(0, 4).map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full select-none"
                        title={t}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2 justify-end flex-wrap">
                 <button
                onClick={() => editItem(item)}
                className="p-1 bg-white text-teal-700  hover:bg-cyan-900 hover:text-white border-teal-600  border-1 rounded shadow-2xl cursor-pointer"
                type="button"
                aria-label={`Edit ${item.title}`}
              >
                <PencilIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => deleteItem(item._id)}
                className="p-1 bg-white text-red-500 hover:bg-red-500 hover:text-white border-red-500 border rounded shadow-sm cursor-pointer"
                type="button"
                aria-label={`Delete ${item.title}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <ZipPanel selectedIds={selected} onDownloaded={() => setSelected([])} />
      </div>
    </div>
  );
}
