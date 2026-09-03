import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, HeartHandshake, Clock, Award } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      {/* Top trust highlights */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Verified Local Pros</p>
                <p className="text-xs text-slate-400">Identity & skill checked</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Neighborhood Trust</p>
                <p className="text-xs text-slate-400">Reviewed by true neighbors</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Rapid Booking</p>
                <p className="text-xs text-slate-400">Quick responses & live chat</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Fair & Direct</p>
                <p className="text-xs text-slate-400">Zero middleman hassle</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Neighbor<span className="text-indigo-400">Link</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering communities by connecting residents with trusted local service providers right next door.
            </p>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Popular Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse?service=PLUMBING" className="hover:text-white transition">
                  Plumbing Services
                </Link>
              </li>
              <li>
                <Link to="/browse?service=ELECTRICAL" className="hover:text-white transition">
                  Electrical & Wiring
                </Link>
              </li>
              <li>
                <Link to="/browse?service=TUTORING" className="hover:text-white transition">
                  Home Tutoring
                </Link>
              </li>
              <li>
                <Link to="/browse?service=CLEANING" className="hover:text-white transition">
                  Deep Cleaning
                </Link>
              </li>
              <li>
                <Link to="/browse?service=REPAIRS" className="hover:text-white transition">
                  Home Appliance Repairs
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Community Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse" className="hover:text-white transition">
                  Explore Service Map
                </Link>
              </li>
              <li>
                <Link to="/provider-profile" className="hover:text-white transition">
                  Register as Provider
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white transition">
                  Manage Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Safe Community Notice */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Community Safety
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Always verify service details and communicate via direct booking chat for safety and records.
            </p>
            <div className="text-[11px] text-indigo-400 font-medium">
              Need immediate support? Contact community moderation.
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {currentYear} NeighborLink. Built for vibrant, connected neighborhoods.</p>
          <div className="flex gap-6">
            <span>Verified Neighborhood Network</span>
            <span>Privacy & Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
