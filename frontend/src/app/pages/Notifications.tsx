import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import {
  notificationsService,
  Notification,
} from '../../services/notifications.service';
import { errorLogger, errorNotificationManager } from '../../utils/errorLogger';
import { Trash2, CheckCheck, Bell } from 'lucide-react';

export function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getAll();
      setNotifications(data);
    } catch (error) {
      errorLogger.error('Failed to fetch notifications', { error });
      errorNotificationManager.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      errorNotificationManager.success('Notification marked as read');
    } catch (error) {
      errorLogger.error('Failed to mark notification as read', { error });
      errorNotificationManager.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      errorNotificationManager.success('All notifications marked as read');
    } catch (error) {
      errorLogger.error('Failed to mark all notifications as read', { error });
      errorNotificationManager.error(
        'Failed to mark all notifications as read',
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsService.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      errorNotificationManager.success('Notification deleted');
    } catch (error) {
      errorLogger.error('Failed to delete notification', { error });
      errorNotificationManager.error('Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }

    try {
      await notificationsService.deleteAll();
      setNotifications([]);
      errorNotificationManager.success('All notifications deleted');
    } catch (error) {
      errorLogger.error('Failed to delete all notifications', { error });
      errorNotificationManager.error('Failed to delete all notifications');
    }
  };

  if (!user) return null;

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ticket_update':
        return '🎫';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ticket_update':
        return 'border-l-blue-500 bg-blue-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={32} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-gray-600">
            Stay updated with your support tickets and system updates
          </p>
        </div>

        {/* Filter and Actions */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  <CheckCheck size={18} />
                  Mark All as Read
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 font-semibold transition-colors"
              >
                <Trash2 size={18} />
                Delete All
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet. When admins respond to your support tickets, you'll see them here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 rounded-lg shadow-lg p-6 transition-all ${getNotificationColor(
                  notification.type,
                )} ${!notification.isRead ? 'ring-2 ring-blue-300' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        {notification.title}
                        {!notification.isRead && (
                          <span className="ml-2 inline-block w-3 h-3 bg-blue-600 rounded-full" />
                        )}
                      </h3>
                      <p className="text-gray-700 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}{' '}
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                      {notification.relatedTicketId && (
                        <button
                          onClick={() =>
                            navigate(
                              `/user/support-tickets/${notification.relatedTicketId}`,
                            )
                          }
                          className="mt-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View Ticket →
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
