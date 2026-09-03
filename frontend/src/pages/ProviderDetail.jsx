import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Info,
} from 'lucide-react';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ProviderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api
      .get(`/providers/${id}`)
      .then((res) => {
        setProvider(res.data);
        if (res.data.servicesOffered?.length > 0) {
          setServiceType(res.data.servicesOffered[0]);
        }
      })
      .catch(() => setError('Service provider could not be found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api
      .get(`/reviews/provider/${id}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingMessage('');
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        providerId: provider.id,
        serviceType,
        notes,
        requestedDate: requestedDate || null,
      });
      setBookingMessage('Booking request successfully sent! Track progress in My Bookings.');
      setNotes('');
      setRequestedDate('');
    } catch (err) {
      setBookingError(
        err.response?.data?.error || 'Failed to submit booking request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading specialist profile...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 bg-slate-50">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full mx-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Provider Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'This profile is no longer available.'}</p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user.userId === provider.userId;

  return (
    <div className="flex-1 bg-slate-50 pb-16">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search Directory
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Hero Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                {/* Avatar */}
                {provider.profileImageUrl ? (
                  <img
                    src={provider.profileImageUrl}
                    alt={provider.fullName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-100 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-md shrink-0">
                    {provider.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Main Identity */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {provider.fullName}
                    </h1>
                    {provider.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Specialist
                      </span>
                    )}
                  </div>

                  {provider.address && (
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      {provider.address}
                    </p>
                  )}

                  {/* Rating stats */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/70">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span className="text-sm font-bold text-slate-800">
                        {provider.averageRating ? provider.averageRating.toFixed(1) : '5.0'}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({reviews.length || provider.totalReviews || 0} reviews)
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-medium">
                      Neighborhood Service Provider
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                About Specialist
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                {provider.bio || 'Experienced local professional dedicated to providing quality community services.'}
              </p>
            </div>

            {/* Services Offered */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Services & Skills Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {provider.servicesOffered?.map((s) => (
                  <span
                    key={s}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100/80 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability & Location Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Working hours */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Service Hours
                </h2>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Schedule</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {provider.availability || 'Weekdays & Weekends (Flexible)'}
                  </p>
                </div>
              </div>

              {/* Service Location */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Service Area
                </h2>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Base Location</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {provider.address || 'Servicing registered neighborhood radius'}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Map Preview */}
            {provider.latitude && provider.longitude && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 mb-4">Coverage Map</h2>
                <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                  <MapContainer
                    center={[provider.latitude, provider.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    dragging={false}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[provider.latitude, provider.longitude]} />
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Community Reviews ({reviews.length})
                  </h2>
                  <p className="text-xs text-slate-500">Feedback from neighbors who completed bookings</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span className="font-extrabold text-lg text-slate-800">
                    {provider.averageRating ? provider.averageRating.toFixed(1) : '5.0'}
                  </span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500">No reviews yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Book this provider and be the first to leave feedback!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {r.reviewerName ? r.reviewerName.charAt(0).toUpperCase() : 'N'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{r.reviewerName || 'Neighbor'}</p>
                            <span className="text-[10px] text-slate-400">Verified Client</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= r.rating
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-slate-200 fill-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {r.comment && (
                        <p className="text-xs sm:text-sm text-slate-600 pl-10 leading-relaxed">
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Request Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
                  <Calendar className="w-3 h-3" />
                  Direct Service Request
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Book Specialist</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Send a booking request with your preferred date and requirements.
                </p>
              </div>

              {!user && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center space-y-3">
                  <p className="text-xs text-slate-600">
                    You need to be signed in to submit a booking request.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                  >
                    Sign In to Continue
                  </Link>
                  <p className="text-[11px] text-slate-400">
                    New neighbor?{' '}
                    <Link to="/register" className="text-indigo-600 font-semibold underline">
                      Create account
                    </Link>
                  </p>
                </div>
              )}

              {user && isOwnProfile && (
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-center space-y-2">
                  <p className="text-xs font-bold text-amber-800">Your Provider Profile</p>
                  <p className="text-xs text-amber-700">
                    This is your public listing. Customers will see this card when booking your services.
                  </p>
                  <Link
                    to="/provider-profile"
                    className="inline-block mt-2 text-xs font-bold text-indigo-600 underline"
                  >
                    Edit your details & services
                  </Link>
                </div>
              )}

              {user && !isOwnProfile && (
                <form onSubmit={handleBooking} className="space-y-4">
                  {bookingMessage && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1.5">
                        <p className="font-semibold">{bookingMessage}</p>
                        <Link
                          to="/my-bookings"
                          className="inline-block text-[11px] font-bold text-emerald-900 underline"
                        >
                          View in My Bookings &rarr;
                        </Link>
                      </div>
                    </div>
                  )}

                  {bookingError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Select Service Needed <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      required
                    >
                      {provider.servicesOffered?.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Preferred Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Job Description & Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Describe what needs to be done, specific problems, or preferred time of day..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Booking Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Trust assurances */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Free cancellation before pro accepts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Direct messaging opens immediately</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Pay securely after work is completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderDetail;
