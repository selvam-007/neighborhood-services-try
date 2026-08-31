import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Fix default marker icon (a common Leaflet + bundler quirk)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SERVICE_OPTIONS = [
  'TUTORING', 'PLUMBING', 'TAILORING', 'COOKING',
  'REPAIRS', 'ELECTRICAL', 'CLEANING', 'GARDENING',
];

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function ProviderProfile() {
  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [services, setServices] = useState([]);
  const [address, setAddress] = useState('');
  const [availability, setAvailability] = useState('');
  const [position, setPosition] = useState([13.0067, 80.2206]); // default: Chennai
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/providers/profile/me')
      .then((res) => {
        const p = res.data;
        setBio(p.bio || '');
        setServices(p.servicesOffered || []);
        setAddress(p.address || '');
        setAvailability(p.availability || '');
        if (p.latitude && p.longitude) setPosition([p.latitude, p.longitude]);
        setCurrentImageUrl(p.profileImageUrl || '');
      })
      .catch(() => {
        // No existing profile yet — that's fine, form starts empty
      });
  }, []);

  const toggleService = (service) => {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/providers/profile', {
        bio,
        servicesOffered: services,
        latitude: position[0],
        longitude: position[1],
        address,
        availability,
      });

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await api.post('/providers/profile/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCurrentImageUrl(uploadRes.data.profileImageUrl);
      }

      setMessage('Profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Provider Profile</h1>

        {message && <p className="text-green-600 bg-green-50 p-2 rounded mb-4">{message}</p>}
        {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>}

        {currentImageUrl && (
          <img src={currentImageUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4" />
        )}

        <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="mb-4"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <label className="block text-sm font-semibold text-gray-700 mb-2">Services Offered</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SERVICE_OPTIONS.map((service) => (
            <label key={service} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={services.includes(service)}
                onChange={() => toggleService(service)}
              />
              {service}
            </label>
          ))}
        </div>

        <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Availability</label>
        <input
          type="text"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          placeholder="e.g. Weekdays 5pm-9pm"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Location (click on the map to set your location)
        </label>
        <div className="h-64 rounded overflow-hidden mb-6 border border-gray-300">
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

export default ProviderProfile;