import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ResolutionModal = ({ isOpen, onClose, complaint, onUpdated }) => {
  if (!isOpen || !complaint) return null;

  const [status, setStatus] = useState(complaint.status || 'In Progress');
  const [priority, setPriority] = useState(complaint.priority || 'Medium');
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('priority', priority);
      formData.append('comment', comment || `Status updated to ${status}`);
      
      if (status === 'Rejected') {
        formData.append('rejectionReason', rejectionReason);
      }

      if (imageFile) {
        formData.append('evidenceImage', imageFile);
      }

      const res = await api.patch(`/complaints/${complaint._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        onUpdated(res.data.complaint);
        onClose();
      }
    } catch (err) {
      console.error('Update status error:', err);
      setError(err.response?.data?.message || 'Failed to update complaint status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Update Status: <span className="font-mono text-blue-700">{complaint.complaintId}</span>
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1">{complaint.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Workflow Status selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs rounded-md border border-slate-300 py-2 px-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved (Completed)</option>
                <option value="Rejected">Rejected (Invalid)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs rounded-md border border-slate-300 py-2 px-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Rejection Reason if Rejected */}
          {status === 'Rejected' && (
            <div>
              <label className="block text-xs font-semibold text-red-700 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                required
                placeholder="Explain why this complaint cannot be serviced or was marked invalid..."
                className="w-full text-xs rounded-md border border-red-300 p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none bg-red-50/30"
              />
            </div>
          )}

          {/* Update Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Staff Note / Resolution Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Detail actions taken, repairs completed, contractor dispatched, or materials used..."
              className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Resolution Evidence Photograph */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {status === 'Resolved' ? 'Upload Resolution Evidence Photograph (Recommended)' : 'Attach Progress Photo (Optional)'}
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 border-dashed rounded-md cursor-pointer hover:bg-slate-50 transition-colors text-xs text-slate-600">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {imageFile.name}
                </span>
              )}
            </div>

            {imagePreview && (
              <div className="mt-2 h-24 w-32 rounded-lg overflow-hidden border border-slate-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Updating...' : 'Save Status Update'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ResolutionModal;
