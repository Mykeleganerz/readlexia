import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import {
  supportTicketsService,
  SupportTicket,
} from '../../services/support-tickets.service';
import { errorLogger, errorNotificationManager } from '../../utils/errorLogger';

export function UserSupportTicket() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setError('Ticket ID not provided');
      return;
    }
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      errorLogger.info('Fetching support ticket', { ticketId });
      const data = await supportTicketsService.getById(Number(ticketId));
      setTicket(data);
      errorLogger.info('Support ticket loaded');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load ticket';
      errorLogger.error('Failed to load support ticket', { error: err });
      setError(message);
      errorNotificationManager.error('Failed to load support ticket');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-center mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/notifications')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Notifications
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-red-600 flex-shrink-0 mt-1"
                size={24}
              />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">
                  Unable to Load Ticket
                </h3>
                <p className="text-red-700">
                  {error ||
                    'The support ticket could not be found. It may have been deleted.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/notifications')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Notifications
        </button>

        {/* Ticket Details */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {ticket.subject}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(
                  ticket.priority,
                )}`}
              >
                Priority:{' '}
                {ticket.priority.charAt(0).toUpperCase() +
                  ticket.priority.slice(1)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                  ticket.status,
                )}`}
              >
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">
                Created
              </p>
              <div className="flex items-center gap-2 mt-1 text-gray-700">
                <Clock size={16} />
                {new Date(ticket.createdAt).toLocaleDateString()}{' '}
                {new Date(ticket.createdAt).toLocaleTimeString()}
              </div>
            </div>
            {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase">
                  Last Updated
                </p>
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <Clock size={16} />
                  {new Date(ticket.updatedAt).toLocaleDateString()}{' '}
                  {new Date(ticket.updatedAt).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Your Message
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-700 whitespace-pre-wrap">
              {ticket.message}
            </div>
          </div>

          {/* Response */}
          {ticket.response ? (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                Admin Response
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-gray-700 whitespace-pre-wrap">
                {ticket.response}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800">
                <strong>Waiting for response:</strong> Our support team is
                reviewing your ticket. You'll receive a notification when they
                respond.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
