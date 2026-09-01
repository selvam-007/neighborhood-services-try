import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUS_COLORS = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const RESOLVE_OPTIONS = ['COMPLETED', 'CANCELLED', 'REJECTED'];

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="text-2xl font-bold text-blue-600">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/bookings'),
    ])
      .then(([statsRes, usersRes, bookingsRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setBookings(bookingsRes.data);
      })
      .catch(() => setError('Failed to load admin data (are you logged in as an admin?)'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleResolve = async (bookingId, status) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/resolve?status=${status}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 bg-red-50 p-4 rounded">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Total Providers" value={stats.totalProviders} />
          <StatCard label="Verified Providers" value={stats.verifiedProviders} />
          <StatCard label="Total Bookings" value={stats.totalBookings} />
          <StatCard label="Completed" value={stats.completedBookings} />
          <StatCard label="Active" value={stats.activeBookings} />
          <StatCard label="Cancelled/Rejected" value={stats.cancelledOrRejectedBookings} />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setTab('bookings')}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === 'bookings' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Bookings ({bookings.length})
          </button>
        </div>

        {tab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.phoneNumber || '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.map((r) => (
                          <span key={r} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                            {r.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'bookings' && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {b.requesterName} &rarr; {b.providerName}
                    </p>
                    <p className="text-sm text-gray-500">{b.serviceType}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                {b.notes && <p className="text-sm text-gray-600 mb-2">{b.notes}</p>}
                <div className="flex gap-2 flex-wrap items-center mt-2">
                  <span className="text-xs text-gray-400">Force resolve:</span>
                  {RESOLVE_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleResolve(b.id, status)}
                      disabled={b.status === status}
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 disabled:opacity-30"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;