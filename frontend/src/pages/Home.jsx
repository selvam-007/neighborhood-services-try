import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  MapPin,
  CalendarCheck,
  Briefcase,
  Wrench,
  Zap,
  Sparkles,
  BookOpen,
  Scissors,
  Utensils,
  Sprout,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'PLUMBING',
    name: 'Plumbing',
    description: 'Pipe leaks, taps, drain clogs & installations',
    icon: Wrench,
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-700',
  },
  {
    id: 'ELECTRICAL',
    name: 'Electrical',
    description: 'Wiring, fixtures, switches, tripping circuits & fans',
    icon: Zap,
    gradient: 'from-amber-500 to-yellow-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  {
    id: 'CLEANING',
    name: 'Cleaning',
    description: 'Deep home cleaning, sanitation & floor care',
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    id: 'TUTORING',
    name: 'Tutoring',
    description: 'Math, science, languages & school curriculum help',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-700',
  },
  {
    id: 'REPAIRS',
    name: 'Repairs',
    description: 'Home appliances, carpentry, doors & general fixes',
    icon: Wrench,
    gradient: 'from-orange-500 to-red-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  {
    id: 'GARDENING',
    name: 'Gardening',
    description: 'Lawn mowing, pruning, plant care & landscaping',
    icon: Sprout,
    gradient: 'from-green-500 to-emerald-700',
    bgLight: 'bg-green-50',
    textColor: 'text-green-700',
  },
  {
    id: 'COOKING',
    name: 'Cooking',
    description: 'Meal prep, home-style cuisine & catering helpers',
    icon: Utensils,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-700',
  },
  {
    id: 'TAILORING',
    name: 'Tailoring',
    description: 'Alterations, stitching, fitting & garment repair',
    icon: Scissors,
    gradient: 'from-fuchsia-500 to-violet-600',
    bgLight: 'bg-fuchsia-50',
    textColor: 'text-fuchsia-700',
  },
];

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isProvider = user?.roles?.includes('ROLE_PROVIDER');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="flex-1 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-900 text-white py-16 sm:py-24">
        {/* Subtle background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Trusted Neighborhood Marketplace
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
                {user?.fullName || 'Neighbor'}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Connect directly with verified local specialists for home repairs, maintenance, lessons, and personalized neighborhood services.
            </p>

            {/* Quick Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="flex-1 flex items-center px-3 gap-3 bg-white rounded-xl">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plumbers, tutors, electricians, cleaners..."
                  className="w-full py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 shrink-0"
              >
                <span>Find Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Live Map Callout & User status badges */}
            <div className="flex flex-wrap items-center gap-3 mt-6 text-xs text-slate-300">
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 text-xs font-bold border border-indigo-400/30 backdrop-blur-md transition shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                <span>📍 Open Live Map & Nearest Providers</span>
              </Link>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Logged in as {user?.email}
              </span>
              <span className="bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                Role: {isAdmin ? 'Administrator' : isProvider ? 'Service Provider' : 'Community Member'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Navigation Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Live Interactive Map */}
          <Link
            to="/map"
            className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                Live Interactive Map
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Detect your live GPS position, see nearest specialists ranked by distance, and get real-time driving estimates.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mt-4 group-hover:translate-x-1 transition-transform">
              <span>Launch Live Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2: My Bookings */}
          <Link
            to="/my-bookings"
            className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                My Bookings & Activity
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Track pending requests, active jobs, direct provider chat, and confirm payments seamlessly.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 mt-4 group-hover:translate-x-1 transition-transform">
              <span>View bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3: Provider Studio */}
          <Link
            to="/provider-profile"
            className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                {isProvider ? 'Manage Provider Studio' : 'Offer Services as Pro'}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {isProvider
                  ? 'Update your services, service radius, availability hours, and upload your profile picture.'
                  : 'Register your skills and start getting booking requests from neighbors right away.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
              <span>{isProvider ? 'Open studio' : 'Start offering'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 4: Admin Dashboard (Conditional) */}
          {isAdmin && (
            <Link
              to="/admin"
              className="group bg-gradient-to-br from-amber-50 to-orange-50/70 p-6 rounded-2xl border border-amber-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between sm:col-span-2 lg:col-span-3"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    System Administration Center
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    You have administrative privileges. Oversee registered users, provider verifications, and force-resolve escalated bookings.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mt-4 self-end">
                <span>Access Admin Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Popular Service Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a category to view specialized neighborhood providers near you.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>View all categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/browse?service=${cat.id}`}
                className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${cat.bgLight} ${cat.textColor} flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust & Community Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Why neighbors choose NeighborLink
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              We eliminate unpredictable contractors and hefty agency commissions. Every interaction stays transparent, local, and community-verified.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Direct In-App Messaging</h4>
                  <p className="text-xs text-slate-400">Chat directly with providers to confirm times, quotes, and directions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Genuine Local Reviews</h4>
                  <p className="text-xs text-slate-400">Ratings only from verified completed bookings by real neighbors.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Transparent Payment Records</h4>
                  <p className="text-xs text-slate-400">Track payments via UPI, Cash, or Transfer with dual provider confirmations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Community Map Precision</h4>
                  <p className="text-xs text-slate-400">Pinpoint specialists working right in your local district or colony.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;