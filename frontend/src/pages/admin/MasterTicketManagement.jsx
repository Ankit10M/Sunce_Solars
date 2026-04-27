import { useState, useEffect, useRef, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { Search, Edit, Filter, X, Loader, CheckCircle, Activity, ArrowRight, Clock, History } from 'lucide-react';
import { api } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const TICKET_STATUSES = [
  'ticket_created',
  'pickup_scheduled',
  'on_transit',
  'received',
  'under_diagnosis',
  'under_repair',
  'ready_to_dispatch',
  'dispatched',
  'closed'
];

const statusLabels = {
  ticket_created: 'Created',
  pickup_scheduled: 'Pickup Scheduled',
  on_transit: 'In Transit',
  received: 'Received',
  under_diagnosis: 'Diagnosing',
  under_repair: 'Repairing',
  ready_to_dispatch: 'Ready to Dispatch',
  dispatched: 'Dispatched',
  closed: 'Closed'
};

const statusColors = {
  ticket_created: 'bg-blue-100 text-blue-700',
  pickup_scheduled: 'bg-cyan-100 text-cyan-700',
  on_transit: 'bg-purple-100 text-purple-700',
  received: 'bg-indigo-100 text-indigo-700',
  under_diagnosis: 'bg-amber-100 text-amber-700',
  under_repair: 'bg-orange-100 text-orange-700',
  ready_to_dispatch: 'bg-lime-100 text-lime-700',
  dispatched: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-700'
};

export default function MasterTicketManagement() {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingNotes, setClosingNotes] = useState('');
  const [closing, setClosing] = useState(false);
  const [ticketHistory, setTicketHistory] = useState([]);
  const controllerRef = useRef(null);
  const[search,setSearch]=useState('');

  useEffect(()=>{
    const delay = setTimeout(()=>{
      setGlobalFilter(search)
    },400)
    return ()=> clearTimeout(delay)
  },[search])

  useEffect(() => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    fetchTickets(controllerRef.current.signal);
    return () => controllerRef.current?.abort();
  }, [statusFilter]);

  const fetchTickets = async (signal) => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const response = await api.get('/admin/tickets?limit=20&page=1', { params, signal });
      setData(response.data.data);
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to fetch tickets:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket || !closingNotes.trim()) {
      alert('Please add closing notes');
      return;
    }

    try {
      setClosing(true);
      await api.patch(`/admin/tickets/${selectedTicket._id}/close`, {
        closingNotes
      });
      setShowCloseModal(false);
      setClosingNotes('');
      setSelectedTicket(null);
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();
      fetchTickets(controllerRef.current.signal);
    } catch (error) {
      console.error('Failed to close ticket:', error);
      alert('Error closing ticket: ' + error.response?.data?.message);
    } finally {
      setClosing(false);
    }
  };

  const handleViewStatus = async (ticket) => {
    try {
      setSelectedTicket(ticket);
      setTicketHistory([]);
      // Use the ticket's _id with the /tickets/:id endpoint
      const res = await api.get(`/tickets/${ticket._id}`);
      // The getTicket controller returns { success, history, ticket, nextStatuses } at top level
      setTicketHistory(res.data.history || []);
      setShowStatusModal(true);
    } catch (error) {
      console.error('Failed to fetch ticket history:', error);
      // Fallback: still show modal with the ticket data we have
      setShowStatusModal(true);
    }
  };

  const columns = [
    {
      header: 'Ticket ID',
      accessorKey: 'ticketId',
      cell: ({ row }) => <span className="font-mono font-semibold">{row.original.ticketId}</span>
    },
    {
      header: 'Customer',
      accessorKey: 'customer.name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customer?.name}</p>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.original.customer?.email}</p>
        </div>
      )
    },
    {
      header: 'Device',
      accessorKey: 'inverter.model',
      cell: ({ row }) => row.original.inverter?.model || 'N/A'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const statusColors = {
          ticket_created: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
          pickup_scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
          on_transit: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
          under_repair: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
          ready_to_dispatch: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
          closed: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[row.original.status] || statusColors.ticket_created}`}>
            {row.original.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        );
      }
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: ({ row }) => {
        const priorityColors = {
          critical: 'text-red-600 dark:text-red-400',
          high: 'text-orange-600 dark:text-orange-400',
          normal: 'text-blue-600 dark:text-blue-400'
        };
        return <span className={`font-medium ${priorityColors[row.original.priority] || priorityColors.normal}`}>{row.original.priority?.toUpperCase()}</span>;
      }
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewStatus(row.original)}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            View Status
          </button>
          <button
            onClick={() => {
              setSelectedTicket(row.original);
              setShowCloseModal(true);
            }}
            disabled={row.original.status === 'closed'}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              row.original.status === 'closed'
                ? isDark
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            Close
          </button>
        </div>
      )
    }
  ];

  const filteredData =useMemo(()=>{
   return data.filter(row => {
    if (globalFilter) {
      return (
        row.ticketId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        row.customer?.name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        row.faultDescription?.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }
    return true;
  });
 },[data,globalFilter])
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className={`animate-fade-in space-y-6 pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4" style={{ borderColor: isDark ? '#374151' : '#e2e8f0' }}>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Master Ticket Management</h2>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>View and manage all raised tickets.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`w-5 h-5 absolute left-3 top-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search by ticket ID, customer, or description..."
              className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 transition-all ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          <div className="relative">
            <Filter className={`w-4 h-4 absolute left-3 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`pl-9 pr-8 py-2 border rounded-xl appearance-none font-medium text-sm transition-all focus:ring-2 focus:ring-brand-500 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="All">All Status</option>
              <option value="ticket_created">Ticket Created</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="under_repair">Under Repair</option>
              <option value="ready_to_dispatch">Ready to Dispatch</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader className="w-12 h-12 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                    {table.getHeaderGroups()[0]?.headers.map(header => (
                      <th key={header.id} className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr
                      key={row.id}
                      className={`border-t transition-colors ${
                        isDark
                          ? 'border-slate-700 hover:bg-slate-700/50'
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className={`p-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {table.getRowModel().rows.length === 0 && (
              <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No tickets found
              </div>
            )}
          </div>
        )}

        {!loading && (
          <div className="flex items-center justify-between mt-6">
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  table.getCanPreviousPage()
                    ? isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                    : isDark
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  table.getCanNextPage()
                    ? isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                    : isDark
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Workflow Modal */}
      {showStatusModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Ticket Status Workflow</h3>
              <button onClick={() => setShowStatusModal(false)} className={`p-1 hover:bg-slate-200 rounded ${isDark ? 'hover:bg-slate-700' : ''}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Visualization */}
            <div className={`p-4 rounded-lg mb-6 border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-1 overflow-x-auto pb-3">
                {TICKET_STATUSES.map((status, idx) => {
                  const isCompleted = TICKET_STATUSES.indexOf(selectedTicket.status) >= idx;
                  const isCurrent = selectedTicket.status === status;
                  
                  return (
                    <div key={status} className="flex items-center flex-shrink-0">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs text-center transition-all flex-shrink-0
                        ${isCurrent ? 'ring-2 ring-brand-500 ring-offset-2' : ''}
                        ${isCompleted ? 'bg-brand-500 text-white' : isDark ? 'bg-slate-600 text-slate-400' : 'bg-slate-300 text-slate-600'}
                      `}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <div className={`text-center mx-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <p className={`text-[10px] font-bold whitespace-nowrap ${isCurrent ? 'text-brand-600 font-bold' : ''}`}>
                          {statusLabels[status]}
                        </p>
                      </div>
                      {idx < TICKET_STATUSES.length - 1 && (
                        <ArrowRight className={`w-4 h-4 mx-0.5 flex-shrink-0 ${isCompleted ? 'text-brand-500' : isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ticket Details */}
            <div className={`grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <p className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ticket ID</p>
                <p className={`font-mono font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedTicket.ticketId}</p>
              </div>
              <div>
                <p className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Customer</p>
                <p className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedTicket.customer?.name}</p>
              </div>
              <div>
                <p className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Current Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${statusColors[selectedTicket.status]}`}>
                  {statusLabels[selectedTicket.status]}
                </span>
              </div>
              <div>
                <p className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Priority</p>
                <p className={`font-semibold mt-1 ${
                  selectedTicket.priority === 'critical' ? 'text-red-600' :
                  selectedTicket.priority === 'high' ? 'text-orange-600' :
                  'text-green-600'
                }`}>{selectedTicket.priority?.toUpperCase()}</p>
              </div>
            </div>

            {/* Activity Timeline */}
            {ticketHistory.length > 0 && (
              <div>
                <h4 className={`font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <History className="w-4 h-4 mr-2" /> Activity Timeline ({ticketHistory.length})
                </h4>
                <div className={`space-y-3 max-h-64 overflow-y-auto border-l-2 ml-3 pl-4 ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
                  {ticketHistory.map((log, i) => (
                    <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${statusColors[log.newStatus] || 'bg-slate-200'}`}>
                          {statusLabels[log.newStatus] || log.newStatus?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {new Date(log.loggedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-sm mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{log.remarks || 'No remarks'}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>by {log.performBy?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Ticket Modal */}
      {showCloseModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Close Ticket</h3>
              <button onClick={() => setShowCloseModal(false)} className={`p-1 hover:bg-slate-200 rounded ${isDark ? 'hover:bg-slate-700' : ''}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Ticket ID:</p>
              <p className="font-mono font-bold text-brand-600">{selectedTicket.ticketId}</p>
            </div>

            <textarea
              value={closingNotes}
              onChange={e => setClosingNotes(e.target.value)}
              placeholder="Enter closing notes and resolution details..."
              className={`w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 resize-none ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
              }`}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCloseModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTicket}
                disabled={closing || !closingNotes.trim()}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {closing ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {closing ? 'Closing...' : 'Close Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
