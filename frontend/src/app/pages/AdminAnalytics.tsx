import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Navigate, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, FileText, Zap } from 'lucide-react';
import { errorLogger, errorNotificationManager } from '../../utils/errorLogger';
import apiClient from '../../services/api.service';

interface Analytics {
  totalUsers: number;
  totalDocuments: number;
  totalExercises: number;
  activeUsers: number;
  totalWords: number;
  averageDocumentLength: number;
  mostUsedFeature: string;
  systemHealth: {
    uptime: string;
    avgResponseTime: number;
    errorRate: number;
  };
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
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {analytics.totalUsers}
                    </p>
                  </div>
                  <Users className="text-blue-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {analytics.activeUsers}
                    </p>
                  </div>
                  <TrendingUp className="text-green-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Documents</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {analytics.totalDocuments}
                    </p>
                  </div>
                  <FileText className="text-purple-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Exercises</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {analytics.totalExercises}
                    </p>
                  </div>
                  <Zap className="text-yellow-500" size={32} />
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Document Length</span>
                    <span className="font-semibold">
                      {analytics.averageDocumentLength} words
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most Used Feature</span>
                    <span className="font-semibold">
                      {analytics.mostUsedFeature}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  System Health
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-semibold">
                      {analytics.systemHealth.uptime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response Time</span>
                    <span className="font-semibold">
                      {analytics.systemHealth.avgResponseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Rate</span>
                    <span
                      className={`font-semibold ${analytics.systemHealth.errorRate > 1 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {analytics.systemHealth.errorRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
