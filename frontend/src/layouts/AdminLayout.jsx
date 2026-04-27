import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, LogOut, LayoutDashboard, FileText, Users, TrendingUp, History, Menu, X, Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { api } from '../contexts/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const fetchPendingApprovals = async () => {
      try {
        const response = await api.get('/admin/pending-approvals', { signal: controller.signal });
        if (isMounted) setPendingCount(response.data.count);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Failed to fetch pending approvals:', error);
        }
      }
    };
    fetchPendingApprovals();
    const interval = setInterval(fetchPendingApprovals, 120000); // Refresh every 2 minutes instead of 30s
    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Analytics', path: '/admin', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: 'Ticket Master', path: '/admin/tickets', icon: <FileText className="w-5 h-5 mr-3" /> },
    { name: 'User Management', path: '/admin/users', icon: <Users className="w-5 h-5 mr-3" /> },
    { name: 'Financial & AMC', path: '/admin/financial', icon: <TrendingUp className="w-5 h-5 mr-3" /> },
    { name: 'System Logs', path: '/admin/logs', icon: <History className="w-5 h-5 mr-3" /> },
  ];

  const sidebarContent = (
    <>
      <div className={`p-6 flex items-center mb-6 ${isDark ? 'bg-slate-800 border-b border-slate-700' : ''}`}>
        <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg shadow-red-500/30 ring-1 ring-red-400/50">
          <ShieldAlert className="h-8 w-8 text-white" />
        </div>
        <span className={`ml-3 text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-white'}`}>Admin Console</span>
      </div>
      
      <div className="px-4 mb-4">
        <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>System Admin</p>
        <div className={`rounded-lg p-3 text-sm font-medium truncate border ${isDark ? 'bg-slate-700 text-slate-100 border-slate-600' : 'bg-slate-800/50 text-slate-200 border-slate-700'}`}>
          {user?.name || 'Admin'}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : isDark
                  ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t mt-auto space-y-2 ${isDark ? 'border-slate-700' : 'border-slate-800'}`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
            isDark
              ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
            isDark
              ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* Mobile Top Navigation */}
      <div className={`md:hidden fixed top-0 w-full z-50 flex items-center justify-between p-4 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center">
          <ShieldAlert className="h-6 w-6 text-red-500" />
          <span className="ml-3 text-lg font-bold text-white tracking-tight">Admin Console</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-slate-300 hover:text-white p-1"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="relative text-slate-300 hover:text-white focus:outline-none p-1"
            >
              <Bell className="h-6 w-6" />
              {pendingCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            {showNotificationMenu && pendingCount > 0 && (
              <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-xl z-50 ${isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-slate-200'}`}>
                <div className={`p-3 border-b font-semibold ${isDark ? 'border-slate-600 text-white' : 'border-slate-200 text-slate-800'}`}>
                  {pendingCount} New Employee{pendingCount > 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => {
                    navigate('/admin/users');
                    setShowNotificationMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-blue-500 hover:bg-slate-600/50"
                >
                  Review Approvals →
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-300 hover:text-white focus:outline-none p-1"
          >
            {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className={`md:hidden fixed inset-0 z-40 flex flex-col pt-0 ${isDark ? 'bg-slate-900/40' : 'bg-slate-900/40'} backdrop-blur-sm`}>
          <div className={`w-64 h-full flex flex-col shadow-2xl animate-fade-in-left pt-16 relative ${isDark ? 'bg-slate-800' : 'bg-slate-900'}`}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`w-64 text-slate-300 flex-col shadow-xl hidden md:flex fixed h-full z-10 bottom-0 top-0 border-r ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'}`}>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 w-full md:ml-64 min-h-screen pt-20 md:pt-0 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Desktop & Mobile Top Navigation Bar */}
        <div className={`flex items-center justify-between p-4 sm:p-8 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
          {/* Spacer for desktop */}
          <div className="hidden md:block flex-1"></div>

          {/* Notification Bell - Visible on both mobile and desktop */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className={`relative p-2 rounded-lg transition-colors flex items-center gap-2 ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
                title="Employee signup notifications"
              >
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className={`inline-flex items-center justify-center text-xs font-bold rounded-full w-5 h-5 ${pendingCount > 9 ? 'w-6' : ''} ${isDark ? 'bg-red-500 text-white' : 'bg-red-500 text-white'}`}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown Menu */}
              {showNotificationMenu && (
                <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-2xl z-50 animate-fade-in ${isDark ? 'bg-slate-700 border border-slate-600' : 'bg-gray-300 border border-slate-200'}`}>
                  <div className={`p-4 border-b font-semibold flex items-center justify-between ${isDark ? 'border-slate-600 text-white' : 'border-slate-200 text-slate-800'}`}>
                    <span> Employee Requests</span>
                    <span className={`text-sm font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{pendingCount} pending</span>
                  </div>
                  {pendingCount > 0 ? (
                    <>
                      <div className={`max-h-64 overflow-y-auto ${isDark ? 'divide-slate-600' : 'divide-slate-200'} divide-y`}>
                        <p className={`p-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          New employees are waiting for approval to access the system.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/admin/users');
                          setShowNotificationMenu(false);
                        }}
                        className={`w-full text-center px-4 py-3 text-sm font-semibold transition-colors ${isDark ? 'text-blue-400 hover:bg-slate-600' : 'text-blue-600 hover:bg-slate-50'} border-t ${isDark ? 'border-slate-600' : 'border-slate-200'}`}
                      >
                        Review All Requests →
                      </button>
                    </>
                  ) : (
                    <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      No pending approvals
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme toggle on desktop */}
            <button
              onClick={toggleTheme}
              className={`hidden md:flex p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
