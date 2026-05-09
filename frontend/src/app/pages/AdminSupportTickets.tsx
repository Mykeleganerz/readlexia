import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';
import { Navigate, useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, User, CheckCircle } from 'lucide-react';
import { errorLogger, errorNotificationManager } from '../../utils/errorLogger';
import apiClient from '../../services/api.service';

interface SupportTicket {
  id: number;
  userId: number;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  response?: string;
}

export function AdminSupportTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [response, setResponse] = useState('');
  const [respondingTo, setRespondingTo] = useState<number | null>(null);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      errorLogger.info('Fetching support tickets');

      const response = await apiClient.get<SupportTicket[]>(
        '/admin/support-tickets',
      );
      setTickets(response.data);
      errorLogger.info('Support tickets loaded', {
        count: response.data.length,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load tickets';
      errorLogger.error(`Failed to load support tickets: ${message}`);
      setError(message);
      errorNotificationManager.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    try {
      errorLogger.info('Updating ticket status', { ticketId, newStatus });
      await apiClient.put(`/admin/support-tickets/${ticketId}`, {
        status: newStatus,
      });
      setTickets(
        tickets.map((t) =>
          t.id === ticketId ? { ...t, status: newStatus as any } : t,
        ),
      );
      errorLogger.info('Ticket status updated');
      errorNotificationManager.success('Ticket status updated');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update ticket';
      errorLogger.error(`Failed to update ticket: ${message}`);
      errorNotificationManager.error('Failed to update ticket status');
    }
  };

  const submitResponse = async (ticketId: number) => {
    if (!response.trim()) {
      errorNotificationManager.warning('Please enter a response');
      return;
    }

    try {
      errorLogger.info('Submitting ticket response', { ticketId });
      await apiClient.post(`/admin/support-tickets/${ticketId}/response`, {
        response,
      });
      setTickets(
        tickets.map((t) =>
          t.id === ticketId
            ? { ...t, response, status: 'in-progress' as const }
            : t,
        ),
      );
      setResponse('');
      setRespondingTo(null);
      errorLogger.info('Response submitted');
      errorNotificationManager.success('Response submitted');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit response';
      errorLogger.error(`Failed to submit response: ${message}`);
      errorNotificationManager.error('Failed to submit response');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gray-600">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            <p className="font-semibold">Error loading tickets</p>
            <button
              onClick={loadTickets}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y">
                {tickets.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare
                      size={40}
                      className="mx-auto mb-2 opacity-50"
                    />
                    <p>No support tickets found</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {ticket.subject}
                          </p>
                          <p className="text-sm text-gray-600">
                            {ticket.userName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span
                          className={`px-2 py-1 rounded ${getStatusColor(ticket.status)}`}
                        >
                          {ticket.status}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          {selectedTicket && (
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Ticket Details
              </h3>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Subject</p>
                  <p className="font-semibold">{selectedTicket.subject}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase">User</p>
                  <p className="font-semibold">{selectedTicket.userName}</p>
                  <p className="text-sm text-gray-600">
                    {selectedTicket.userEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase">Status</p>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      updateTicketStatus(selectedTicket.id, e.target.value)
                    }
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase">Priority</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(selectedTicket.priority)}`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase">Message</p>
                  <p className="text-sm bg-gray-50 p-3 rounded mt-1">
                    {selectedTicket.message}
                  </p>
                </div>

                {selectedTicket.response && (
                  <div>
                    <p className="text-xs text-gray-600 uppercase">
                      Admin Response
                    </p>
                    <p className="text-sm bg-green-50 p-3 rounded mt-1">
                      {selectedTicket.response}
                    </p>
                  </div>
                )}
              </div>

              {respondingTo === selectedTicket.id ? (
                <div className="space-y-2">
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitResponse(selectedTicket.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send Response
                    </button>
                    <button
                      onClick={() => setRespondingTo(null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setRespondingTo(selectedTicket.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Response
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
