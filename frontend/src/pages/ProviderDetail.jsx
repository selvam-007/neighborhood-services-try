import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function ProviderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [serviceType, setServiceType] = useState("");
  const [notes, setNotes] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
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
      .catch(() => setError("Provider not found"))
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
    setBookingError("");
    setBookingMessage("");
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        providerId: provider.id,
        serviceType,
        notes,
        requestedDate: requestedDate || null,
      });
      setBookingMessage(
        'Booking request sent! Check "My Bookings" to track it.',
      );
      setNotes("");
      setRequestedDate("");
    } catch (err) {
      setBookingError(
        err.response?.data?.error || "Failed to send booking request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Provider not found"}</p>
          <Link to="/browse" className="text-blue-600 font-semibold">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && user.userId === provider.userId;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <Link to="/browse" className="text-blue-600 text-sm mb-4 inline-block">
          &larr; Back to Browse
        </Link>

        <div className="flex items-center gap-4 mb-6">
          {provider.profileImageUrl ? (
            <img
              src={provider.profileImageUrl}
              alt={provider.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
              {provider.fullName?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {provider.fullName}
              {provider.verified && (
                <span className="text-green-600 text-sm ml-2">✓ Verified</span>
              )}
            </h1>
            <p className="text-sm text-gray-500">
              {provider.averageRating?.toFixed(1) || "0.0"} ★ (
              {provider.totalReviews || 0} reviews)
            </p>
          </div>
        </div>

        <h2 className="font-semibold text-gray-700 mb-1">About</h2>
        <p className="text-gray-600 mb-4">{provider.bio}</p>

        <h2 className="font-semibold text-gray-700 mb-1">Services Offered</h2>
        <div className="flex gap-2 flex-wrap mb-4">
          {provider.servicesOffered.map((s) => (
            <span
              key={s}
              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
            >
              {s}
            </span>
          ))}
        </div>

        {provider.availability && (
          <>
            <h2 className="font-semibold text-gray-700 mb-1">Availability</h2>
            <p className="text-gray-600 mb-4">{provider.availability}</p>
          </>
        )}

        {provider.address && (
          <>
            <h2 className="font-semibold text-gray-700 mb-1">Location</h2>
            <p className="text-gray-600 mb-2">{provider.address}</p>
          </>
        )}

        {reviews.length > 0 && (
          <>
            <h2 className="font-semibold text-gray-700 mb-2">
              Reviews ({reviews.length})
            </h2>
            <div className="space-y-3 mb-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-gray-50 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-700">
                      {r.reviewerName}
                    </p>
                    <div className="text-yellow-400 text-sm">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {provider.latitude && provider.longitude && (
          <div className="h-48 rounded overflow-hidden border border-gray-300 mb-6">
            <MapContainer
              center={[provider.latitude, provider.longitude]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
              dragging={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[provider.latitude, provider.longitude]} />
            </MapContainer>
          </div>
        )}

        <hr className="mb-6" />

        {!user && (
          <p className="text-center text-gray-500">
            <Link to="/login" className="text-blue-600 font-semibold">
              Log in
            </Link>{" "}
            to book this provider.
          </p>
        )}

        {user && isOwnProfile && (
          <p className="text-center text-gray-500">
            This is your own provider profile.
          </p>
        )}

        {user && !isOwnProfile && (
          <form onSubmit={handleBooking}>
            <h2 className="font-semibold text-gray-700 mb-3">
              Request a Booking
            </h2>

            {bookingMessage && (
              <p className="text-green-600 bg-green-50 p-2 rounded mb-3 text-sm">
                {bookingMessage}
              </p>
            )}
            {bookingError && (
              <p className="text-red-600 bg-red-50 p-2 rounded mb-3 text-sm">
                {bookingError}
              </p>
            )}

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Service
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              required
            >
              {provider.servicesOffered.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Preferred Date (optional)
            </label>
            <input
              type="date"
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Describe what you need..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Booking Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProviderDetail;
