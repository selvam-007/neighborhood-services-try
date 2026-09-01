import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import api from '../api/axios';

function ProviderDetail() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/providers/${id}`)
      .then((res) => setProvider(res.data))
      .catch(() => setError('Provider not found'))
      .finally(() => setLoading(false));
  }, [id]);

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
          <p className="text-red-600 mb-4">{error || 'Provider not found'}</p>
          <Link to="/browse" className="text-blue-600 font-semibold">Back to Browse</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <Link to="/browse" className="text-blue-600 text-sm mb-4 inline-block">&larr; Back to Browse</Link>

        <div className="flex items-center gap-4 mb-6">
          {provider.profileImageUrl ? (
            <img src={provider.profileImageUrl} alt={provider.fullName} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
              {provider.fullName?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {provider.fullName}
              {provider.verified && <span className="text-green-600 text-sm ml-2">✓ Verified</span>}
            </h1>
            <p className="text-sm text-gray-500">
              {provider.averageRating?.toFixed(1) || '0.0'} ★ ({provider.totalReviews || 0} reviews)
            </p>
          </div>
        </div>

        <h2 className="font-semibold text-gray-700 mb-1">About</h2>
        <p className="text-gray-600 mb-4">{provider.bio}</p>

        <h2 className="font-semibold text-gray-700 mb-1">Services Offered</h2>
        <div className="flex gap-2 flex-wrap mb-4">
          {provider.servicesOffered.map((s) => (
            <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">{s}</span>
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

        {provider.latitude && provider.longitude && (
          <div className="h-48 rounded overflow-hidden border border-gray-300 mb-4">
            <MapContainer
              center={[provider.latitude, provider.longitude]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
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

        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 py-2 rounded font-semibold cursor-not-allowed"
        >
          Book This Provider (coming in Phase 5)
        </button>
      </div>
    </div>
  );
}

export default ProviderDetail;