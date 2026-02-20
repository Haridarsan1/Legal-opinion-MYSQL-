'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Save, X, Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  updateRequest,
  deleteRequest,
  deleteDocument,
  uploadDocument,
} from '@/app/actions/requests';

interface RequestActionsProps {
  request: any;
  requestId: string;
}

export default function RequestActionsBar({ request, requestId }: RequestActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState(request.title || '');
  const [description, setDescription] = useState(request.description || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if actions are allowed
  const canEdit = ['submitted', 'assigned'].includes(request.status);
  const canDelete = ['submitted', 'assigned'].includes(request.status);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);
    const result = await updateRequest(requestId, { title, description });

    if (result.success) {
      toast.success('Request updated successfully');
      setIsEditing(false);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update request');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteRequest(requestId);

    if (result.success) {
      toast.success('Request deleted successfully');
      router.push('/client/track');
    } else {
      toast.error(result.error || 'Failed to delete request');
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setTitle(request.title || '');
    setDescription(request.description || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex gap-3">
          {canEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Request
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete Request
            </button>
          )}
          {!canEdit && !canDelete && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              This request cannot be modified in its current status
            </div>
          )}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Edit Request</h3>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
              placeholder="Request title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] resize-none"
              placeholder="Describe your legal request in detail"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !description.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Request</h3>
                <p className="text-sm text-gray-600">Request #{request.request_number}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this request? This action cannot be undone and will
              remove all associated documents and data.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
