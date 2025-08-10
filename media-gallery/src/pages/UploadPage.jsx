import React, { useState, useCallback } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline"; // Heroicons for upload icon

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback(
    (accepted) => {
      if (accepted && accepted.length) {
        setFile(accepted[0]);
        if (!title) setTitle(accepted[0].name.split(".").slice(0, -1).join("."));
      }
    },
    [title]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const submit = async (e) => {
    e?.preventDefault();
    if (!file) {
      toast.error("Please choose an image to upload");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title || file.name);
      fd.append("description", description);
      fd.append("tags", tags);
      await api.post("/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Uploaded");
      navigate("/gallery");
    } catch (err) {
      console.error("upload error", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">
        Upload Your Image
      </h1>

      {/* Drag and Drop Box */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer shadow-sm
          ${
            isDragActive
              ? "border-teal-600 bg-teal-50"
              : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md hover:border-teal-400"
          }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-teal-500 mb-3" />
        {isDragActive ? (
          <p className="text-teal-600 font-medium">Drop the image here...</p>
        ) : (
          <p className="text-gray-600">
            <span className="font-semibold">Drag & drop</span> an image here,
            or{" "}
            <span className="text-teal-600 font-medium underline">
              click to select
            </span>{" "}
            (max 10MB)
          </p>
        )}
        {file && (
          <div className="mt-3 text-sm text-gray-700">
            <strong>Selected:</strong> {file.name} (
            {Math.round(file.size / 1024)} KB)
          </div>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="bg-white mt-8 p-6 rounded-xl shadow-lg space-y-5"
      >
        {/* Title */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            placeholder="Enter a title for the image"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            rows={4}
            placeholder="Write a short description..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Tags (comma separated)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            placeholder="Example: travel, nature, sunset"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            disabled={uploading}
            className={`px-6 py-2 rounded-lg  text-white font-medium shadow-md transition-all 
              ${
                uploading
                  ? "bg-teal-500 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-800 cursor-pointer"
              }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setTitle("");
              setDescription("");
              setTags("");
            }}
            className="px-6 py-2 cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium shadow-sm transition-all"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
