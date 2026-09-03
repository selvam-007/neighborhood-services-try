import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck,
  MessageSquare,
  Star,
  CreditCard,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Calendar,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const STATUS_CONFIG = {
  REQUESTED: {
    label: 'Requested',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    step: 1,
  },
  ACCEPTED: {
    label: 'Accepted',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    step: 2,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    step: 3,
  },
  COMPLETED: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    step: 4,
  },
  REJECTED: {
    label: 'Declined',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    step: 0,
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    step: 0,
  },
};

function BookingTimeline({ status }) {
  const currentStep = STATUS_CONFIG[status]?.step || 0;
  if (currentStep === 0) return null; // Don't show timeline for cancelled/rejected

  const steps = [
    { num: 1, title: 'Requested' },
    { num: 2, title: 'Accepted' },
    { num: 3, title: 'In Progress' },
    { num: 4, title: 'Completed' },
  ];

  return (
    <div className="py-3 px-2 border-y border-slate-100 my-3">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0" />
        {steps.map((s) => {
          const isDone = s.num <= currentStep;
          const isCurrent = s.num === currentStep;
          return (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isDone
                    ? 'bg-indigo-600 text-white shadow-xs ring-4 ring-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? '✓' : s.num}
              </div>
              <span
                className={`text-[10px] mt-1 font-semibold ${
                  isCurrent ? 'text-indigo-600' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingCard({ booking, isProvider, onAction }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [payment, setPayment] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!isProvider && booking.status === 'COMPLETED') {
      api
        .get(`/reviews/booking/${booking.id}/exists`)
        .then((res) => setReviewSubmitted(res.data.reviewed))
        .catch(() => {});
    }
  }, [booking.id, booking.status, isProvider]);

  useEffect(() => {
    if (booking.status === 'COMPLETED') {
      api
        .get(`/payments/booking/${booking.id}`)
        .then((res) => setPayment(res.data))
        .catch(() => setPayment(null));
    }
  }, [booking.id, booking.status]);

  const doAction = async (status) => {
    setActionLoading(true);
    await onAction(booking.id, status);
    setActionLoading(false);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await api.post('/reviews', { bookingId: booking.id, rating, comment });
      setReviewSubmitted(true);
      setShowReviewForm(false);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentLoading(true);
    try {
      const res = await api.post('/payments', {
        bookingId: booking.id,
        amount: parseFloat(amount),
        method,
        transactionReference,
      });
      setPayment(res.data);
      setShowPaymentForm(false);
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const confirmPayment = async () => {
    try {
      const res = await api.patch(`/payments/booking/${booking.id}/confirm`);
      setPayment(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm payment');
    }
  };

  const statusMeta = STATUS_CONFIG[booking.status] || STATUS_CONFIG.REQUESTED;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 sm:p-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
            {isProvider
              ? (booking.requesterName?.charAt(0).toUpperCase() || 'C')
              : (booking.providerName?.charAt(0).toUpperCase() || 'P')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                {isProvider ? booking.requesterName : booking.providerName}
              </h3>
              <span className="text-xs text-slate-400">#{booking.id}</span>
            </div>
            <p className="text-xs font-semibold text-indigo-600">
              Service: {booking.serviceType}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badge} self-start sm:self-auto`}
        >
          <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
          {statusMeta.label}
        </div>
      </div>

      {/* Booking Date & Notes */}
      <div className="space-y-1.5 text-xs text-slate-600 my-2">
        {booking.requestedDate && (
          <p className="flex items-center gap-1.5 font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Scheduled for: <span className="font-semibold text-slate-900">{booking.requestedDate}</span>
          </p>
        )}
        {booking.notes && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-xs">
            <span className="font-semibold text-slate-700">Notes:</span> {booking.notes}
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <BookingTimeline status={booking.status} />

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 flex-wrap pt-2">
        {/* Open Chat Link — only for active bookings */}
        {!['CANCELLED', 'REJECTED'].includes(booking.status) && (
          <Link
            to={`/bookings/${booking.id}/chat`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200/60"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat</span>
          </Link>
        )}

        {/* Provider Controls */}
        {isProvider && booking.status === 'REQUESTED' && (
          <>
            <button
              onClick={() => doAction('ACCEPTED')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accept Job
            </button>
            <button
              onClick={() => doAction('REJECTED')}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Decline
            </button>
          </>
        )}

        {isProvider && booking.status === 'ACCEPTED' && (
          <button
            onClick={() => doAction('IN_PROGRESS')}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Start Service
          </button>
        )}

        {isProvider && booking.status === 'IN_PROGRESS' && (
          <button
            onClick={() => doAction('COMPLETED')}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark as Completed
          </button>
        )}

        {/* Customer Controls */}
        {!isProvider && (booking.status === 'REQUESTED' || booking.status === 'ACCEPTED') && (
          <button
            onClick={() => doAction('CANCELLED')}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel Request
          </button>
        )}

        {/* Review Button */}
        {!isProvider && booking.status === 'COMPLETED' && !reviewSubmitted && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            Leave a Review
          </button>
        )}

        {!isProvider && reviewSubmitted && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" />
            Review Submitted
          </span>
        )}
      </div>

      {/* Review Form Drawer */}
      {showReviewForm && (
        <form onSubmit={submitReview} className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/70 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">Rate Provider Performance</h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="text-lg focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 ${
                      n <= rating
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-slate-300 fill-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {reviewError && (
            <p className="text-rose-600 text-xs font-medium">{reviewError}</p>
          )}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Share your experience with this specialist (optional)..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Publish Review
            </button>
          </div>
        </form>
      )}

      {/* Payment Section */}
      {booking.status === 'COMPLETED' && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {!payment && !isProvider && !showPaymentForm && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Service Payment
            </button>
          )}

          {!payment && showPaymentForm && (
            <form onSubmit={submitPayment} className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Record Completed Payment
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              {paymentError && (
                <p className="text-rose-600 text-xs font-medium">{paymentError}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Transaction Reference / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="UPI Ref ID or Note"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                {paymentLoading ? 'Recording...' : 'Confirm & Save Payment Record'}
              </button>
            </form>
          )}

          {payment && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">
                  Payment: ₹{payment.amount}{' '}
                  <span className="font-normal text-slate-500">
                    via {payment.method?.replace('_', ' ')}
                  </span>
                </p>
                {payment.transactionReference && (
                  <p className="text-slate-500 text-[11px]">
                    Ref: {payment.transactionReference}
                  </p>
                )}
                <span
                  className={`inline-block font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                    payment.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : payment.status === 'REFUNDED'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status: {payment.status}
                </span>
              </div>

              {isProvider && payment.status === 'PENDING' && (
                <button
                  onClick={confirmPayment}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Confirm Receipt
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MyBookings() {
  const { user } = useAuth();
  const [tab, setTab] = useState('requester');
  const [statusFilter, setStatusFilter] = useState('ALL');
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
        setRequesterBookings(reqRes.data || []);
        if (provRes) setProviderBookings(provRes.data || []);
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
      alert(err.response?.data?.error || 'Failed to update booking status');
    }
  };

  const rawList = tab === 'requester' ? requesterBookings : providerBookings;

  const filteredList = rawList.filter((b) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE')
      return ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status);
    if (statusFilter === 'COMPLETED') return b.status === 'COMPLETED';
    if (statusFilter === 'CANCELLED')
      return ['CANCELLED', 'REJECTED'].includes(b.status);
    return true;
  });

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Title & Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Bookings & Activity
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track requests, communicate with specialists, and manage service payments.
            </p>
          </div>

          <button
            onClick={loadBookings}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition shadow-xs"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Switcher (Requester vs Provider) */}
        {isProviderRole && (
          <div className="bg-slate-200/70 p-1 rounded-2xl flex gap-1 max-w-md">
            <button
              onClick={() => setTab('requester')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                tab === 'requester'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>As Requester</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700">
                {requesterBookings.length}
              </span>
            </button>

            <button
              onClick={() => setTab('provider')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                tab === 'provider'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>As Service Provider</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700">
                {providerBookings.length}
              </span>
            </button>
          </div>
        )}

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'Active / Pending' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled / Declined' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                statusFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-36"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredList.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No bookings found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {statusFilter === 'ALL'
                ? tab === 'requester'
                  ? 'You have not submitted any service booking requests yet.'
                  : 'You have not received any client bookings yet.'
                : 'No bookings matching the selected status filter.'}
            </p>
            {tab === 'requester' && (
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
              >
                <span>Browse Service Specialists</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        {/* Bookings List */}
        {!loading && (
          <div className="space-y-4">
            {filteredList.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isProvider={tab === 'provider'}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
