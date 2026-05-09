import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';
import { errorLogger, errorNotificationManager } from '../../utils/errorLogger';
import apiClient from '../../services/api.service';

interface HelpContent {
  id: number;
  title: string;
  content: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function AdminHelpManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [helpContents, setHelpContents] = useState<HelpContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    order: 0,
  });

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadHelpContent();
  }, []);

  const loadHelpContent = async () => {
    try {
      setLoading(true);
      setError(null);
      errorLogger.info('Fetching help content');

      const response = await apiClient.get<HelpContent[]>(
        '/admin/help-content',
      );
      setHelpContents(response.data.sort((a, b) => a.order - b.order));
      errorLogger.info('Help content loaded', { count: response.data.length });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load help content';
      errorLogger.error(`Failed to load help content: ${message}`);
      setError(message);
      errorNotificationManager.error('Failed to load help content');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'General', order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      errorNotificationManager.warning('Please fill in all fields');
      return;
    }

    try {
      errorLogger.info('Saving help content', { editingId });

      if (editingId) {
        await apiClient.put(`/admin/help-content/${editingId}`, formData);
        setHelpContents(
          helpContents.map((h) =>
            h.id === editingId
              ? { ...h, ...formData, updatedAt: new Date().toISOString() }
              : h,
          ),
        );
        errorLogger.info('Help content updated');
        errorNotificationManager.success('Help content updated successfully');
      } else {
        const response = await apiClient.post<HelpContent>(
          '/admin/help-content',
          formData,
        );
        setHelpContents(
          [...helpContents, response.data].sort((a, b) => a.order - b.order),
        );
        errorLogger.info('Help content created');
        errorNotificationManager.success('Help content created successfully');
      }

      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save help content';
      errorLogger.error(`Failed to save help content: ${message}`);
      errorNotificationManager.error('Failed to save help content');
    }
  };

  const handleEdit = (content: HelpContent) => {
    setFormData({
      title: content.title,
      content: content.content,
      category: content.category,
      order: content.order,
    });
    setEditingId(content.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this help content?')) {
      return;
    }

    try {
      errorLogger.info('Deleting help content', { id });
      await apiClient.delete(`/admin/help-content/${id}`);
      setHelpContents(helpContents.filter((h) => h.id !== id));
      errorLogger.info('Help content deleted');
      errorNotificationManager.success('Help content deleted successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete help content';
      errorLogger.error(`Failed to delete help content: ${message}`);
      errorNotificationManager.error('Failed to delete help content');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gray-600">Loading help content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Help & Support Management
          </h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            <p className="font-semibold">Error loading help content</p>
            <button
              onClick={loadHelpContent}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Help Content List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {helpContents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No help content created yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {helpContents.map((content) => (
                    <div key={content.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {content.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {content.content}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {content.category}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                              Order: {content.order}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(content)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(content.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Content' : 'New Content'}
              </h3>
              {showForm && (
                <button
                  onClick={resetForm}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              )}
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Help Content
              </button>
            )}

            {showForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Help topic title"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option>General</option>
                    <option>Getting Started</option>
                    <option>Features</option>
                    <option>Accessibility</option>
                    <option>Troubleshooting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Help content..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
