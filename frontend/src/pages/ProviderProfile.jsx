import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Save,
  Star,
  ShieldCheck,
  Eye,
} from 'lucide-react';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SERVICE_OPTIONS = [
  'TUTORING',
  'PLUMBING',
  'TAILORING',
  'COOKING',
  'REPAIRS',
  'ELECTRICAL',
  'CLEANING',
  'GARDENING',
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
  const [position, setPosition] = useState([13.0067, 80.2206]); // default Chennai
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/providers/profile/me')
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
        // First time creating profile — that's fine
      });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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

      setMessage('Provider profile and services updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save provider profile');
    } finally {
      setLoading(false);
    }
  };

  const activePhoto = imagePreview || currentImageUrl;

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header banner */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-indigo-600" />
            Provider Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your professional services, coverage location, and client booking terms.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
            {/* Photo & Basic Identity */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                Profile Photo
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative">
                  {activePhoto ? (
                    <img
                      src={activePhoto}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-3xl border-2 border-dashed border-indigo-200">
                      {user?.fullName?.charAt(0).toUpperCase() || 'P'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <label className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition border border-slate-200">
                    <span>Choose Photo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400">
                    JPG, PNG or WEBP. Clear friendly photos get 3x more bookings!
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Professional Bio & Experience <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Introduce yourself, your years of experience, certifications, and what sets your service apart..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Services Offered Selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Services You Offer
                </h3>
                <span className="text-xs text-indigo-600 font-semibold">
                  {services.length} selected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Check all categories you are qualified and ready to take jobs for.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {SERVICE_OPTIONS.map((service) => {
                  const selected = services.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        selected
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{service}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Address & Availability */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Neighborhood / Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14th Cross St, Indiranagar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Availability & Working Hours
                  </label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="e.g. Mon-Sat 9am - 6pm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Location Map Pin Picker */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Service Radius Pin
                </h3>
                <span className="text-[11px] text-slate-400">
                  Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Click anywhere on the map to place your service pin for clients searching nearby.
              </p>

              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Studio Profile...' : 'Save & Publish Profile'}</span>
            </button>
          </form>

          {/* Right Column: Live Customer Preview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Live Client View Preview</span>
              </div>

              {/* Preview Card */}
              <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-lg shadow-indigo-500/5 space-y-4">
                <div className="flex items-center gap-3">
                  {activePhoto ? (
                    <img
                      src={activePhoto}
                      alt="Preview"
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                      {user?.fullName?.charAt(0).toUpperCase() || 'P'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {user?.fullName || 'Your Name'}
                      </h4>
                      <span className="text-emerald-600 text-xs">✓</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="font-bold text-slate-700">5.0</span>
                      <span className="text-slate-400 text-[10px]">(New Pro)</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {bio || 'Your bio will appear here to clients browsing services...'}
                </p>

                <div className="flex flex-wrap gap-1">
                  {services.length > 0 ? (
                    services.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No services selected</span>
                  )}
                  {services.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{services.length - 3} more</span>
                  )}
                </div>

                {address && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-2 border-t border-slate-100">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{address}</span>
                  </p>
                )}

                <div className="pt-2 text-center">
                  <div className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold">
                    Request Booking Preview
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Provider Guarantee
                </p>
                <p className="text-[11px] text-slate-500">
                  Once published, local residents in your neighborhood can directly browse and book your services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderProfile;