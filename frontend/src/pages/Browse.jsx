import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  ArrowRight,
  X,
  Layers,
  Map as MapIcon,
  List,
} from 'lucide-react';

// Fix Leaflet marker icon asset bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SERVICE_OPTIONS = [
  { id: 'ALL', label: 'All Services' },
  { id: 'PLUMBING', label: 'Plumbing' },
  { id: 'ELECTRICAL', label: 'Electrical' },
  { id: 'CLEANING', label: 'Cleaning' },
  { id: 'TUTORING', label: 'Tutoring' },
  { id: 'REPAIRS', label: 'Repairs' },
  { id: 'GARDENING', label: 'Gardening' },
  { id: 'COOKING', label: 'Cooking' },
  { id: 'TAILORING', label: 'Tailoring' },
];

function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('service') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [filter, setFilter] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'map'
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  // Sync category state with URL search params if changed from outside
  useEffect(() => {
    const s = searchParams.get('service');
    if (s && s !== filter) {
      setFilter(s);
    }
  }, [searchParams, filter]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const url = filter === 'ALL' ? '/providers' : `/providers?service=${filter}`;
    api
      .get(url)
      .then((res) => setProviders(res.data))
      .catch(() => setError('Failed to load local providers. Please check connection.'))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleCategoryChange = (category) => {
    setFilter(category);
    if (category === 'ALL') {
      searchParams.delete('service');
    } else {
      searchParams.set('service', category);
    }
    setSearchParams(searchParams);
  };

  // Filter providers by search term
  const filteredProviders = useMemo(() => {
    if (!searchTerm.trim()) return providers;
    const query = searchTerm.toLowerCase();
    return providers.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(query) ||
        p.bio?.toLowerCase().includes(query) ||
        p.address?.toLowerCase().includes(query) ||
        p.servicesOffered?.some((s) => s.toLowerCase().includes(query))
    );
  }, [providers, searchTerm]);

  // Center map on first provider or default to Chennai coordinates
  const mapCenter = useMemo(() => {
    const valid = providers.find((p) => p.latitude && p.longitude);
    return valid ? [valid.latitude, valid.longitude] : [13.0067, 80.2206];
  }, [providers]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Top Header & Search Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Neighborhood Providers
              </h1>
              <p className="text-xs text-slate-500">
                Found {filteredProviders.length} local specialists near your area
              </p>
            </div>

            {/* Search Input & View Switcher */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, skills or street..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm rounded-xl border border-transparent focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Toggle on desktop */}
              <div className="hidden lg:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('split')}
                  title="Split View"
                  className={`p-1.5 rounded-lg text-xs font-medium transition ${
                    viewMode === 'split'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List Only"
                  className={`p-1.5 rounded-lg text-xs font-medium transition ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  title="Map Only"
                  className={`p-1.5 rounded-lg text-xs font-medium transition ${
                    viewMode === 'map'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Service Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
            {SERVICE_OPTIONS.map((service) => {
              const isSelected = filter === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => handleCategoryChange(service.id)}
                  className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all duration-150 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {service.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => handleCategoryChange(filter)}
              className="text-xs underline font-semibold text-rose-800 ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Layout Grid based on ViewMode */}
        <div
          className={`grid gap-6 flex-1 ${
            viewMode === 'split'
              ? 'grid-cols-1 lg:grid-cols-12'
              : viewMode === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-1'
          }`}
        >
          {/* Provider Cards List */}
          {viewMode !== 'map' && (
            <div
              className={`${
                viewMode === 'split' ? 'lg:col-span-7' : 'w-full'
              } space-y-4`}
            >
              {loading && (
                <div className="space-y-4 py-8">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse flex gap-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/4" />
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filteredProviders.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                  <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    No service providers found
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                    {searchTerm
                      ? `We couldn't find any provider matching "${searchTerm}". Try adjusting your keywords or category filter.`
                      : 'There are currently no registered specialists in this category.'}
                  </p>
                  {(filter !== 'ALL' || searchTerm) && (
                    <button
                      onClick={() => {
                        setFilter('ALL');
                        setSearchTerm('');
                        searchParams.delete('service');
                        setSearchParams(searchParams);
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              )}

              {/* Provider Item Cards */}
              {!loading &&
                filteredProviders.map((p) => {
                  const isSelected = selectedProviderId === p.id;
                  return (
                    <div
                      key={p.id}
                      onMouseEnter={() => setSelectedProviderId(p.id)}
                      className={`group bg-white p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? 'border-indigo-400 ring-2 ring-indigo-500/10'
                          : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Profile Image or Initials Avatar */}
                        {p.profileImageUrl ? (
                          <img
                            src={p.profileImageUrl}
                            alt={p.fullName}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0 border-2 border-slate-100 shadow-xs"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
                            {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'P'}
                          </div>
                        )}

                        {/* Info details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                                  {p.fullName}
                                </h3>
                                {p.verified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified Pro
                                  </span>
                                )}
                              </div>

                              {p.address && (
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{p.address}</span>
                                </p>
                              )}
                            </div>

                            {/* Rating badge */}
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 shrink-0">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                              <span className="text-xs font-bold text-slate-800">
                                {p.averageRating ? p.averageRating.toFixed(1) : '5.0'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({p.totalReviews || 0})
                              </span>
                            </div>
                          </div>

                          {/* Bio */}
                          <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                            {p.bio || 'Local neighborhood service provider ready to assist with your home tasks.'}
                          </p>

                          {/* Services Offered Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-3">
                            {p.servicesOffered?.map((service) => (
                              <span
                                key={service}
                                className="px-2.5 py-0.5 rounded-md bg-indigo-50/80 text-indigo-700 text-[11px] font-medium border border-indigo-100"
                              >
                                {service}
                              </span>
                            ))}
                          </div>

                          {/* Footer action button */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {p.availability ? `📅 ${p.availability}` : 'Flexible availability'}
                            </span>

                            <Link
                              to={`/providers/${p.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all group-hover:shadow-md"
                            >
                              <span>View Profile & Book</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Interactive Leaflet Map */}
          {viewMode !== 'list' && (
            <div
              className={`${
                viewMode === 'split' ? 'lg:col-span-5' : 'w-full'
              } sticky top-44 h-[420px] lg:h-[calc(100vh-14rem)] rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100`}
            >
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="z-10"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredProviders.map(
                  (p) =>
                    p.latitude &&
                    p.longitude && (
                      <Marker
                        key={p.id}
                        position={[p.latitude, p.longitude]}
                        eventHandlers={{
                          click: () => setSelectedProviderId(p.id),
                        }}
                      >
                        <Popup>
                          <div className="p-1 min-w-[160px]">
                            <p className="font-bold text-slate-900 text-sm">{p.fullName}</p>
                            <p className="text-xs text-indigo-600 font-medium mb-1">
                              {p.servicesOffered?.slice(0, 2).join(', ')}
                            </p>
                            {p.address && <p className="text-[11px] text-slate-500 mb-2">{p.address}</p>}
                            <Link
                              to={`/providers/${p.id}`}
                              className="inline-block w-full text-center bg-indigo-600 text-white text-xs font-semibold py-1 px-2 rounded-lg hover:bg-indigo-700"
                            >
                              View Profile
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    )
                )}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Browse;