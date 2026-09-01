import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

function BookingCard({ booking, isProvider, onAction }) {
  const [actionLoading, setActionLoading] = useState(false);

  const doAction = async (status) => {
    setActionLoading(true);
    await onAction(booking.id, status);
    setActionLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-800">
            {isProvider ? `From: ${booking.requesterName}` : `Provider: ${booking.providerName}`}
          </p>
          <p className="text-sm text-gray-500">{booking.serviceType}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[booking.status]}`}>
          {booking.status}
        </span>
      </div>

      {booking.requestedDate && (
        <p className="text-sm text-gray-600 mb-1">📅 {booking.requestedDate}</p>
      )}
      {booking.notes && (
        <p className="text-sm text-gray-600 mb-3">{booking.notes}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        {isProvider && booking.status === 'REQUESTED' && (
          <>
            <button
              onClick={() => doAction('ACCEPTED')}
              disabled={actionLoading}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => doAction('REJECTED')}
              disabled={actionLoading}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}

        {isProvider && booking.status === 'ACCEPTED' && (
          <button
            onClick={() => doAction('IN_PROGRESS')}
            disabled={actionLoading}
            className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Start Work
          </button>
        )}

        {isProvider && booking.status === 'IN_PROGRESS' && (
          <button
            onClick={() => doAction('COMPLETED')}
            disabled={actionLoading}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Mark Completed
          </button>
        )}

        {!isProvider && booking.status === 'REQUESTED' && (
          <button
            onClick={() => doAction('CANCELLED')}
            disabled={actionLoading}
            className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        {(booking.status === 'ACCEPTED') && (
          <button
            onClick={() => doAction('CANCELLED')}
            disabled={actionLoading}
            className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function MyBookings() {
  const { user } = useAuth();
  const [tab, setTab] = useState('requester');
  const [requesterBookings, setRequesterBookings] = useState([]);
  const [providerBookings, setProviderBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isProviderRole = user?.roles?.includes('ROLE_PROVIDER');

  const loadBookings = () => {
    setLoading(true);
    const requests = [api.get('/bookings/as-requester')];
    if (isProviderRole) requests.push(api.get('/bookings/as-provider'));

    Promise.all(requests)
      .then(([reqRes, provRes]) => {
        setRequesterBookings(reqRes.data);
        if (provRes) setProviderBookings(provRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const activeList = tab === 'requester' ? requesterBookings : providerBookings;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">My Bookings</h1>

        {isProviderRole && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('requester')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                tab === 'requester' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              As Requester
            </button>
            <button
              onClick={() => setTab('provider')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                tab === 'provider' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              As Provider
            </button>
          </div>
        )}

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && activeList.length === 0 && (
          <p className="text-gray-500">No bookings here yet.</p>
        )}

        <div className="space-y-3">
          {activeList.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isProvider={tab === 'provider'}
              onAction={handleAction}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyBookings;