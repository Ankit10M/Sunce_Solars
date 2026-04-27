import { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, TrendingUp, Calendar, Filter } from 'lucide-react';
import { api } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const WarrantyBadge = ({ status }) => {
  const badges = {
    in_warranty: { color: 'bg-green-100 text-green-800', label: '✓ In Warranty' },
    out_of_warranty: { color: 'bg-red-100 text-red-800', label: '✗ Out of Warranty' },
    amc: { color: 'bg-blue-100 text-blue-800', label: '★ AMC Active' },
    unknown: { color: 'bg-slate-100 text-slate-800', label: '? Unknown' },
  };
  const badge = badges[status] || badges.unknown;
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.label}</span>;
};

export default function FinancialOversight() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    warranty: '',
    type: '', // 'amc' or 'warranty'
  });
  const [stats, setStats] = useState({
    totalInWarranty: 0,
    totalAMC: 0,
    outOfWarranty: 0,
    amcExpiringSoon: 0,
    warrantyExpiringSoon: 0,
  });

  useEffect(() => {
    const fetchWarrantyData = async () => {
      try {
        setLoading(true);
        const [ticketsRes, amcRes] = await Promise.all([
          api.get('/tickets?page=1&limit=100'),
          api.get('/amc/stats').catch(() => ({ data: { stats: {} } })),
        ]);
        const allTickets = ticketsRes.data.tickets || [];
        const amcStats = amcRes.data.stats || {};

        // Filter and calculate stats
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const inWarranty = allTickets.filter(t => t.warranty?.status === 'in_warranty').length;
        const outOfWarranty = allTickets.filter(t => t.warranty?.status === 'out_of_warranty').length;
        
        const warrantyExpiring = allTickets.filter(t => {
          if (!t.warranty?.expiryDate) return false;
          const expiry = new Date(t.warranty.expiryDate);
          return expiry <= thirtyDaysFromNow && expiry >= now;
        }).length;

        setStats({
          totalInWarranty: inWarranty,
          totalAMC: amcStats.totalActive || 0,
          outOfWarranty: outOfWarranty,
          amcExpiringSoon: amcStats.expiringSoon || 0,
          warrantyExpiringSoon: warrantyExpiring,
        });

        setTickets(allTickets);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load warranty data');
      } finally {
        setLoading(false);
      }
    };

    fetchWarrantyData();
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (filters.warranty && t.warranty?.status !== filters.warranty) return false;
    if (filters.type === 'amc' && !t.warranty?.hasAMC) return false;
    if (filters.type === 'warranty' && !t.warranty?.status) return false;
    return true;
  });

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const now = new Date();
    const expiry = new Date(date);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow && expiry >= now;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Warranty & Financial Oversight</h1>
        <p className="text-slate-500 mt-1 font-medium">Track warranty status, AMC contracts, and financial metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase">In Warranty</p>
            <ShieldCheck className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{stats.totalInWarranty}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase">AMC Active</p>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{stats.totalAMC}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase">Out of Warranty</p>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{stats.outOfWarranty}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase text-red-600">AMC Expires Soon</p>
            <Calendar className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{stats.amcExpiringSoon}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase text-red-600">Warranty Expires</p>
            <Calendar className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{stats.warrantyExpiringSoon}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">WARRANTY STATUS</label>
            <select 
              value={filters.warranty}
              onChange={(e) => setFilters({...filters, warranty: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="in_warranty">In Warranty</option>
              <option value="out_of_warranty">Out of Warranty</option>
              <option value="amc">AMC</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">FILTER TYPE</label>
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All</option>
              <option value="amc">AMC Contracts</option>
              <option value="warranty">Warranty</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ warranty: '', type: '' })}
              className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-semibold transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Warranty Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Ticket ID</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Customer</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Inverter</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Warranty Status</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Warranty Expiry</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">AMC</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">AMC Expiry</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Loading warranty data...</td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No records found</td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr 
                    key={ticket._id} 
                    className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                      isExpiringSoon(ticket.warranty?.expiryDate) || isExpiringSoon(ticket.warranty?.amcExpiry)
                        ? 'bg-red-50'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">{ticket.ticketId}</td>
                    <td className="px-6 py-4 text-slate-700">{ticket.customer?.name}</td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="text-xs">
                        {ticket.inverter?.make} {ticket.inverter?.model}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <WarrantyBadge status={ticket.warranty?.status || 'unknown'} />
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {ticket.warranty?.expiryDate 
                        ? new Date(ticket.warranty.expiryDate).toLocaleDateString()
                        : '—'
                      }
                      {isExpiringSoon(ticket.warranty?.expiryDate) && (
                        <span className="ml-2 text-xs text-red-600 font-bold">EXPIRING SOON!</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {ticket.warranty?.hasAMC ? '✓ Yes' : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {ticket.warranty?.amcExpiry 
                        ? new Date(ticket.warranty.amcExpiry).toLocaleDateString()
                        : '—'
                      }
                      {isExpiringSoon(ticket.warranty?.amcExpiry) && (
                        <span className="ml-2 text-xs text-red-600 font-bold">EXPIRING SOON!</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <p className="text-sm text-blue-700">
          <strong>💡 Tip:</strong> Items highlighted in red have expiring dates within the next 30 days. 
          Update warranty information from the ticket details to track AMC renewals and maintain warranty coverage.
        </p>
      </div>
    </div>
  );
}
