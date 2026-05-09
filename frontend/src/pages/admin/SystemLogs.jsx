import { useEffect, useState, useRef, useCallback } from 'react';
import { Clock, Activity, Loader, Filter } from 'lucide-react';
import { api } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SystemLogsSkeleton } from '../../components/skeletons';

export default function SystemLogs() {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [allLogs, setAllLogs] = useState([]);
  const isMounted = useRef(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/ticket-workflow');
      if (isMounted.current) {
        setAllLogs(response.data.data);
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchLogs();
    return () => { isMounted.current = false; };
  }, [fetchLogs]);

  const handleFilterByTicket = (ticketId) => {
    setSelectedTicket(ticketId);
    if (ticketId) {
      const filtered = allLogs.filter(log => log.ticket?.ticketId === ticketId);
      setLogs(filtered);
    } else {
      setLogs(allLogs);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ticket_created: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      pickup_scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      on_transit: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      received: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      under_diagnosis: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      under_repair: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      ready_to_dispatch: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      dispatched: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      closed: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
    };
    return colors[status] || colors.ticket_created;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const logDate = new Date(date);
    const diff = now.getTime() - logDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return logDate.toLocaleDateString();
  };

  const uniqueTickets = [...new Set(allLogs.map(log => log.ticket?.ticketId))].filter(Boolean);

  if (loading) {
    return <SystemLogsSkeleton isDark={isDark} />;
  }

  return (
    <div className={`animate-fade-in space-y-6 pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`p-6 rounded-2xl shadow-sm border mb-6 border-l-4 ${isDark ? 'bg-slate-800 border-slate-700 border-l-slate-600' : 'bg-gray-300 border-slate-100 border-l-slate-800'}`}>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>System Activity & Ticket Workflow Logs</h2>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live status tracking of tickets through the entire workflow from sales to service to completion.</p>
      </div>

      <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Filter className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
          <label className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Filter by Ticket:</label>
        </div>
        <select value={selectedTicket} onChange={(e) => handleFilterByTicket(e.target.value)} className={`w-full px-3 py-2 border rounded-lg font-medium text-sm transition-all focus:ring-2 focus:ring-brand-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <option value="">All Tickets ({uniqueTickets.length})</option>
          {uniqueTickets.map(ticketId => (<option key={ticketId} value={ticketId}>{ticketId}</option>))}
        </select>
      </div>

      {/* Clean single-column log table */}
      <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
        {logs.length > 0 ? (
          <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <th className={`p-4 font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Time</th>
                  <th className={`p-4 font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Performed By</th>
                  <th className={`p-4 font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Ticket</th>
                  <th className={`p-4 font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Status</th>
                  <th className={`p-4 font-semibold text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={index}
                    className={`border-t transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    {/* Time */}
                    <td className={`p-4 text-sm whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <div className="flex flex-col">
                        <span className="font-medium">{getTimeAgo(log.createdAt)}</span>
                        <span className="text-xs opacity-70">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Performed By */}
                    <td className={`p-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{log.performBy?.name || 'System'}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-600'}`}>
                          {log.performBy?.role || 'system'}
                        </span>
                      </div>
                    </td>

                    {/* Ticket ID */}
                    <td className={`p-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {log.ticket ? (
                        <span className={`font-mono font-semibold px-2 py-1 rounded text-xs ${isDark ? 'bg-slate-600 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>
                          {log.ticket.ticketId}
                        </span>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {log.newStatus ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(log.newStatus)}`}>
                          {log.newStatus?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      ) : log.ticket?.status ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(log.ticket.status)}`}>
                          {log.ticket.status?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                      )}
                    </td>

                    {/* Remarks */}
                    <td className={`p-4 text-sm max-w-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {log.remarks || 'Status updated'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {selectedTicket ? `No logs found for ${selectedTicket}` : 'No activity logs available'}
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 pb-10`}>
          {[
            { label: 'Total Activities', count: logs.length, color: 'blue' },
            { label: 'Employees Involved', count: new Set(logs.map(l => l.performBy?._id)).size, color: 'green' },
            { label: 'Tickets Updated', count: uniqueTickets.length, color: 'purple' }
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-lg border ${isDark ? `bg-slate-800 border-slate-700` : `bg-gray-300 border-slate-200`}`}>
              <p className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold mt-2 ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : 'text-purple-600'}`}>
                {stat.count}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
