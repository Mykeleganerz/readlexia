import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AuthProvider } from './contexts/AuthContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationContainer } from './components/NotificationContainer';
import { setupGlobalErrorHandlers } from '../utils/errorLogger';

export default function App() {
  useEffect(() => {
    // Setup global error handlers on mount
    setupGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AccessibilityProvider>
          <DocumentProvider>
            <NotificationContainer />
            <RouterProvider router={router} />
          </DocumentProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
