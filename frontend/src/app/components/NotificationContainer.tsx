import { useEffect, useState } from 'react';
import {
  errorNotificationManager,
  ErrorNotification,
} from '../../utils/errorLogger';

const getBackgroundColor = (type: string): string => {
  switch (type) {
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'info':
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

const getTextColor = (type: string): string => {
  switch (type) {
    case 'error':
      return 'text-red-800';
    case 'warning':
      return 'text-yellow-800';
    case 'success':
      return 'text-green-800';
    case 'info':
    default:
      return 'text-blue-800';
  }
};

const getIconColor = (type: string): string => {
  switch (type) {
    case 'error':
      return 'text-red-400';
    case 'warning':
      return 'text-yellow-400';
    case 'success':
      return 'text-green-400';
    case 'info':
    default:
      return 'text-blue-400';
  }
};

const getIcon = (type: string): string => {
  switch (type) {
    case 'error':
      return '⚠️';
    case 'warning':
      return '⚡';
    case 'success':
      return '✅';
    case 'info':
    default:
      return 'ℹ️';
  }
};

interface NotificationToastProps {
  notification: ErrorNotification;
}

const NotificationToast = ({ notification }: NotificationToastProps) => {
  const bgColor = getBackgroundColor(notification.type);
  const textColor = getTextColor(notification.type);
  const icon = getIcon(notification.type);

  return (
    <div
      className={`rounded-lg border-l-4 p-4 shadow-md transition-all duration-300 ${bgColor}`}
      role="alert"
    >
      <div className="flex items-start">
        <span className="text-lg mr-3">{icon}</span>
        <div className="flex-1">
          <p className={`font-medium ${textColor}`}>{notification.message}</p>
        </div>
        {notification.dismissible && (
          <button
            onClick={() =>
              errorNotificationManager.removeNotification(notification.id)
            }
            className={`ml-2 ${textColor} hover:opacity-70 transition-opacity`}
            aria-label="Close notification"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export const NotificationContainer = () => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = errorNotificationManager.subscribe(setNotifications);

    // Set initial notifications
    setNotifications(errorNotificationManager.getNotifications());

    return unsubscribe;
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationContainer;
