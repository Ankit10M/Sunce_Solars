import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, LogOut, Home, Info, Wrench, Phone, AlertCircle, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4 mr-2" /> },
    { name: 'About', path: '/dashboard/about', icon: <Info className="w-4 h-4 mr-2" />, protected: true },
    { name: 'Services', path: '/dashboard/services', icon: <Wrench className="w-4 h-4 mr-2" />, protected: true },
    { name: 'Contact', path: '/dashboard/contact', icon: <Phone className="w-4 h-4 mr-2" />, protected: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Sun className="h-8 w-8 text-brand-500" />
              <span className="ml-2 text-xl font-bold text-slate-800">Sunce Renewables</span>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                if (link.protected && !user) return null;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      location.pathname === link.path
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}
              <div className="ml-4 border-l pl-4 border-slate-200 flex items-center space-x-3">
                {user ? (
                  <>
                    {user.role === 'customer' && (
                      <div className="flex items-center gap-2">
                        <Link
                          to="/dashboard/profile"
                          className="flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/dashboard/complaint"
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg text-sm font-semibold hover:from-red-600 hover:to-rose-600 shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Raise Complaint
                        </Link>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-700">Hi, {user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                      title="Log out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setIsGetStartedOpen(!isGetStartedOpen)}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-lg text-sm font-semibold hover:from-brand-500 hover:to-brand-400 shadow-md shadow-brand-500/20 transition-all"
                    >
                      Get Started
                      <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isGetStartedOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isGetStartedOpen && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                        <Link
                          to="/login"
                          onClick={() => setIsGetStartedOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 border-b border-slate-100 font-medium"
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setIsGetStartedOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium"
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 shadow-lg absolute w-full z-40 top-16 left-0 animate-fade-in">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col space-y-3">
              {user ? (
                <>
                  {user.role === 'customer' && (
                    <>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-base font-semibold transition-all"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/dashboard/complaint"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg text-base font-semibold shadow-md hover:from-red-600 hover:to-rose-600 transition-all"
                      >
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Raise Complaint
                      </Link>
                    </>
                  )}
                  <div className="px-4 py-3 bg-brand-50 rounded-lg border border-brand-100">
                    <p className="text-sm font-medium text-brand-700">Hi, {user.name}!</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-base font-medium transition-colors border border-slate-200"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 bg-slate-800 text-white rounded-lg text-base font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-lg text-base font-semibold hover:from-brand-500 hover:to-brand-400 transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full mt-8 mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2024 Sunce Renewables Pvt. Ltd. All rights reserved.</p>
          <p className="mt-1">Sector 63A, Noida, Uttar Pradesh</p>
        </div>
      </footer>
    </div>
  );
}
