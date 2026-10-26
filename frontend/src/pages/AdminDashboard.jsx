import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  ShieldAlert,
  Users,
  Briefcase,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  RefreshCw,
} from 'lucide-react';

const STATUS_CONFIG = {
  REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const RESOLVE_OPTIONS = ['COMPLETED', 'CANCELLED', 'REJECTED'];

function StatCard({ label, value, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-1">{value ?? '—'}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.indigo}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [bookingSearch, setBookingSearch] = useState('');

  const loadAll = (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/bookings'),
    ])
      .then(([statsRes, usersRes, bookingsRes]) => {
        setStats(statsRes.data);
        // Sort users descending by createdAt or ID so latest registered is first
        const sortedUsers = (usersRes.data || []).sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return (b.id || 0) - (a.id || 0);
        });
        setUsers(sortedUsers);
        setBookings(bookingsRes.data || []);
        setLastRefreshed(new Date());
      })
      .catch(() => setError('Failed to load admin telemetry. Ensure your user account has ROLE_ADMIN.'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleResolve = async (bookingId, status) => {
    if (!window.confirm(`Force resolve booking #${bookingId} to status "${status}"?`)) return;
    try {
      await api.patch(`/admin/bookings/${bookingId}/resolve?status=${status}`);
      loadAll(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve booking');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phoneNumber?.includes(userSearch) ||
      u.id?.toString().includes(userSearch);

    const matchesRole =
      userRoleFilter === 'ALL' ||
      u.roles?.some((r) => r.includes(userRoleFilter));

    return matchesSearch && matchesRole;
  });

  const filteredBookings = bookings.filter(
    (b) =>
      b.requesterName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.providerName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.serviceType?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.status?.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading admin operations center...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl border border-rose-200 text-center max-w-md w-full shadow-sm">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-500 mb-6">{error}</p>
          <button
            onClick={loadAll}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
          >
            Retry Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Administrative Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Governance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Community telemetry, registered user registry, and booking resolution controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
              Updated: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button
              onClick={() => loadAll(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh telemetry and users registry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Registered Users" value={stats.totalUsers} icon={Users} color="indigo" />
            <StatCard label="Total Providers" value={stats.totalProviders} icon={Briefcase} color="purple" />
            <StatCard label="Verified Pros" value={stats.verifiedProviders} icon={ShieldCheck} color="emerald" />
            <StatCard label="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} color="indigo" />
            <StatCard label="Completed Jobs" value={stats.completedBookings} icon={CheckCircle2} color="emerald" />
            <StatCard label="Active In-Flight" value={stats.activeBookings} icon={Clock} color="amber" />
            <StatCard label="Cancelled / Rejected" value={stats.cancelledOrRejectedBookings} icon={XCircle} color="rose" />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pt-2 pb-1">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              tab === 'users'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community Users Registry ({users.length})</span>
          </button>

          <button
            onClick={() => setTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              tab === 'bookings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Bookings & Resolution ({bookings.length})</span>
          </button>
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Registered Community Members</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                    {filteredUsers.length} of {users.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time directory of all registered customers, verified providers, and administrative staff
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'ALL', label: 'All Accounts' },
                { id: 'USER', label: 'Customers / Neighbors' },
                { id: 'PROVIDER', label: 'Service Providers' },
                { id: 'ADMIN', label: 'Administrators' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setUserRoleFilter(filter.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    userRoleFilter === filter.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">User Details</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Assigned Roles</th>
                    <th className="p-3.5">Registered On</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No registered users found matching &quot;{userSearch}&quot;
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => {
                      const isRecent = idx < 2 || (u.createdAt && (new Date() - new Date(u.createdAt)) < 86400000);
                      const formattedDate = u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Pre-existing';

                      return (
                        <tr key={u.id || idx} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5 font-mono text-[11px] text-slate-400">#{u.id}</td>
                          <td className="p-3.5 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-50 to-violet-50 text-indigo-600 border border-indigo-100/60 flex items-center justify-center font-bold text-xs shadow-2xs">
                                {u.fullName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-900">{u.fullName}</span>
                                  {isRecent && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide">
                                      NEW
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-600 font-medium">{u.email}</td>
                          <td className="p-3.5 text-slate-500">{u.phoneNumber || '—'}</td>
                          <td className="p-3.5">
                            <div className="flex gap-1 flex-wrap">
                              {u.roles?.map((r) => (
                                <span
                                  key={r}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    r.includes('ADMIN')
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : r.includes('PROVIDER')
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                  }`}
                                >
                                  {r.replace('ROLE_', '')}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-500 whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Resolution Tab */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-bold text-slate-900">
                All Bookings & Force Resolution ({filteredBookings.length})
              </h3>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search bookings or status..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {b.requesterName} &rarr; {b.providerName}
                        </span>
                        <span className="text-xs text-slate-400">#{b.id}</span>
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold">{b.serviceType}</p>
                    </div>

                    <span
                      className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold border ${
                        STATUS_CONFIG[b.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {b.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {b.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Force Resolve:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {RESOLVE_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleResolve(b.id, status)}
                          disabled={b.status === status}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition disabled:opacity-30"
                        >
                          Mark {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;