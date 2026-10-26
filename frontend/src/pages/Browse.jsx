import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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
  Navigation,
  Compass,
  Crosshair,
  LocateFixed,
  Route,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

// Fix Leaflet marker icon asset bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper for Haversine distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distKm) {
  if (distKm == null) return null;
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m away`;
  }
  return `${distKm.toFixed(1)} km away`;
}

function formatTravelTime(distKm) {
  if (distKm == null) return null;
  const mins = Math.max(2, Math.round(distKm * 3.5));
  return `~${mins} mins drive`;
}

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

const NEIGHBORHOOD_PRESETS = [
  { name: 'Anna Nagar (Central)', lat: 13.085, lng: 80.21 },
  { name: 'T. Nagar (Panagal Park)', lat: 13.0418, lng: 80.2341 },
  { name: 'Velachery (Main Road)', lat: 12.979, lng: 80.2209 },
  { name: 'Kilpauk (Garden Colony)', lat: 13.0805, lng: 80.245 },
  { name: 'Adyar (South Hub)', lat: 13.0012, lng: 80.2565 },
  { name: 'Nungambakkam (Metro)', lat: 13.0595, lng: 80.2425 },
];

// MapController for smooth pan & zoom animations
function MapController({ center, selectedCoords }) {
  const map = useMap();

  useEffect(() => {
    if (selectedCoords && selectedCoords[0] && selectedCoords[1]) {
      map.flyTo(selectedCoords, 14, { duration: 0.8 });
    } else if (center && center[0] && center[1]) {
      map.flyTo(center, 13, { duration: 0.8 });
    }
  }, [center, selectedCoords, map]);

  return null;
}

function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const initialCategory = searchParams.get('service') || 'ALL';
  const initialSearch = searchParams.get('search') || '';
  const initialView = location.pathname === '/map' ? 'map' : (searchParams.get('view') || 'split');

  const [filter, setFilter] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(initialView); // 'split', 'list', 'map'
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  // Live User Location state
  const [userLocation, setUserLocation] = useState({
    lat: 13.0067,
    lng: 80.2206,
    name: 'Chennai District (Default GPS)',
  });
  const [isLocating, setIsLocating] = useState(false);
  const [hasLiveGPS, setHasLiveGPS] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Filters & Sorting
  const [sortBy, setSortBy] = useState('NEAREST'); // 'NEAREST', 'RATING', 'REVIEWS'
  const [radiusFilter, setRadiusFilter] = useState('ALL'); // 'ALL', '3', '5', '10', '25'

  // Request browser live GPS location
  const requestLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Your Live GPS Location',
        });
        setHasLiveGPS(true);
        setIsLocating(false);
      },
      () => {
        setGpsError('GPS permission was not granted. Using neighborhood selection.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Sync category & view state with URL params
  useEffect(() => {
    const s = searchParams.get('service');
    if (s && s !== filter) setFilter(s);

    const v = searchParams.get('view');
    if (v && ['split', 'list', 'map'].includes(v) && v !== viewMode) {
      setViewMode(v);
    }
  }, [searchParams, filter, viewMode]);

  // Load providers from backend
  useEffect(() => {
    setLoading(true);
    setError('');
    const url = filter === 'ALL' ? '/providers' : `/providers?service=${filter}`;
    api
      .get(url)
      .then((res) => setProviders(res.data || []))
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

  const handleViewChange = (mode) => {
    setViewMode(mode);
    searchParams.set('view', mode);
    setSearchParams(searchParams);
  };

  const handlePresetSelect = (preset) => {
    setUserLocation({
      lat: preset.lat,
      lng: preset.lng,
      name: preset.name,
    });
    setHasLiveGPS(false);
    setGpsError('');
  };

  // Compute live distance for all providers & filter / sort
  const computedProviders = useMemo(() => {
    return providers.map((p) => {
      const dist = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        p.latitude,
        p.longitude
      );
      return {
        ...p,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
        travelTimeFormatted: formatTravelTime(dist),
      };
    });
  }, [providers, userLocation]);

  // Filter providers by search query and radius
  const filteredAndSortedProviders = useMemo(() => {
    let result = computedProviders;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName?.toLowerCase().includes(query) ||
          p.bio?.toLowerCase().includes(query) ||
          p.address?.toLowerCase().includes(query) ||
          p.servicesOffered?.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (radiusFilter !== 'ALL') {
      const maxKm = Number(radiusFilter);
      result = result.filter((p) => p.distanceKm != null && p.distanceKm <= maxKm);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'NEAREST') {
        const da = a.distanceKm ?? 999999;
        const db = b.distanceKm ?? 999999;
        return da - db;
      }
      if (sortBy === 'RATING') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      if (sortBy === 'REVIEWS') {
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      }
      return 0;
    });

    return result;
  }, [computedProviders, searchTerm, radiusFilter, sortBy]);

  // Identify the closest provider
  const nearestProviderId = useMemo(() => {
    const withDistance = filteredAndSortedProviders.filter((p) => p.distanceKm != null);
    if (withDistance.length === 0) return null;
    return withDistance[0].id;
  }, [filteredAndSortedProviders]);

  const selectedProvider = useMemo(() => {
    return (
      filteredAndSortedProviders.find((p) => p.id === selectedProviderId) || null
    );
  }, [filteredAndSortedProviders, selectedProviderId]);

  // Create custom marker icons
  const userMarkerIcon = useMemo(() => {
    return L.divIcon({
      className: 'pulse-user-icon-container',
      html: `
        <div class="pulse-user-marker">
          <div class="pulse-user-ring"></div>
          <div class="pulse-user-dot"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  const getProviderIcon = useCallback(
    (p) => {
      const isSelected = selectedProviderId === p.id;
      const isNearest = nearestProviderId === p.id;
      const nameFirst = p.fullName ? p.fullName.split(' ')[0] : 'Pro';
      const rating = p.averageRating ? p.averageRating.toFixed(1) : '5.0';

      return L.divIcon({
        className: 'custom-provider-icon-wrapper',
        html: `
          <div class="custom-provider-pin ${isSelected ? 'is-selected' : ''} ${
          isNearest ? 'is-nearest' : ''
        }">
            <span>${isNearest ? '👑' : '📍'}</span>
            <span>${nameFirst}</span>
            <span style="opacity: 0.85; font-size: 10px;">• ${rating}★</span>
          </div>
        `,
        iconSize: [95, 28],
        iconAnchor: [47, 14],
      });
    },
    [selectedProviderId, nearestProviderId]
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Top Header & Search Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Neighborhood Providers & Live Map
                </h1>
                {hasLiveGPS ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live GPS Radar Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                    <Compass className="w-3 h-3" />
                    {userLocation.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredAndSortedProviders.length} specialists sorted by live proximity from your current location
              </p>
            </div>

            {/* Location selector, Search and View Switcher */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* GPS Locate Me Button */}
              <button
                onClick={requestLiveLocation}
                disabled={isLocating}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs border ${
                  hasLiveGPS
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
                title="Detect your exact live GPS location"
              >
                <LocateFixed
                  className={`w-4 h-4 ${isLocating ? 'animate-spin text-indigo-600' : ''}`}
                />
                <span className="whitespace-nowrap">
                  {isLocating ? 'Locating...' : hasLiveGPS ? 'GPS Locked' : 'Locate Me'}
                </span>
              </button>

              {/* Neighborhood Presets Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Change Area</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 hidden group-hover:block hover:block z-50">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5">
                    Select Test Neighborhood
                  </p>
                  {NEIGHBORHOOD_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition flex items-center justify-between"
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name, skill, street..."
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

              {/* View Switcher */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => handleViewChange('split')}
                  title="Split Map & List"
                  className={`p-1.5 rounded-lg text-xs font-medium transition ${
                    viewMode === 'split'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewChange('list')}
                  title="List View Only"
                  className={`p-1.5 rounded-lg text-xs font-medium transition ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewChange('map')}
                  title="Map Radar View Only"
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

          {/* Service Category Pills & Radius Filter */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs border-t border-slate-100 mt-2">
            <div className="flex items-center gap-2 shrink-0">
              {SERVICE_OPTIONS.map((service) => {
                const isSelected = filter === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleCategoryChange(service.id)}
                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all duration-150 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                  >
                    {service.label}
                  </button>
                );
              })}
            </div>

            {/* Proximity Radius Pills */}
            <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">
                Radius:
              </span>
              {[
                { id: 'ALL', label: 'All' },
                { id: '3', label: '< 3 km' },
                { id: '5', label: '< 5 km' },
                { id: '10', label: '< 10 km' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRadiusFilter(r.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    radiusFilter === r.id
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1 flex flex-col">
        {gpsError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <span>{gpsError}</span>
            <button
              onClick={() => setGpsError('')}
              className="text-xs font-bold text-amber-900 underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
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
              {/* Sort By controls */}
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold text-slate-700">
                  {filteredAndSortedProviders.length} Specialists Available
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400">Sort:</span>
                  {[
                    { id: 'NEAREST', label: 'Nearest GPS' },
                    { id: 'RATING', label: 'Top Rated' },
                    { id: 'REVIEWS', label: 'Most Reviews' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        sortBy === s.id
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

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

              {!loading && filteredAndSortedProviders.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                  <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    No service providers found
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                    {searchTerm
                      ? `We couldn't find any provider matching "${searchTerm}". Try expanding your radius or adjusting keywords.`
                      : 'There are currently no registered specialists in this category or within this distance radius.'}
                  </p>
                  {(filter !== 'ALL' || searchTerm || radiusFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setFilter('ALL');
                        setSearchTerm('');
                        setRadiusFilter('ALL');
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
                filteredAndSortedProviders.map((p) => {
                  const isSelected = selectedProviderId === p.id;
                  const isNearest = nearestProviderId === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProviderId(p.id)}
                      className={`group bg-white p-5 rounded-3xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-200/80 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Profile Image or Initials Avatar */}
                        {p.profileImageUrl ? (
                          <img
                            src={p.profileImageUrl}
                            alt={p.fullName}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 border-2 border-slate-100 shadow-xs"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
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
                                {isNearest && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200 animate-pulse">
                                    👑 Nearest Specialist
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

                            {/* Proximity & Rating Badges */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                <span className="text-xs font-bold text-slate-800">
                                  {p.averageRating ? p.averageRating.toFixed(1) : '5.0'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  ({p.totalReviews || 0})
                                </span>
                              </div>

                              {p.distanceFormatted && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                                  <Navigation className="w-2.5 h-2.5" />
                                  <span>{p.distanceFormatted}</span>
                                </div>
                              )}
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
                                className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                              >
                                {service}
                              </span>
                            ))}
                          </div>

                          {/* Footer action button */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {p.travelTimeFormatted ? `🚗 ${p.travelTimeFormatted}` : p.availability ? `📅 ${p.availability}` : 'Flexible availability'}
                            </span>

                            <div className="flex items-center gap-2">
                              {viewMode === 'split' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProviderId(p.id);
                                  }}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                                >
                                  Pin on Map
                                </button>
                              )}
                              <Link
                                to={`/providers/${p.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20 transition-all"
                              >
                                <span>Book Now</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
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
              } sticky top-44 h-[480px] lg:h-[calc(100vh-13rem)] rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 relative`}
            >
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-10"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Smooth Camera Flight Controller */}
                <MapController
                  center={[userLocation.lat, userLocation.lng]}
                  selectedCoords={
                    selectedProvider && selectedProvider.latitude && selectedProvider.longitude
                      ? [selectedProvider.latitude, selectedProvider.longitude]
                      : null
                  }
                />

                {/* User Live GPS Marker */}
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userMarkerIcon}
                >
                  <Popup>
                    <div className="p-1 text-center min-w-[150px]">
                      <div className="inline-flex items-center gap-1 text-indigo-600 font-extrabold text-xs mb-1">
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>Your Current Location</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{userLocation.name}</p>
                      <p className="text-[11px] text-slate-500">Live GPS reference point</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Polyline Route to Selected Provider */}
                {selectedProvider &&
                  selectedProvider.latitude &&
                  selectedProvider.longitude && (
                    <Polyline
                      positions={[
                        [userLocation.lat, userLocation.lng],
                        [selectedProvider.latitude, selectedProvider.longitude],
                      ]}
                      pathOptions={{
                        color: '#4f46e5',
                        weight: 3,
                        dashArray: '6, 8',
                        opacity: 0.85,
                      }}
                    />
                  )}

                {/* Provider Markers */}
                {filteredAndSortedProviders.map((p) => {
                  if (!p.latitude || !p.longitude) return null;
                  return (
                    <Marker
                      key={p.id}
                      position={[p.latitude, p.longitude]}
                      icon={getProviderIcon(p)}
                      eventHandlers={{
                        click: () => setSelectedProviderId(p.id),
                      }}
                    >
                      <Popup>
                        <div className="p-1 min-w-[180px]">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <p className="font-bold text-slate-900 text-sm">{p.fullName}</p>
                            {p.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          {p.distanceFormatted && (
                            <p className="text-xs text-indigo-600 font-bold mb-1 flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              <span>{p.distanceFormatted}</span>
                              {p.travelTimeFormatted && (
                                <span className="text-slate-400 font-normal">
                                  ({p.travelTimeFormatted})
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 mb-1">
                            {p.servicesOffered?.slice(0, 2).join(', ')}
                          </p>
                          {p.address && (
                            <p className="text-[10px] text-slate-400 mb-2 truncate">
                              📍 {p.address}
                            </p>
                          )}
                          <Link
                            to={`/providers/${p.id}`}
                            className="inline-block w-full text-center bg-indigo-600 text-white text-xs font-bold py-1.5 px-2 rounded-xl hover:bg-indigo-700 transition shadow-xs"
                          >
                            View Profile & Book
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Floating Live Details Card on Map for selected provider */}
              {selectedProvider && (
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-xl max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                        {selectedProvider.fullName?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {selectedProvider.fullName}
                          </h4>
                          {selectedProvider.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {nearestProviderId === selectedProvider.id && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[9px] font-extrabold border border-amber-200">
                              👑 Nearest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          {selectedProvider.distanceFormatted && (
                            <span className="font-bold text-indigo-600 flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {selectedProvider.distanceFormatted}
                            </span>
                          )}
                          {selectedProvider.travelTimeFormatted && (
                            <span className="text-slate-400">
                              {selectedProvider.travelTimeFormatted}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProviderId(null)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedProvider.latitude},${selectedProvider.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
                    >
                      <Route className="w-3.5 h-3.5" />
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    <Link
                      to={`/providers/${selectedProvider.id}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-indigo-600/30 transition flex items-center gap-1"
                    >
                      <span>Book Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Browse;