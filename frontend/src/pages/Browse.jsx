import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const SERVICE_OPTIONS = [
  'ALL', 'TUTORING', 'PLUMBING', 'TAILORING', 'COOKING',
  'REPAIRS', 'ELECTRICAL', 'CLEANING', 'GARDENING',
];

function Browse() {
  const [providers, setProviders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const url = filter === 'ALL' ? '/providers' : `/providers?service=${filter}`;
    api.get(url)
      .then((res) => setProviders(res.data))
      .catch(() => setError('Failed to load providers'))
      .finally(() => setLoading(false));
  }, [filter]);

  const mapCenter = providers.length > 0
    ? [providers[0].latitude, providers[0].longitude]
    : [13.0067, 80.2206];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Browse Service Providers</h1>

        <div className="flex gap-2 flex-wrap mb-6">
          {SERVICE_OPTIONS.map((service) => (
            <button
              key={service}
              onClick={() => setFilter(service)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                filter === service
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {service}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-lg overflow-hidden border border-gray-300 shadow-md">
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {providers.map((p) => (
                p.latitude && p.longitude && (
                  <Marker key={p.id} position={[p.latitude, p.longitude]}>
                    <Popup>
                      <strong>{p.fullName}</strong><br />
                      {p.servicesOffered.join(', ')}
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading && <p className="text-gray-500">Loading...</p>}
            {!loading && providers.length === 0 && (
              <p className="text-gray-500">No providers found for this service.</p>
            )}
            {providers.map((p) => (
              <Link
                key={p.id}
                to={`/providers/${p.id}`}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  {p.profileImageUrl ? (
                    <img src={p.profileImageUrl} alt={p.fullName} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                      {p.fullName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {p.fullName} {p.verified && <span className="text-green-600 text-xs">✓ Verified</span>}
                    </p>
                    <p className="text-sm text-gray-500">{p.servicesOffered.join(', ')}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.bio}</p>
                {p.address && <p className="text-xs text-gray-400 mt-1">{p.address}</p>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Browse;