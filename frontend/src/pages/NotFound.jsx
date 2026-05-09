import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ROLE_HOME = {
  customer:        '/dashboard',
  sales:           '/sales',
  engineer:        '/service',
  service_manager: '/service',
  admin:           '/admin',
};

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const homePath = user ? (ROLE_HOME[user.role] || '/') : '/';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Visual */}
        <div className="relative mb-8">
          <div className="text-[160px] font-black text-slate-100 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/30">
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to={homePath}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
