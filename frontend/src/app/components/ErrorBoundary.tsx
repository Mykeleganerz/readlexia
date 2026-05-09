import { Component, ErrorInfo, ReactNode } from 'react';
import { errorLogger, errorNotificationManager } from '../../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `error-${Date.now()}`;
    this.setState({ errorId });

    // Log the error
    errorLogger.error(
      `React Error Boundary: ${error.message}`,
      {
        componentStack: errorInfo.componentStack,
        errorId,
      },
      error.stack,
    );

    // Show user notification
    errorNotificationManager.error(
      error.message ||
        'An unexpected error occurred. Please refresh the page if this persists.',
      0, // Don't auto-dismiss
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.state.errorId && (
              <p className="text-gray-500 text-sm mb-6">
                Error ID:{' '}
                <code className="bg-gray-100 px-2 py-1">
                  {this.state.errorId}
                </code>
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
