import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Ticket, DollarSign, Wrench, ShieldAlert, Loader, TrendingUp } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { AdminDashboardSkeleton } from '../../components/skeletons';
import { useDelayedLoading } from '../../hooks/useDelayedLoading';

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

export default function DashboardOverview() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState(null);
  const [barData, setBarData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  // Fetch all data in parallel with a single loading state
  const fetchAllData = useCallback(async () => {
    try {
      const [statsRes, sparesRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/spare-parts-usage')
      ]);
      if (!isMounted.current) return;
      setStats(statsRes.data.data);
      setBarData(sparesRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // Fetch revenue data separately when period changes
  const fetchRevenue = useCallback(async (period) => {
    try {
      const res = await api.get(`/admin/revenue-trend?period=${period}`);
      if (isMounted.current) setRevenueData(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch revenue trend:', error);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchAllData();
    return () => { isMounted.current = false; };
  }, [fetchAllData]);

  useEffect(() => {
    fetchRevenue(revenuePeriod);
  }, [revenuePeriod, fetchRevenue]);

  const showSkeleton = useDelayedLoading(loading);

  if (showSkeleton) {
    return <AdminDashboardSkeleton isDark={isDark} />;
  }

  const kpis = [
    {
      title: 'Total Tickets',
      value: stats?.totalTickets || 0,
      sub: `${stats?.openTickets || 0} Open / ${stats?.closedTickets || 0} Closed`,
      icon: <Ticket className="text-blue-700 w-8 h-8" />,
      bg: 'bg-blue-50 dark:bg-blue-900/10'
    },
    {
      title: 'Total Revenue',
      value: `₹${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L`,
      sub: 'From completed tickets',
      icon: <DollarSign className="text-green-700 w-8 h-8" />,
      bg: 'bg-green-50 dark:bg-green-900/10'
    },
    {
      title: 'Active Repairs',
      value: stats?.activeRepairs || 0,
      sub: 'In service centers',
      icon: <Wrench className="text-amber-700 w-8 h-8" />,
      bg: 'bg-amber-50 dark:bg-amber-900/10'
    },
    {
      title: 'Warranty Claims',
      value: stats?.warrantyClaimsCount || 0,
      sub: 'In warranty',
      icon: <ShieldAlert className="text-red-700 w-8 h-8" />,
      bg: 'bg-red-50 dark:bg-red-900/10'
    },
  ];

  // Enhanced pie data with all statuses
  const pieData = [
    { name: 'Under Pickup', value: stats?.ticketsByStatus?.underPickup || 0 },
    { name: 'Pickup Scheduled', value: stats?.ticketsByStatus?.pickupScheduled || 0 },
    { name: 'In Transit', value: stats?.ticketsByStatus?.onTransit || 0 },
    { name: 'Received', value: stats?.ticketsByStatus?.received || 0 },
    { name: 'Under Repair', value: stats?.ticketsByStatus?.repair || 0 },
    { name: 'Ready to Dispatch', value: stats?.ticketsByStatus?.readyToDispatch || 0 },
    { name: 'Dispatched', value: stats?.ticketsByStatus?.dispatched || 0 },
    { name: 'Closed', value: stats?.ticketsByStatus?.closed || 0 },
  ].filter(item => item.value > 0);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
          <p>{payload[0].name}: <strong>{payload[0].value}</strong></p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
          <p className="font-semibold">{label}</p>
          <p>Used: <strong>{payload[0].value} units</strong></p>
        </div>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
          <p className="font-semibold">{label}</p>
          <p>Revenue: <strong>₹{(payload[0].value / 1000).toFixed(1)}K</strong></p>
          {payload[0].payload.invoices && <p className="text-xs opacity-70">{payload[0].payload.invoices} invoice(s)</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 animate-fade-in pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`flex justify-between items-end border-b pb-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Analytics</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>High-level overview of business operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl shadow-sm border flex items-center justify-between hover:shadow-md transition-shadow ${
              isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-gray-300 border-slate-100'
            }`}
          >
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.title}</p>
              <h3 className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{kpi.value}</h3>
              <p className={`text-xs font-medium mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.sub}</p>
            </div>
            <div className={`p-4 rounded-full ${kpi.bg}`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Pie Chart - Tickets by Status */}
        <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Tickets by Status</h3>
          <div className="h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex items-center justify-center h-full ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No ticket data available
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart - Dynamic Spare Parts Usage */}
        <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Spare Parts Usage</h3>
          <div className="h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: isDark ? '#334155' : '#f1f5f9' }} />
                  <Bar dataKey="usage" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex items-center justify-center h-full ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No spare parts usage data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Line Graph */}
      <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-700" />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Company Revenue Trend</h3>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-700">
            {['monthly', 'quarterly', 'yearly'].map(period => (
              <button
                key={period}
                onClick={() => setRevenuePeriod(period)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  revenuePeriod === period
                    ? 'bg-brand-500 text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickFormatter={val => `₹${(val / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-full ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No revenue data available for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
