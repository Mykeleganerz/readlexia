/**
 * Frontend Error Logger - Logs errors to console and optionally sends to backend
 * Provides structured error tracking and reporting
 */

export interface ErrorLog {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    context?: Record<string, any>;
    stack?: string;
    requestId?: string;
}

class ErrorLogger {
    private logs: ErrorLog[] = [];
    private maxLogs = 100;
    private eventListeners: ((log: ErrorLog) => void)[] = [];

    /**
     * Log an error
     */
    log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, any>, stack?: string) {
        const log: ErrorLog = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            stack,
        };

        // Store in memory
        this.logs.push(log);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Notify listeners
        this.eventListeners.forEach(listener => listener(log));

        // Console output
        const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context, stack);
    }

    /**
     * Log error
     */
    error(message: string, context?: Record<string, any>, stack?: string) {
        this.log('error', message, context, stack);
    }

    /**
     * Log warning
     */
    warn(message: string, context?: Record<string, any>) {
        this.log('warn', message, context);
    }

    /**
     * Log info
     */
    info(message: string, context?: Record<string, any>) {
        this.log('info', message, context);
    }

    /**
     * Subscribe to error events
     */
    subscribe(listener: (log: ErrorLog) => void): () => void {
        this.eventListeners.push(listener);
        return () => {
            this.eventListeners = this.eventListeners.filter(l => l !== listener);
        };
    }

    /**
     * Get all logs
     */
    getLogs(): ErrorLog[] {
        return [...this.logs];
    }

    /**
     * Clear logs
     */
    clearLogs(): void {
        this.logs = [];
    }

    /**
     * Send logs to backend for analysis
     */
    async sendToBackend(apiEndpoint: string): Promise<void> {
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
                },
                body: JSON.stringify({
                    logs: this.logs,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                this.clearLogs();
                this.info('Error logs sent to backend');
            }
        } catch (error) {
            console.error('Failed to send error logs to backend', error);
        }
    }
}

export const errorLogger = new ErrorLogger();

/**
 * Error notification system
 */
export interface ErrorNotification {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
    duration?: number;
    dismissible?: boolean;
}

class ErrorNotificationManager {
    private notifications: Map<string, ErrorNotification> = new Map();
    private listeners: ((notifications: ErrorNotification[]) => void)[] = [];

    /**
     * Add notification
     */
    addNotification(message: string, type: 'error' | 'warning' | 'info' | 'success' = 'info', duration = 5000): string {
        const id = `notification-${Date.now()}-${Math.random()}`;
        const notification: ErrorNotification = {
            id,
            message,
            type,
            duration,
            dismissible: true,
        };

        this.notifications.set(id, notification);
        this.notifyListeners();

        if (duration > 0) {
            setTimeout(() => this.removeNotification(id), duration);
        }

        return id;
    }

    /**
     * Add error notification
     */
    error(message: string, duration = 5000): string {
        return this.addNotification(message, 'error', duration);
    }

    /**
     * Add warning notification
     */
    warning(message: string, duration = 5000): string {
        return this.addNotification(message, 'warning', duration);
    }

    /**
     * Add success notification
     */
    success(message: string, duration = 3000): string {
        return this.addNotification(message, 'success', duration);
    }

    /**
     * Add info notification
     */
    info(message: string, duration = 5000): string {
        return this.addNotification(message, 'info', duration);
    }

    /**
     * Remove notification
     */
    removeNotification(id: string): void {
        this.notifications.delete(id);
        this.notifyListeners();
    }

    /**
     * Get all notifications
     */
    getNotifications(): ErrorNotification[] {
        return Array.from(this.notifications.values());
    }

    /**
     * Subscribe to notification changes
     */
    subscribe(listener: (notifications: ErrorNotification[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Clear all notifications
     */
    clearAll(): void {
        this.notifications.clear();
        this.notifyListeners();
    }

    private notifyListeners(): void {
        const notifications = this.getNotifications();
        this.listeners.forEach(listener => listener(notifications));
    }
}

export const errorNotificationManager = new ErrorNotificationManager();

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const message = reason instanceof Error ? reason.message : String(reason);
        errorLogger.error(`Unhandled Promise Rejection: ${message}`, { reason }, reason instanceof Error ? reason.stack : undefined);
        errorNotificationManager.error('An unexpected error occurred. Please try again.');
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
        const message = event.message || 'Unknown error';
        errorLogger.error(`Global Error: ${message}`, { filename: event.filename, lineno: event.lineno, colno: event.colno }, event.error?.stack);
        errorNotificationManager.error('An unexpected error occurred. Please try again.');
    });
}
