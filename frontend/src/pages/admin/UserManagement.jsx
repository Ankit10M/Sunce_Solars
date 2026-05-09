import { useEffect, useState, useRef, useMemo } from 'react';
import { Shield, ShieldAlert, User, CheckCircle, XCircle, Loader, Check, X, Trash2, AlertTriangle, RefreshCw, ArrowRight, Ticket } from 'lucide-react';
import { api } from "../../contexts/AuthContext";
import { useTheme } from '../../contexts/ThemeContext';
import { UserManagementSkeleton } from '../../components/skeletons';

export default function UserManagement() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [rejecting, setRejecting] = useState({});

  // Delete workflow states
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [checkingTickets, setCheckingTickets] = useState(false);
  const [ticketCheckResult, setTicketCheckResult] = useState(null);
  const [reassignModal, setReassignModal] = useState({ open: false, user: null, tickets: [] });
  const [availableTargetUsers, setAvailableTargetUsers] = useState([]);
  const [selectedTargetUser, setSelectedTargetUser] = useState('');
  const [reassigning, setReassigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const controllerRef = useRef(null);

  useEffect(() => {
    controllerRef.current = new AbortController();
    fetchData(controllerRef.current.signal);
    return () => controllerRef.current?.abort();
  }, []);

  const fetchData = async (signal) => {
    try {
      setLoading(true);
      const usersRes = await api.get('/admin/users?limit=20', { signal })
      setUsers(usersRes.data.data.users)

        api.get('/admin/pending-approvals', { signal })
        .then(res => setPendingUsers(res.data.data))
        .catch(() =>{})

        api.get('/admin/active-visitors', { signal })
        .then(res => setActiveVisitors(res.data.activeVisitors))
        .catch(() =>{})  

      setUsers(usersRes.data.data.users);
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to fetch data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEmployee = async (userId) => {
    if(approving[userId]) return;
    try {
      setApproving(prev => ({ ...prev, [userId]: true }));
      await api.patch(`/admin/approve-employee/${userId}`);
      // setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      // controllerRef.current?.abort();
      // controllerRef.current = new AbortController();
      // fetchData(controllerRef.current.signal);
      setPendingUsers(prev =>prev.filter(u => u._id !== userId));
      setUsers(prev => [...prev, pendingUsers.find(u => u._id === userId)]);
    } catch (error) {
      console.error('Failed to approve employee:', error);
      alert('Error approving employee');
    } finally {
      setApproving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRejectEmployee = async (userId) => {
    if(rejecting[userId]) return;
    try {
      setRejecting(prev => ({ ...prev, [userId]: true }));
      await api.delete(`/admin/reject-employee/${userId}`);
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Failed to reject employee:', error);
      alert('Error rejecting employee');
    } finally {
      setRejecting(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if(approving[userId] || rejecting[userId]) return;
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();
      // fetchData(controllerRef.current.signal);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Error updating user status');
    }
  };

  // ============ DELETE WORKFLOW ============

  // Step 1: Open delete confirmation modal and check tickets
  const handleDeleteClick = async (user) => {
    setDeleteModal({ open: true, user });
    setTicketCheckResult(null);
    setActionMessage({ type: '', text: '' });
    setCheckingTickets(true);

    try {
      const res = await api.get(`/admin/users/${user._id}/check-tickets`);
      setTicketCheckResult(res.data);
    } catch (error) {
      console.error('Failed to check tickets:', error);
      setTicketCheckResult({ success: false, error: error.message });
    } finally {
      setCheckingTickets(false);
    }
  };

  // Step 2: Open reassignment modal
  const handleOpenReassign = async (user, tickets) => {
    setDeleteModal({ open: false, user: null });
    setReassignModal({ open: true, user, tickets });
    setSelectedTargetUser('');
    setActionMessage({ type: '', text: '' });

    try {
      const res = await api.get(`/admin/users-by-role?role=${user.role}`);
      // Filter out the user being deleted
      const filtered = res.data.data.filter(u => u._id !== user._id);
      setAvailableTargetUsers(filtered);
    } catch (error) {
      console.error('Failed to fetch target users:', error);
      setAvailableTargetUsers([]);
    }
  };

  // Step 3: Reassign tickets
  const handleReassignTickets = async () => {
    if (!selectedTargetUser) {
      setActionMessage({ type: 'error', text: 'Please select a user to reassign tickets to.' });
      return;
    }

    setReassigning(true);
    setActionMessage({ type: '', text: '' });

    try {
      const res = await api.post(`/admin/users/${reassignModal.user._id}/reassign-tickets`, {
        toUserId: selectedTargetUser
      });

      const targetUserName = availableTargetUsers.find(u => u._id === selectedTargetUser)?.name || 'selected user';
      setActionMessage({
        type: 'success',
        text: `✅ ${res.data.data.ticketsReassigned} ticket(s) reassigned to ${targetUserName}. You can now delete this account.`
      });

      // Re-check tickets to confirm 0 remaining
      const checkRes = await api.get(`/admin/users/${reassignModal.user._id}/check-tickets`);
      setTicketCheckResult(checkRes.data);

      // If all tickets reassigned, show delete button
      if (checkRes.data.canDelete) {
        setReassignModal(prev => ({ ...prev, tickets: [] }));
      }
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reassign tickets.'
      });
    } finally {
      setReassigning(false);
    }
  };

  // Step 4: Safe delete user (only when 0 tickets)
  const handleDeleteUser = async (userId) => {
    setDeleting(true);
    setActionMessage({ type: '', text: '' });

    try {
      const res = await api.delete(`/admin/users/${userId}/delete-safe`);
      setActionMessage({ type: 'success', text: `✅ ${res.data.message}` });

      // Close modals and refresh
      setTimeout(() => {
        setDeleteModal({ open: false, user: null });
        setReassignModal({ open: false, user: null, tickets: [] });
        setTicketCheckResult(null);
        setActionMessage({ type: '', text: '' });
        setUsers(prev => prev.filter(u => u._id !== userId));
      }, 1500);
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete user.'
      });
    } finally {
      setDeleting(false);
    }
  };

  const closeAllModals = () => {
    setDeleteModal({ open: false, user: null });
    setReassignModal({ open: false, user: null, tickets: [] });
    setTicketCheckResult(null);
    setSelectedTargetUser('');
    setActionMessage({ type: '', text: '' });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-300 dark:border-red-700',
      sales: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-300 dark:border-blue-700',
      engineer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border-purple-300 dark:border-purple-700',
      service_manager: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700',
      store_manager: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300 dark:border-amber-700',
      customer: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200 border-slate-300 dark:border-slate-700'
    };
    return colors[role] || colors.customer;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      ticket_created: 'bg-blue-100 text-blue-700',
      pickup_scheduled: 'bg-cyan-100 text-cyan-700',
      on_transit: 'bg-indigo-100 text-indigo-700',
      received: 'bg-teal-100 text-teal-700',
      under_diagnosis: 'bg-yellow-100 text-yellow-700',
      under_repair: 'bg-orange-100 text-orange-700',
      ready_to_dispatch: 'bg-lime-100 text-lime-700',
      dispatched: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const {
    customers,
    employees,
    admins,
    activeCustomers,
    inactiveCustomers,
    activeEmployees,
    inactiveEmployees,
    activeAdmins
  } = useMemo(() => {
    const customers = users.filter(u => u.role === 'customer');
    const employees = users.filter(u => u.role !== 'customer' && u.role !== 'admin');
    const admins = users.filter(u => u.role === 'admin');

    return {
      customers,
      employees,
      admins,
      activeCustomers: customers.filter(u => u.isActive),
      inactiveCustomers: customers.filter(u => !u.isActive),
      activeEmployees: employees.filter(u => u.isActive),
      inactiveEmployees: employees.filter(u => !u.isActive),
      activeAdmins: admins.filter(u => u.isActive),
    };
  }, [users]);

  if (loading) {
    return <UserManagementSkeleton isDark={isDark} />;
  }

  // ============ MODAL: Delete Confirmation with Ticket Check ============
  const renderDeleteModal = () => {
    if (!deleteModal.open || !deleteModal.user) return null;
    const user = deleteModal.user;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
        <div className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center gap-3 ${isDark ? 'bg-red-900/30 border-slate-700' : 'bg-red-50 border-red-100'}`}>
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Delete Account</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Review before deleting</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4">
            <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                  <User className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getRoleColor(user.role)}`}>
                  {user.role.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Ticket Check Result */}
            {checkingTickets && (
              <div className="flex items-center justify-center gap-3 py-6">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Checking assigned tickets...</span>
              </div>
            )}

            {ticketCheckResult && !checkingTickets && (
              <>
                {ticketCheckResult.canDelete ? (
                  <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className={`font-semibold text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>No Active Tickets</span>
                    </div>
                    <p className={`text-sm ml-7 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      This account has no assigned tickets. Safe to delete.
                    </p>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span className={`font-semibold text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        {ticketCheckResult.ticketCount} Active Ticket(s) Found
                      </span>
                    </div>
                    <p className={`text-sm ml-7 mb-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      All tickets must be reassigned before this account can be deleted.
                    </p>

                    {/* Ticket List Preview */}
                    <div className={`ml-7 space-y-2 max-h-40 overflow-y-auto pr-2`}>
                      {ticketCheckResult.tickets?.slice(0, 5).map(ticket => (
                        <div key={ticket._id} className={`flex items-center justify-between p-2 rounded-lg text-xs ${isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'}`}>
                          <div className="flex items-center gap-2">
                            <Ticket className="w-3.5 h-3.5 text-amber-500" />
                            <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{ticket.ticketId}</span>
                            {ticket.customer?.name && (
                              <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>• {ticket.customer.name}</span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeColor(ticket.status)}`}>
                            {ticket.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                      {ticketCheckResult.ticketCount > 5 && (
                        <p className={`text-xs text-center py-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ...and {ticketCheckResult.ticketCount - 5} more ticket(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Message */}
            {actionMessage.text && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                actionMessage.type === 'success'
                  ? isDark ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-50 text-green-700 border border-green-200'
                  : isDark ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {actionMessage.text}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
            <button
              onClick={closeAllModals}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            >
              Cancel
            </button>

            {ticketCheckResult && !ticketCheckResult.canDelete && (
              <button
                onClick={() => handleOpenReassign(user, ticketCheckResult.tickets)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                Reassign Tickets
              </button>
            )}

            {ticketCheckResult && ticketCheckResult.canDelete && (
              <button
                onClick={() => handleDeleteUser(user._id)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all flex items-center gap-2 shadow-lg shadow-red-500/25 disabled:opacity-50"
              >
                {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============ MODAL: Reassignment ============
  const renderReassignModal = () => {
    if (!reassignModal.open || !reassignModal.user) return null;
    const user = reassignModal.user;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
        <div className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center gap-3 ${isDark ? 'bg-blue-900/30 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Reassign Tickets</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Transfer all tickets from <strong>{user.name}</strong> to another active {user.role}
              </p>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* From → To visual */}
            <div className="flex items-center gap-4">
              <div className={`flex-1 p-3 rounded-xl border ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>From (Deleting)</p>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
              </div>

              <ArrowRight className={`w-6 h-6 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />

              <div className={`flex-1 p-3 rounded-xl border ${isDark ? 'bg-green-900/20 border-green-800/50' : 'bg-green-50 border-green-200'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-green-400' : 'text-green-500'}`}>To (Active)</p>
                {availableTargetUsers.length > 0 ? (
                  <select
                    value={selectedTargetUser}
                    onChange={(e) => setSelectedTargetUser(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-slate-300 text-slate-800'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">-- Select {user.role} --</option>
                    {availableTargetUsers.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    No other active {user.role} users available!
                  </p>
                )}
              </div>
            </div>

            {/* Ticket count info */}
            {ticketCheckResult && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                <Ticket className="w-4 h-4" />
                <span><strong>{ticketCheckResult.ticketCount}</strong> ticket(s) will be reassigned</span>
              </div>
            )}

            {/* Action Message */}
            {actionMessage.text && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                actionMessage.type === 'success'
                  ? isDark ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-50 text-green-700 border border-green-200'
                  : isDark ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {actionMessage.text}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
            <button
              onClick={closeAllModals}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            >
              Cancel
            </button>

            {/* Show Reassign button only when tickets exist */}
            {ticketCheckResult && !ticketCheckResult.canDelete && availableTargetUsers.length > 0 && (
              <button
                onClick={handleReassignTickets}
                disabled={reassigning || !selectedTargetUser}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reassigning ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {reassigning ? 'Reassigning...' : 'Reassign All Tickets'}
              </button>
            )}

            {/* Show Delete button after successful reassignment */}
            {ticketCheckResult && ticketCheckResult.canDelete && (
              <button
                onClick={() => handleDeleteUser(reassignModal.user._id)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all flex items-center gap-2 shadow-lg shadow-red-500/25 disabled:opacity-50"
              >
                {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Delete Account Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`animate-fade-in space-y-8 pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* Inline keyframes for modal animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ========== EMPLOYEE MANAGEMENT ========== */}
      <div>
        <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}> Employee Management</h1>
        
        {/* Employee Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Employees', value: employees.length, color: 'blue' },
            { label: 'Active Employees', value: activeEmployees.length, color: 'green' },
            { label: 'Inactive Employees', value: inactiveEmployees.length, color: 'red' },
            { label: 'Pending Approvals', value: pendingUsers.length, color: 'yellow' }
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                isDark
                  ? `bg-slate-800 border-slate-700`
                  : `bg-gray-300 border-slate-200`
              }`}
            >
              <p className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Pending Employee Approvals */}
        {pendingUsers.length > 0 && (
          <div className={`p-6 rounded-2xl shadow-sm border mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-yellow-200 bg-yellow-50'}`}>
            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              ⏳ Pending Employee Approvals ({pendingUsers.length})
            </h2>
            <div className="space-y-3">
              {pendingUsers.map(user => (
                <div
                  key={user._id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    isDark
                      ? 'bg-slate-700 border-slate-600'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                      <User className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{user.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold border-2 ${getRoleColor(user.role)}`}>
                      {user.role.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApproveEmployee(user._id)}
                      disabled={approving[user._id]}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      {approving[user._id] ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectEmployee(user._id)}
                      disabled={rejecting[user._id]}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      {rejecting[user._id] ? <Loader className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Employees Table */}
        <div className={`p-6 rounded-2xl shadow-sm border mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-green-300' : 'text-green-600'}`}> Active Employees</h2>
          <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Employee</th>
                  <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Role</th>
                  <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Last Login</th>
                  <th className={`p-4 font-semibold text-sm uppercase tracking-wider text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map(user => (
                  <tr key={user._id} className={`border-t transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className={`p-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <User className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold border-2 gap-1.5 ${getRoleColor(user.role)}`}>
                        <Shield className="w-4 h-4" />
                        {user.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className="px-4 py-2 border rounded-lg text-sm font-semibold transition-colors bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          Suspend
                        </button>
                        {/* Delete button for sales/engineer only */}
                        {(user.role === 'sales' || user.role === 'engineer') && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5 shadow-sm hover:shadow-md hover:shadow-red-500/20"
                            title="Delete account (requires ticket reassignment)"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activeEmployees.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                No active employees
              </div>
            )}
          </div>
        </div>

        {/* Inactive Employees Table */}
        {inactiveEmployees.length > 0 && (
          <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-red-200' : 'text-red-600'}`}> Inactive/Suspended Employees</h2>
            <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <table className="w-full text-left">
                <thead>
                  <tr className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                    <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Employee</th>
                    <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Role</th>
                    <th className={`p-4 font-semibold text-sm uppercase tracking-wider text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveEmployees.map(user => (
                    <tr key={user._id} className={`border-t transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`p-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <div className="flex items-center opacity-60">
                          <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <XCircle className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold border-2 ${getRoleColor(user.role)}`}>
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                            className="px-4 py-2 border rounded-lg text-sm font-semibold transition-colors bg-green-500 hover:bg-green-600 text-white"
                          >
                            Activate
                          </button>
                          {/* Delete button for inactive sales/engineer too */}
                          {(user.role === 'sales' || user.role === 'engineer') && (
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5 shadow-sm hover:shadow-md hover:shadow-red-500/20"
                              title="Delete account (requires ticket reassignment)"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========== CUSTOMER MANAGEMENT ========== */}
      <div className={`border-t ${isDark ? 'border-slate-700 pt-8' : 'border-slate-200 pt-8'}`}>
        <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}> Customer Management</h1>
        
        {/* Customer Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Customers', value: customers.length, color: 'blue' },
            { label: 'Active Customers', value: activeCustomers.length, color: 'green' },
            { label: 'Inactive Customers', value: inactiveCustomers.length, color: 'red' }
          ].map((stat, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                isDark
                  ? `bg-slate-800 border-slate-700`
                  : `bg-gray-300 border-slate-200`
              }`}
            >
              <p className={`text-xs uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Active Customers Table */}
        <div className={`p-6 rounded-2xl shadow-sm border mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-green-300' : 'text-green-600'}`}> Active Customers</h2>
          <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                  <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Customer</th>
                  <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Email</th>
                  <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {activeCustomers.map(user => (
                  <tr key={user._id} className={`border-t transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className={`p-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <User className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {user.email}
                    </td>
                    <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activeCustomers.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                No active customers
              </div>
            )}
          </div>
        </div>

        {/* Inactive Customers Table */}
        {inactiveCustomers.length > 0 && (
          <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-red-200' : 'text-red-600'}`}> Inactive/Suspended Customers</h2>
            <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <table className="w-full text-left">
                <thead>
                  <tr className={`${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Customer</th>
                    <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Email</th>
                    <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveCustomers.map(user => (
                    <tr key={user._id} className={`border-t transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`p-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <div className="flex items-center opacity-60">
                          <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                            <XCircle className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


      {/* Render Modals */}
      {renderDeleteModal()}
      {renderReassignModal()}

    </div>
  );
}
