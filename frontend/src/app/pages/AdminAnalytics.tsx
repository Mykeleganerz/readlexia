import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  FileText,
  BookOpen,
  BarChart3,
  Activity,
} from 'lucide-react';
import { errorLogger, errorNotificationManager } from '../../utils/errorLogger';
import apiClient from '../../services/api.service';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  totalDocuments: number;
  newDocumentsLast7Days: number;
  newDocumentsLast30Days: number;
  totalExercises: number;
  totalWords: number;
  averageDocumentLength: number;
  avgExercisesPerUser: number;
  avgDocumentsPerUser: number;
  categoryDistribution: Record<string, number>;
}

export function AdminAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      errorLogger.info('Fetching system analytics');

      const response = await apiClient.get<Analytics>('/admin/analytics');
      setAnalytics(response.data);
      errorLogger.info('Analytics loaded successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load analytics';
      errorLogger.error(`Failed to load analytics: ${message}`);
      setError(message);
      errorNotificationManager.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-semibold">Error loading analytics</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={loadAnalytics}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">System Analytics</h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
        </div>

        {analytics && (
          <>
            {/* Key Metrics - Core Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {analytics.totalUsers}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      +{analytics.newUsersLast7Days} this week
                    </p>
                  </div>
                  <Users className="text-blue-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {analytics.activeUsers}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                  </div>
                  <Activity className="text-green-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Documents</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {analytics.totalDocuments}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      +{analytics.newDocumentsLast7Days} this week
                    </p>
                  </div>
                  <FileText className="text-purple-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Exercises</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {analytics.totalExercises}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <BookOpen className="text-yellow-500" size={32} />
                </div>
              </div>
            </div>

            {/* User Growth & Activity */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  User Growth
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">New Users (7 days)</span>
                    <span className="font-bold text-lg text-blue-600">
                      {analytics.newUsersLast7Days}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">New Users (30 days)</span>
                    <span className="font-bold text-lg text-blue-600">
                      {analytics.newUsersLast30Days}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Active Users (30 days)
                    </span>
                    <span className="font-bold text-lg text-green-600">
                      {analytics.activeUsers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-purple-600" />
                  Document Activity
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Total Documents</span>
                    <span className="font-bold text-lg text-purple-600">
                      {analytics.totalDocuments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">New Docs (7 days)</span>
                    <span className="font-bold text-lg text-purple-600">
                      {analytics.newDocumentsLast7Days}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Docs (30 days)</span>
                    <span className="font-bold text-lg text-purple-600">
                      {analytics.newDocumentsLast30Days}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Statistics */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Content Statistics
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Words Processed</span>
                    <span className="font-semibold">
                      {analytics.totalWords.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Avg Document Length</span>
                    <span className="font-semibold">
                      {analytics.averageDocumentLength.toLocaleString()} words
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Avg Docs per User</span>
                    <span className="font-semibold">
                      {analytics.avgDocumentsPerUser}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-orange-600" />
                  Exercise Activity
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Exercises</span>
                    <span className="font-semibold">
                      {analytics.totalExercises}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">
                      Avg Exercises per User
                    </span>
                    <span className="font-semibold">
                      {analytics.avgExercisesPerUser}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">
                      Total Users with Exercises
                    </span>
                    <span className="font-semibold">
                      {analytics.totalExercises > 0
                        ? Math.ceil(
                            analytics.totalExercises /
                              Math.max(analytics.avgExercisesPerUser, 1),
                          )
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            {Object.keys(analytics.categoryDistribution).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Document Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(analytics.categoryDistribution).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
                      >
                        <p className="text-sm font-semibold text-gray-700 mb-1 truncate">
                          {category}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {count}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={loadAnalytics}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Analytics
            </button>
          </>
        )}
      </div>
    </div>
  );
}
