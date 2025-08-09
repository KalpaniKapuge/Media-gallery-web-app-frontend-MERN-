import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function ZipPanel({ selectedIds = [], onDownloaded = () => {} }) {
  const [downloading, setDownloading] = useState(false);

  const downloadZip = async () => {
    if (!selectedIds || selectedIds.length === 0) {
      toast.error('Select at least one item to download');
      return;
    }
    setDownloading(true);
    try {
      console.log('Sending ZIP request:', {
        url: `${api.defaults.baseURL}/media/zip`,
        payload: { ids: selectedIds },
        headers: { Authorization: api.defaults.headers.Authorization },
      });
      const res = await api.post('/media/download-zip', { ids: selectedIds }, { responseType: 'blob' });
      console.log('ZIP response:', {
        status: res.status,
        headers: res.headers,
      });
      const blob = new Blob([res.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `media-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('ZIP downloaded');
      onDownloaded();
    } catch (err) {
      console.error('ZIP error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        headers: err.config?.headers,
      });
      toast.error('Failed to download ZIP');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-600">Selected: <strong>{selectedIds?.length || 0}</strong></div>
        <div className="text-xs text-gray-400">You can download selected items as a ZIP.</div>
      </div>
      <div>
        <button
          onClick={downloadZip}
          disabled={downloading || selectedIds.length === 0}
          className={`px-3 py-2 rounded ${
            downloading || selectedIds.length === 0 ? 'bg-gray-200' : 'bg-green-600 text-white'
          }`}
        >
          {downloading ? 'Downloading...' : `Download ZIP (${selectedIds.length})`}
        </button>
      </div>
    </div>
  );
}