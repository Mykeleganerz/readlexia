import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Navigate, useNavigate } from 'react-router-dom';
import { usersService, User as ApiUser } from '../../services/users.service';
import { errorLogger, errorNotificationManager } from '../../utils/errorLogger';

export function AdminUserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      errorLogger.info('Loading admin users');
      const data = await usersService.getAll();
      setUsers(data);
      errorLogger.info('Users loaded successfully', { count: data.length });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load users';
      errorLogger.error(`Failed to load users: ${message}`);
      setError(message);
      errorNotificationManager.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleSuspend = async (userId: number, isSuspended: boolean) => {
    try {
      errorLogger.info('Toggling user suspend status', { userId, isSuspended });
      await usersService.update(userId, { isSuspended: !isSuspended });
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isSuspended: !isSuspended } : u,
        ),
      );
      errorLogger.info('User suspend status updated');
      errorNotificationManager.success(
        `User ${isSuspended ? 'unsuspended' : 'suspended'}`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to suspend/unsuspend user';
      errorLogger.error(`Failed to update user suspension: ${message}`);
      errorNotificationManager.error('Failed to update user suspension');
    }
  };

  const toggleRole = async (userId: number, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      errorLogger.info('Updating user role', { userId, newRole });
      await usersService.update(userId, { role: newRole });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      errorLogger.info('User role updated');
      errorNotificationManager.success(`User role changed to ${newRole}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update role';
      errorLogger.error(`Failed to update user role: ${message}`);
      errorNotificationManager.error('Failed to update user role');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            <p className="font-semibold">Error loading users</p>
            <button
              onClick={loadUsers}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-6 whitespace-nowrap">{u.id}</td>
                    <td className="py-3 px-6">
                      <div className="font-medium">{u.name}</div>
                    </td>
                    <td className="py-3 px-6">{u.email}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`py-1 px-3 rounded-full text-xs ${u.role === 'admin' ? 'bg-purple-200 text-purple-600' : 'bg-blue-200 text-blue-600'}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`py-1 px-3 rounded-full text-xs ${u.isSuspended ? 'bg-red-200 text-red-600' : 'bg-green-200 text-green-600'}`}
                      >
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center gap-2">
                        <button
                          onClick={() => toggleRole(u.id, u.role)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-xs transition-colors"
                        >
                          Make {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        <button
                          onClick={() => toggleSuspend(u.id, u.isSuspended)}
                          className={`${u.isSuspended ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-red-100 hover:bg-red-200 text-red-700'} py-1 px-3 rounded text-xs transition-colors`}
                        >
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
