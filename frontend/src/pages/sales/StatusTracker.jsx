import { useState, useEffect } from 'react';
import { Activity, Clock, Save, History, FileText, Settings, Search, AlertCircle, CheckCircle, ArrowRight, ChevronDown, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const TICKET_STATUSES = [
  'ticket_created',
  'pickup_scheduled',
  'on_transit',
  'received',
  'under_diagnosis',
  'under_repair',
  'ready_to_dispatch',
  'dispatched',
  'delivered',
  'closed'
];

const statusColors = {
  ticket_created: 'bg-blue-100 text-blue-700',
  pickup_scheduled: 'bg-cyan-100 text-cyan-700',
  on_transit: 'bg-purple-100 text-purple-700',
  received: 'bg-indigo-100 text-indigo-700',
  under_diagnosis: 'bg-amber-100 text-amber-700',
  under_repair: 'bg-orange-100 text-orange-700',
  ready_to_dispatch: 'bg-lime-100 text-lime-700',
  dispatched: 'bg-green-100 text-green-700',
  delivered: 'bg-teal-100 text-teal-700',
  closed: 'bg-slate-100 text-slate-700'
};

const statusLabels = {
  ticket_created: 'Created',
  pickup_scheduled: 'Pickup Scheduled',
  on_transit: 'In Transit',
  received: 'Received',
  under_diagnosis: 'Diagnosing',
  under_repair: 'Repairing',
  ready_to_dispatch: 'Ready to Dispatch',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  closed: 'Closed'
};

export default function StatusTracker() {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [nextStatuses, setNextStatuses] = useState([]);
  const [expandedTimeline, setExpandedTimeline] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Statuses where only the engineer can update (after In Transit → until Dispatched)
  const engineerOnlyCurrentStatuses = ['received', 'under_diagnosis', 'under_repair', 'ready_to_dispatch'];
  const engineerOnlyTargetStatuses = ['received', 'under_diagnosis', 'under_repair', 'ready_to_dispatch', 'dispatched'];
  const isEngineerOnlyStatus = engineerOnlyCurrentStatuses.includes(ticket?.status);

  // For sales: filter out statuses they can't set; if nothing remains, lock the UI
  const salesAvailableStatuses = user?.role === 'sales'
    ? nextStatuses.filter(s => !engineerOnlyTargetStatuses.includes(s))
    : nextStatuses;
  const canSalesEdit = user?.role !== 'sales' || (!isEngineerOnlyStatus && salesAvailableStatuses.length > 0);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ticketRecentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (ticket && !canSalesEdit && user?.role === 'sales') {
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/tickets/${ticket._id}`);
          setTicket(res.data.ticket);
          setHistory(res.data.history || []);
          setNextStatuses(res.data.nextStatuses || []);
          if (res.data.ticket.status !== ticket.status) {
            toast.info(`Status updated to: ${res.data.ticket.status.replace(/_/g, ' ').toUpperCase()}`);
          }
        } catch (error) {
          console.log('Auto-refresh error:', error);
        }
      }, 20000);

      setAutoRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  }, [ticket?._id, ticket?.status, canSalesEdit, user?.role]);

  const handleSearchTicket = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      toast.error('Please enter a ticket ID or number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/tickets/${searchId.trim()}`);
      setTicket(res.data.ticket);
      setHistory(res.data.history || []);
      setNextStatuses(res.data.nextStatuses || []);
      setNewStatus(res.data.nextStatuses?.[0] || '');
      setRemarks('');
      toast.success('Ticket loaded!');

      // Save to recent searches (max 10)
      const updated = [
        { id: searchId.trim(), name: res.data.ticket.ticketId, timestamp: new Date().toISOString() },
        ...recentSearches.filter(s => s.id !== searchId.trim())
      ].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('ticketRecentSearches', JSON.stringify(updated));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ticket not found');
      setTicket(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearch = async (search) => {
    setSearchId(search);
    setLoading(true);
    try {
      const res = await api.get(`/tickets/${search}`);
      setTicket(res.data.ticket);
      setHistory(res.data.history || []);
      setNextStatuses(res.data.nextStatuses || []);
      setNewStatus(res.data.nextStatuses?.[0] || '');
      setRemarks('');
      toast.success('Ticket loaded!');

      // Move to top of recent searches
      const updated = [
        { id: search, name: res.data.ticket.ticketId, timestamp: new Date().toISOString() },
        ...recentSearches.filter(s => s.id !== search)
      ].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('ticketRecentSearches', JSON.stringify(updated));
    } catch (error) {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('ticketRecentSearches');
    toast.info('Recent searches cleared');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || !remarks.trim()) {
      toast.error('Please select status and add remarks');
      return;
    }

    if (user?.role === 'sales' && isEngineerOnlyStatus) {
      toast.error('You cannot modify ticket status after it has been received. Status updates are automatic from engineer updates.');
      return;
    }

    setUpdating(true);
    try {
      const payload = { status: newStatus, remarks };

      if (newStatus === 'pickup_scheduled' && pickupDate) {
        payload.pickupDate = pickupDate;
      }

      const res = await api.patch(`/tickets/${ticket._id}/status`, payload);
      setTicket(res.data.ticket);
      setRemarks('');
      setPickupDate('');
      toast.success('Status updated successfully!');

      const updatedRes = await api.get(`/tickets/${ticket._id}`);
      setHistory(updatedRes.data.history || []);
      setNextStatuses(updatedRes.data.nextStatuses || []);
      setNewStatus(updatedRes.data.nextStatuses?.[0] || '');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ticket Status Tracker</h1>
        <p className="text-slate-500 mt-1 font-medium">Track ticket progress and receive updates from engineers</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearchTicket} className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Ticket ID (e.g., TK-2024-001)..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Searches</h3>
              <button 
                onClick={clearRecentSearches}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentSearch(search.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full transition"
                >
                  {search.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {ticket && (
        <div className="space-y-8">
          {/* Status Workflow Visualization */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-x-auto">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-brand-500" /> Ticket Workflow
            </h3>

            <div className="flex items-center gap-2 min-w-max pb-4">
              {TICKET_STATUSES.map((status, idx) => {
                const isCompleted = TICKET_STATUSES.indexOf(ticket.status) >= idx;
                const isCurrent = ticket.status === status;

                return (
                  <div key={status} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full font-bold text-xs text-center transition-all
                      ${isCurrent ? 'ring-2 ring-brand-500 ring-offset-2 ' : ''}
                      ${isCompleted ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'}
                    `}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="text-center mx-1">
                      <p className={`text-xs font-bold whitespace-nowrap ${isCurrent ? 'text-brand-600' : 'text-slate-600'}`}>
                        {statusLabels[status]}
                      </p>
                    </div>
                    {idx < TICKET_STATUSES.length - 1 && (
                      <ArrowRight className={`w-5 h-5 mx-1 ${isCompleted ? 'text-brand-500' : 'text-slate-300'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ticket Details & Update Status */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-brand-500" /> Ticket Details
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket ID</p>
                    <p className="font-bold text-slate-800 mt-1 flex items-center gap-2">
                      {ticket.ticketId}
                      {ticket.requestAmc && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded flex items-center gap-1 font-bold">
                          AMC Requested ({ticket.amcPlan} Days)
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</p>
                    <p className="font-semibold text-slate-800 mt-1">{ticket.customer?.name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device</p>
                    <p className="font-semibold text-slate-800 mt-1">{ticket.inverter?.make} {ticket.inverter?.model}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</p>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.priority?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</p>
                    <p className="font-semibold text-slate-800 mt-1">{ticket.assignedTo?.name || 'Unassigned'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Warranty</p>
                    <p className="font-semibold text-slate-800 mt-1">{ticket.warranty?.status?.replace(/_/g, ' ').toUpperCase() || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Update Status Form or Read-Only Notice */}
              {canSalesEdit ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-brand-500" /> Update Status
                  </h3>

                  <form onSubmit={handleUpdateStatus} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Status</label>
                      <div className={`px-4 py-2.5 rounded-lg border ${statusColors[ticket.status]} font-semibold text-center`}>
                        {statusLabels[ticket.status]}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={salesAvailableStatuses.length === 0}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white font-semibold text-slate-800 disabled:bg-slate-50 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Select Next Status --</option>
                        {salesAvailableStatuses.map(s => (
                          <option key={s} value={s}>
                            {statusLabels[s] || s.replace(/_/g, ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                      {salesAvailableStatuses.length === 0 && (
                        <p className="text-xs text-slate-500 mt-2">No status transitions available</p>
                      )}
                    </div>

                    {newStatus === 'pickup_scheduled' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pickup Date</label>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                        <FileText className="w-3 h-3 mr-1" /> Remarks (Required)
                      </label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows="4"
                        placeholder="Add detailed notes about this status update..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-slate-50 resize-none text-sm text-slate-700"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={updating || !newStatus || !remarks.trim() || (newStatus === 'pickup_scheduled' && !pickupDate)}
                        className="w-full flex items-center justify-center py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updating ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-100 rounded-2xl p-4">
                      <Lock className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">Status Updates Locked</h3>
                      <p className="text-sm text-slate-600">
                        {ticket?.status === 'on_transit' ? (
                          <>
                            This ticket is <span className="font-semibold">In Transit</span>. The next status update
                            (<span className="font-semibold">Received</span>) will be handled by the engineering team.
                            Control will return to you after the engineer dispatches the ticket.
                          </>
                        ) : (
                          <>
                            This ticket is now with the engineering team
                            (from <span className="font-semibold">Received</span> → <span className="font-semibold">Dispatched</span>).
                            Once the engineer dispatches the ticket, control will return to you for delivery confirmation.
                          </>
                        )}
                      </p>
                      {autoRefreshInterval && (
                        <p className="text-xs text-brand-600 font-semibold mt-2">
                          ⚡ Auto-refreshing every 20 seconds...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <History className="w-5 h-5 mr-2 text-brand-500" /> Activity Timeline
                  </h3>
                  <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{history.length}</span>
                </div>
                <button
                  onClick={() => setExpandedTimeline(!expandedTimeline)}
                  className="text-slate-600 hover:text-slate-800 transition"
                  title={expandedTimeline ? 'Collapse' : 'Expand'}
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedTimeline ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandedTimeline && (
                <div className="p-6 flex-1 overflow-y-auto max-h-96">
                  {history.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No activity history yet</p>
                  ) : (
                    <div className="space-y-4 border-l-2 border-slate-100 ml-3 pl-6 relative">
                      {(showAllHistory ? history : history.slice(0, 3)).map((log, i) => (
                        <div key={i} className="relative animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                          <div className={`absolute w-4 h-4 rounded-full -left-[1.95rem] top-1.5 border-4 border-white shadow-sm ${i === 0 ? 'bg-brand-500' : 'bg-slate-300'}`}></div>

                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColors[log.newStatus] || 'bg-slate-200 text-slate-700'}`}>
                                <Activity className="w-3 h-3 mr-1" /> {statusLabels[log.newStatus] || log.newStatus?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-500 font-semibold flex items-center">
                                <Clock className="w-3 h-3 mr-1" /> {new Date(log.loggedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-slate-700 text-xs mb-2 font-medium bg-white p-2 rounded border border-slate-100">{log.remarks || 'No remarks'}</p>

                            <div className="flex justify-end">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                By: <span className="text-slate-600 lowercase">{log.performBy?.name}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {history.length > 3 && (
                    <div className="mt-4 border-t border-slate-100 pt-4 text-center">
                      <button
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        className="text-xs font-bold uppercase text-brand-600 hover:text-brand-700 transition cursor-pointer"
                      >
                        {showAllHistory ? '↑ Show Less' : '↓ Show More'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!ticket && !loading && (
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Search for a ticket to view its status timeline</p>
        </div>
      )}
    </div>
  );
}