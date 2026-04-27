import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, LogOut, LayoutDashboard, Ticket, ShieldCheck, Truck, Activity, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function SalesLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Overview', path: '/sales', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: 'Ticket Creation', path: '/sales/ticket', icon: <Ticket className="w-5 h-5 mr-3" /> },
    { name: 'Warranty Tool', path: '/sales/warranty', icon: <ShieldCheck className="w-5 h-5 mr-3" /> },
    { name: 'Logistics', path: '/sales/logistics', icon: <Truck className="w-5 h-5 mr-3" /> },
    { name: 'Tracker', path: '/sales/tracker', icon: <Activity className="w-5 h-5 mr-3" /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center mb-6">
        <Sun className="h-8 w-8 text-brand-500" />
        <span className="ml-3 text-xl font-bold text-white tracking-tight">Sales & BD</span>
      </div>
      
      <div className="px-4 mb-4">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Logged in as</p>
        <div className="bg-slate-800/50 rounded-lg p-3 text-sm font-medium text-slate-200 truncate border border-slate-700">
          {user?.name || 'Sales'}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              location.pathname === link.path || (link.path !== '/sales' && location.pathname.startsWith(link.path))
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Top Navigation */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-50 flex items-center justify-between p-4">
        <div className="flex items-center">
          <Sun className="h-8 w-8 text-brand-500" />
          <span className="ml-3 text-xl font-bold text-white tracking-tight">Sales & BD</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-300 hover:text-white focus:outline-none p-1"
        >
          {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 flex flex-col pt-20">
          <SidebarContent />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col shadow-xl hidden md:flex fixed h-full z-10 bottom-0 top-0">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:ml-64 bg-slate-50 min-h-screen pt-20 md:pt-0">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
