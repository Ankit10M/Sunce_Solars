import { useEffect, useState } from 'react';
import { MapPin, Calendar, Truck, Package, Phone, AlertCircle, Filter, Search } from 'lucide-react';
import { api } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { SkeletonTableRow } from '../../components/skeletons';
import { useDelayedLoading } from '../../hooks/useDelayedLoading';

const StatusBadge = ({ status }) => {
  const statusMap = {
    ticket_created: { color: 'bg-yellow-100 text-yellow-800', label: 'Ready for Pickup' },
    pickup_scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Pickup Scheduled' },
    on_transit: { color: 'bg-purple-100 text-purple-800', label: 'In Transit' },
    received: { color: 'bg-green-100 text-green-800', label: 'Received' },
    under_repair: { color: 'bg-orange-100 text-orange-800', label: 'Under Repair' },
    ready_to_dispatch: { color: 'bg-lime-100 text-lime-800', label: 'Ready to Dispatch' },
    dispatched: { color: 'bg-cyan-100 text-cyan-800', label: 'Dispatched' },
    closed: { color: 'bg-slate-100 text-slate-800', label: 'Closed' },
  };

  const config = statusMap[status] || { color: 'bg-slate-100 text-slate-800', label: status };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>{config.label}</span>;
};

export default function LogisticsManager() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });
  const [formData, setFormData] = useState({
    pickupDate: '',
    pickupLocation: '',
    courierPartner: '',
    courierTrackingId: '',
    remarks: '',
  });
  const [refreshInterval, setRefreshInterval] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets?page=1&limit=100');
      // Filter for tickets that need pickup or are in transit
      const logisticsTickets = (res.data.tickets || []).filter(t => 
        ['ticket_created', 'pickup_scheduled', 'on_transit', 'ready_to_dispatch', 'dispatched'].includes(t.status)
      );
      setTickets(logisticsTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Auto-refresh tickets every 15 seconds
    const interval = setInterval(() => {
      fetchTickets();
    }, 15000);

    setRefreshInterval(interval);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !formData.pickupDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const res = await api.patch(`/tickets/${selectedTicket._id}/status`, {
        status: 'pickup_scheduled',
        remarks: `Pickup scheduled for ${formData.pickupDate} at ${formData.pickupLocation}. Courier: ${formData.courierPartner}. Tracking ID: ${formData.courierTrackingId}. ${formData.remarks}`
      });

      toast.success('Pickup scheduled successfully!');
      setFormData({
        pickupDate: '',
        pickupLocation: '',
        courierPartner: '',
        courierTrackingId: '',
        remarks: '',
      });
      setSelectedTicket(null);
      
      // Refresh tickets
      const updatedRes = await api.get('/tickets?page=1&limit=100');
      const logisticsTickets = (updatedRes.data.tickets || []).filter(t => 
        ['ticket_created', 'pickup_scheduled', 'on_transit', 'ready_to_dispatch', 'dispatched'].includes(t.status)
      );
      setTickets(logisticsTickets);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule pickup');
    }
  };

  const filteredTickets = tickets.filter(t => 
    (!filters.search || t.ticketId.includes(filters.search) || t.customer?.name?.includes(filters.search)) &&
    (!filters.status || t.status === filters.status)
  );

  const pickupPending = tickets.filter(t => t.status === 'ticket_created').length;
  const inTransit = tickets.filter(t => t.status === 'on_transit').length;
  const readyForDispatch = tickets.filter(t => t.status === 'ready_to_dispatch').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pickup & Logistics Manager</h1>
          <p className="text-slate-500 mt-1 font-medium">Schedule pickups and track inbound/outbound courier movements</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-updating every 15s</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase">Ready for Pickup</p>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{pickupPending}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase">In Transit</p>
            <Truck className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{inTransit}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase">Ready to Dispatch</p>
            <Package className="w-5 h-5 text-lime-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{readyForDispatch}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Pickup Form */}
        {selectedTicket && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Schedule Pickup</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">Ticket</label>
                <input 
                  type="text" 
                  value={selectedTicket.ticketId}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-mono text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" /> Pickup Date
                </label>
                <input 
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" /> Pickup Location
                </label>
                <input 
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Full address"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4" /> Courier Partner
                </label>
                <select 
                  name="courierPartner"
                  value={formData.courierPartner}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                >
                  <option value="">-- Select --</option>
                  <option value="DHL">DHL</option>
                  <option value="FedEx">FedEx</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="Aramex">Aramex</option>
                  <option value="Local">Local Courier</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">Tracking ID</label>
                <input 
                  type="text"
                  name="courierTrackingId"
                  value={formData.courierTrackingId}
                  onChange={handleInputChange}
                  placeholder="e.g., DHL123456"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-2">Remarks</label>
                <textarea 
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Additional notes..."
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg font-semibold transition text-sm"
                >
                  Schedule Pickup
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 rounded-lg font-semibold transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div className={`${selectedTicket ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search ticket or customer..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Statuses</option>
                <option value="ticket_created">Ready for Pickup</option>
                <option value="pickup_scheduled">Pickup Scheduled</option>
                <option value="on_transit">In Transit</option>
                <option value="ready_to_dispatch">Ready to Dispatch</option>
                <option value="dispatched">Dispatched</option>
              </select>
              <button 
                onClick={() => setFilters({ search: '', status: '' })}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Ticket</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Customer</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Location</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {showSkeleton ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />)
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No logistics tickets found</td>
                    </tr>
                  ) : (
                    filteredTickets.map(ticket => (
                      <tr key={ticket._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-semibold text-slate-800">{ticket.ticketId}</td>
                        <td className="px-6 py-4 text-slate-700">{ticket.customer?.name}</td>
                        <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                        <td className="px-6 py-4 text-slate-700">{ticket.inverter?.plantLocation || '—'}</td>
                        <td className="px-6 py-4 text-center">
                          {ticket.status === 'ticket_created' && (
                            <button 
                              onClick={() => setSelectedTicket(ticket)}
                              className="text-brand-600 hover:text-brand-800 font-semibold"
                            >
                              Schedule
                            </button>
                          )}
                          {['pickup_scheduled', 'on_transit', 'ready_to_dispatch', 'dispatched'].includes(ticket.status) && (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
