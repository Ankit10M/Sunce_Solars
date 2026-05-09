import { useEffect, useState } from 'react';
import { Users, Truck, Wrench, ShieldCheck, Filter, Search, AlertCircle, CheckCircle, Clock, FileText, Receipt, X,
   ChevronRight, IndianRupee, Pencil, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { SkeletonTableRow, SkeletonStatCard, SkeletonServiceReportCard, SkeletonMiniReportItem, SkeletonFilterBar } from '../../components/skeletons';

// Reusable components
const StatCard = ({ label, value, icon, bg }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-4 rounded-xl ${bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    ticket_created: { color: 'bg-blue-100 text-blue-800', label: 'Created' },
    pickup_scheduled: { color: 'bg-indigo-100 text-indigo-800', label: 'Pickup Scheduled' },
    on_transit: { color: 'bg-purple-100 text-purple-800', label: 'In Transit' },
    received: { color: 'bg-cyan-100 text-cyan-800', label: 'Received' },
    under_diagnosis: { color: 'bg-amber-100 text-amber-800', label: 'Diagnosing' },
    under_repair: { color: 'bg-orange-100 text-orange-800', label: 'Repairing' },
    ready_to_dispatch: { color: 'bg-lime-100 text-lime-800', label: 'Ready to Dispatch' },
    dispatched: { color: 'bg-green-100 text-green-800', label: 'Dispatched' },
    closed: { color: 'bg-slate-100 text-slate-800', label: 'Closed' }
  };
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>{config.label}</span>;
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900 font-bold'
  };
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[priority] || colors.medium}`}>{priority?.toUpperCase()}</span>;
};

const CreateReceiptModal = ({ ticket, isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    customerName:     '',
    inverterName:     '',
    faultDescription: '',
    solution:         '',
    serviceCharge:    '',
  });
  const [sending, setSending] = useState(false);
 
  // Pre-fill from ticket when it opens
  useEffect(() => {
    if (ticket && isOpen) {
      setForm({
        customerName:     ticket.customer?.name || '',
        inverterName:     `${ticket.inverter?.make || ''} ${ticket.inverter?.model || ''}`.trim(),
        faultDescription: ticket.serviceReport?.faultDescription || ticket.faultDescription || '',
        solution:         ticket.serviceReport?.solution || '',
        serviceCharge:    ticket.isAmcCovered ? '0' : (ticket.serviceReport?.serviceCost || ''),
      });
    }
  }, [ticket, isOpen]);
 
  if (!isOpen || !ticket) return null;

  const isAmcCovered = ticket.isAmcCovered || false;
  const base   = isAmcCovered ? 0 : (parseFloat(form.serviceCharge) || 0);
  const cgst   = +(base * 0.12).toFixed(2);
  const sgst   = +(base * 0.12).toFixed(2);
  const total  = +(base + cgst + sgst).toFixed(2);
 
  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));
 
  const handleSend = async () => {
    if (!isAmcCovered && (!form.serviceCharge || base <= 0)) {
      toast.error('Please enter a valid service charge');
      return;
    }
    setSending(true);
    try{
      await onSubmit(ticket, total, form);
      onClose();
    }catch(err){

    }finally{
      setSending(false);
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
 
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="bg-brand-50 p-2.5 rounded-xl">
              <Receipt className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Create Receipt</h2>
              <p className="text-xs text-slate-400 font-medium">{ticket.ticketId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl p-2 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
 
        <div className="px-8 py-6 space-y-6">

          {/* AMC Coverage Banner */}
          {isAmcCovered && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">AMC Covered Ticket</p>
                <p className="text-xs text-green-700 mt-0.5">Labour charges are waived. Only spare parts (if any) will be billed.</p>
              </div>
            </div>
          )}
 
          {/* ── Editable Fields ── */}
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Pencil className="w-3.5 h-3.5" /> Receipt Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Customer Name</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={handleChange('customerName')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                  placeholder="Customer name"
                />
              </div>
 
              {/* Inverter Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Inverter / Device</label>
                <input
                  type="text"
                  value={form.inverterName}
                  onChange={handleChange('inverterName')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
                  placeholder="Make & model"
                />
              </div>
 
              {/* Fault Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Fault Description</label>
                <textarea
                  rows={3}
                  value={form.faultDescription}
                  onChange={handleChange('faultDescription')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-none"
                  placeholder="Describe the fault..."
                />
              </div>
 
              {/* Solution */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">Solution / Work Done</label>
                <textarea
                  rows={3}
                  value={form.solution}
                  onChange={handleChange('solution')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition resize-none"
                  placeholder="Describe the solution..."
                />
              </div>
 
              {/* Service Charge */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">
                  Service Charge (₹)
                  {isAmcCovered && <span className="ml-2 text-green-600 font-normal">— Waived under AMC</span>}
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={form.serviceCharge}
                    onChange={handleChange('serviceCharge')}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition ${isAmcCovered ? 'opacity-50' : ''}`}
                    placeholder="0.00"
                    min="0"
                    disabled={isAmcCovered}
                  />
                </div>
              </div>
            </div>
          </div>
 
          {/* ── Tax Breakdown ── */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5" /> Price Breakdown
            </p>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Service Charge {isAmcCovered && '(AMC Waived)'}</span>
                <span className={`font-bold ${isAmcCovered ? 'text-green-600 line-through' : 'text-slate-800'}`}>₹{isAmcCovered ? '0.00' : base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">CGST (12%)</span>
                <span className="font-bold text-slate-600">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">SGST (12%)</span>
                <span className="font-bold text-slate-600">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-300 pt-3 mt-1 flex justify-between items-center">
                <span className="font-black text-slate-800 text-base">Total Amount</span>
                <span className="font-black text-xl text-brand-600">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
 
          {/* ── Preview Badge ── */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              {isAmcCovered
                ? 'This ticket is covered under AMC. Labour charges are waived. Only spare parts will be billed if applicable.'
                : 'Review all details carefully. Once sent, this receipt will be delivered to the customer and a billing record will be created.'}
            </p>
          </div>
 
          {/* ── Action Buttons ── */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || (!isAmcCovered && base <= 0)}
              className="flex-1 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : isAmcCovered ? 'Send AMC Receipt' : 'Send to Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ticket Detail Modal
const TicketDetailModal = ({ ticket, engineers, isOpen, onClose, onAssign, onWarrantyUpdate }) => {
  const [selectedEngineer, setSelectedEngineer] = useState(ticket?.assignedTo?._id || '');
  const [warrantyStatus, setWarrantyStatus] = useState(ticket?.warranty?.status || 'unknown');
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {ticket.ticketId}
              {ticket.requestAmc && (
                <span className="px-2.5 py-1 bg-amber-500 text-white text-xs rounded-lg flex items-center gap-1 font-bold ml-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  AMC Requested ({ticket.amcPlan} Days)
                </span>
              )}
            </h2>
            <p className="text-brand-100 text-sm mt-1">Customer: {ticket.customer?.name}</p>
          </div>
          <button onClick={onClose} className="text-2xl font-bold hover:text-brand-100">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Priority */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">STATUS</p>
              <StatusBadge status={ticket.status} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">PRIORITY</p>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">URGENCY</p>
              <span className="text-sm font-semibold text-slate-800">{ticket.urgency?.toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-2">SLA STATUS</p>
              <p className={`text-sm font-semibold ${ticket.sla?.breached ? 'text-red-600' : 'text-green-600'}`}>
                {ticket.sla?.breached ? '⚠ BREACHED' : '✓ ON TRACK'}
              </p>
            </div>
          </div>

          {/* Fault Description */}
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-2">FAULT DESCRIPTION</p>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{ticket.faultDescription}</p>
          </div>

          {/* Inverter Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-500 font-semibold mb-3">INVERTER DETAILS</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Make</p>
                <p className="font-semibold text-slate-800">{ticket.inverter?.make}</p>
              </div>
              <div>
                <p className="text-slate-500">Model</p>
                <p className="font-semibold text-slate-800">{ticket.inverter?.model}</p>
              </div>
              <div>
                <p className="text-slate-500">Serial No</p>
                <p className="font-semibold text-slate-800">{ticket.inverter?.serialNumber}</p>
              </div>
              <div>
                <p className="text-slate-500">Capacity</p>
                <p className="font-semibold text-slate-800">{ticket.inverter?.capacity} kW</p>
              </div>
            </div>
          </div>

          {/* Warranty Info */}
          <div className="bg-brand-50 p-4 rounded-lg border border-brand-200">
            <p className="text-xs text-slate-500 font-semibold mb-3">WARRANTY & AMC</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <p className="text-slate-500">Status</p>
                <select 
                  value={warrantyStatus} 
                  onChange={(e) => setWarrantyStatus(e.target.value)}
                  className="mt-1 px-2 py-1 border border-slate-300 rounded text-xs"
                >
                  <option value="unknown">Unknown</option>
                  <option value="in_warranty">In Warranty</option>
                  <option value="out_of_warranty">Out of Warranty</option>
                  <option value="amc">AMC</option>
                </select>
              </div>
              <div>
                <p className="text-slate-500">Start Date</p>
                <p className="font-semibold text-slate-800">{(ticket.warranty?.startDate || ticket.inverter?.warrantyStartDate) ? new Date(ticket.warranty?.startDate || ticket.inverter?.warrantyStartDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500">Expiry Date</p>
                <p className="font-semibold text-slate-800">{(ticket.warranty?.expiryDate || ticket.inverter?.warrantyEndDate) ? new Date(ticket.warranty?.expiryDate || ticket.inverter?.warrantyEndDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500">AMC Active</p>
                <p className="font-semibold text-slate-800">{ticket.warranty?.hasAMC ? '✓ Yes' : 'No'}</p>
              </div>
            </div>
            <button 
              onClick={() => onWarrantyUpdate(ticket._id, warrantyStatus)}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg text-sm font-semibold transition"
            >
              Update Warranty Status
            </button>
          </div>

          {/* Assign Engineer */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-slate-500 font-semibold mb-3">ASSIGN ENGINEER</p>
            <div className="flex gap-2">
              <select 
                value={selectedEngineer}
                onChange={(e) => setSelectedEngineer(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">-- Select Engineer --</option>
                {engineers?.map(eng => (
                  <option key={eng._id} value={eng._id}>{eng.name} ({eng.email})</option>
                ))}
              </select>
              <button 
                onClick={() => onAssign(ticket._id, selectedEngineer)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Assign
              </button>
            </div>
            {ticket.assignedTo && (
              <p className="text-xs text-slate-600 mt-2">
                Currently assigned to: <span className="font-semibold">{ticket.assignedTo?.name}</span>
              </p>
            )}
          </div>

          {/* Service History */}
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-3">SERVICE HISTORY</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {ticket.serviceHistory?.length > 0 ? (
                ticket.serviceHistory.map((log, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-3 rounded-lg flex justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{log.action?.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-slate-600">{log.remarks}</p>
                      <p className="text-slate-500 text-xs mt-1">by {log.performBy?.name} • {new Date(log.loggedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs">No history yet</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceReportCard = ({ ticket, onCreateReceipt }) => {
  const isAmcCovered = ticket.isAmcCovered || false;
  const base  = isAmcCovered ? 0 : (ticket.serviceReport?.serviceCost || 0);
  const cgst  = +(base * 0.12).toFixed(2);
  const sgst  = +(base * 0.12).toFixed(2);
  const total = +(base + cgst + sgst).toFixed(2);
 
  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all duration-300">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${isAmcCovered ? 'bg-gradient-to-r from-green-400 to-emerald-600' : 'bg-gradient-to-r from-brand-400 to-brand-600'}`} />
 
      <div className="p-5">
        {/* ── Header row ── */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl p-2.5 shrink-0 ${isAmcCovered ? 'bg-green-50' : 'bg-brand-50'}`}>
              <FileText className={`w-5 h-5 ${isAmcCovered ? 'text-green-600' : 'text-brand-600'}`} />
            </div>
            <div>
              <p className="font-black text-slate-800 text-base tracking-tight">{ticket.ticketId}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{ticket.customer?.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={ticket.status} />
            {isAmcCovered && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> AMC
              </span>
            )}
          </div>
        </div>
 
        {/* ── Report details ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fault</p>
            <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-3">
              {ticket.serviceReport?.faultDescription || '—'}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Solution</p>
            <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-3">
              {ticket.serviceReport?.solution || '—'}
            </p>
          </div>
        </div>
 
        {/* ── Cost breakdown ── */}
        <div className={`rounded-xl p-4 mb-4 border ${isAmcCovered ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              {isAmcCovered ? (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-700">AMC Covered — Labour Waived</span>
                </div>
              ) : (
                <>
                  <div className="flex gap-6">
                    <span className="text-slate-500">Service</span>
                    <span className="font-bold text-slate-700 ml-auto">₹{base.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-slate-500">CGST 12%</span>
                    <span className="font-bold text-slate-600 ml-auto">₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-slate-500">SGST 12%</span>
                    <span className="font-bold text-slate-600 ml-auto">₹{sgst.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="text-right border-l border-slate-300 pl-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
              <p className={`text-xl font-black ${isAmcCovered ? 'text-green-600' : 'text-brand-600'}`}>₹{total.toFixed(2)}</p>
            </div>
          </div>
        </div>
 
        {/* ── Action button ── */}
        {['delivered', 'closed'].includes(ticket.status) ? (
          <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm cursor-default border border-slate-200">
            <CheckCircle className="w-4 h-4" />
            Completed
          </div>
        ) : (
          <button
            onClick={() => onCreateReceipt(ticket)}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
             ${isAmcCovered ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20 group-hover:shadow-green-500/30' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20 group-hover:shadow-brand-500/30'}
             text-white font-bold text-sm cursor-pointer transition-all shadow-md group-hover:shadow-lg`}
          >
            <Receipt className="w-4 h-4" />
            {isAmcCovered ? 'Create AMC Receipt' : 'Create Receipt & Send'}
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        )}
      </div>
    </div>
  );
};

export default function Overview() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const[serviceReports, setServiceReports]=useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    closed: 0,
    urgent: 0
  });
  
  // Filters & Modal
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  
  // Receipt Modal
  const [receiptTicket, setReceiptTicket] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Service Report split-view state
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAllReports, setShowAllReports] = useState(false);
  const VISIBLE_REPORTS_COUNT = 5;

  // Fetch tickets and engineers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketsRes, engineersRes] = await Promise.all([
          api.get('/tickets?page=1&limit=50', { 
            params: filters.status ? { status: filters.status } : {}
          }),
          api.get('/auth/engineers')
        ]);

        setTickets(ticketsRes.data.tickets || []);
        setEngineers(engineersRes.data.engineers || []);

        // Calculate stats
        const allTickets = ticketsRes.data.tickets || [];
        setStats({
          total: allTickets.length,
          pending: allTickets.filter(t => ['ticket_created', 'pickup_scheduled'].includes(t.status)).length,
          active: allTickets.filter(t => ['on_transit', 'received', 'under_diagnosis', 'under_repair'].includes(t.status)).length,
          closed: allTickets.filter(t => t.status === 'closed').length,
          urgent: allTickets.filter(t => t.priority === 'high' || t.priority === 'critical').length
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.status]);

  // Assign ticket
  const handleAssignTicket = async (ticketId, engineerId) => {
    if (!engineerId) {
      toast.error('Please select an engineer');
      return;
    }
    try {
      const res = await api.patch(`/tickets/${ticketId}/assign`, { engineerId });
      setTickets(tickets.map(t => t._id === ticketId ? res.data.ticket : t));
      setSelectedTicket(res.data.ticket);
      toast.success('Ticket assigned successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign');
    }
  };

  // Update warranty
  const handleWarrantyUpdate = async (ticketId, status) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/warranty`, { status });
      setTickets(tickets.map(t => t._id === ticketId ? res.data.ticket : t));
      setSelectedTicket(res.data.ticket);
      toast.success('Warranty updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const handleOpenReceipt = (ticket) => {
    setReceiptTicket(ticket);
    setShowReceiptModal(true);
  };

  // Open ticket details
  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };
  const handleCreateBilling = async (ticket, total, formDetails) => {
  try {
    const isAmcCovered = ticket.isAmcCovered || false;
    const baseCharge = isAmcCovered ? 0 : (parseFloat(formDetails.serviceCharge) || 0);

    await api.post('/billings', {
      ticketId: ticket._id,
      items: [
        {
          description: 'Service Charge',
          quantity: 1,
          unitPrice: baseCharge
        }
      ],
      taxRate: 24,
      notes: `Customer: ${formDetails.customerName || ''} | Inverter: ${formDetails.inverterName || ''} | Fault: ${formDetails.faultDescription || ''} | Solution: ${formDetails.solution || ''}`
    });

    toast.success('Receipt sent to customer!');
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create billing');
    throw err;
  }
};

  // Fetch service reports
  useEffect(() => {
    const fetchServiceReports = async () => {
      try {
        const res = await api.get('/tickets',{
          params:{submittedToSales:true}
        });
        setServiceReports(res.data.tickets || []);
      } catch (error) {
        console.error('Error fetching service reports:', error);
      }
    };
    fetchServiceReports();
  }, []);

  const filteredTickets = tickets.filter(t => 
    t && 
    (!filters.search || t.ticketId?.includes(filters.search) || t.customer?.name?.includes(filters.search)) &&
    (!filters.priority || t.priority === filters.priority)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sales & BD Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Welcome back, {user?.name || 'Sales'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
        <StatCard label="Total Tickets" value={stats.total} icon={<Users className="w-6 h-6 text-blue-500" />} bg="bg-blue-50" />
        <StatCard label="Pending Pickups" value={stats.pending} icon={<Truck className="w-6 h-6 text-orange-500" />} bg="bg-orange-50" />
        <StatCard label="Active Repairs" value={stats.active} icon={<Wrench className="w-6 h-6 text-purple-500" />} bg="bg-purple-50" />
        <StatCard label="Urgent Items" value={stats.urgent} icon={<AlertCircle className="w-6 h-6 text-red-500" />} bg="bg-red-50" />
        <StatCard label="Closed" value={stats.closed} icon={<CheckCircle className="w-6 h-6 text-green-500" />} bg="bg-green-50" />
      </div>


      {/* Service Completion Reports — Split View */}
    <div className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='bg-brand-50 p-2.5 rounded-xl'>
            <FileText className='w-5 h-5 text-brand-600'/>
          </div>
          <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Service Completion Reports</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Click a report on the right to view details</p>
            </div>
        </div>
        {serviceReports.filter(t => !['delivered', 'closed'].includes(t.status)).length > 0 && (
            <span className="bg-brand-100 text-brand-700 text-xs font-black px-3 py-1.5 rounded-full">
              {serviceReports.filter(t => !['delivered', 'closed'].includes(t.status)).length} pending
            </span>
          )}
      </div>

      {serviceReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="bg-slate-100 rounded-2xl p-5 mb-4">
              <CheckCircle className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 font-bold">All caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No pending service reports at this time.</p>
          </div>
        ) : (
          <div className="flex gap-6" style={{ minHeight: 320 }}>
            {/* ── LEFT PANE: Selected Report Detail ── */}
            <div className="flex-1 min-w-0">
              {selectedReport ? (
                <div
                  key={selectedReport._id}
                  className="animate-slide-in-left h-full"
                >
                  <ServiceReportCard
                    ticket={selectedReport}
                    onCreateReceipt={handleOpenReceipt}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-center px-6">
                  <div className="bg-slate-100 rounded-2xl p-4 mb-3">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Select a report</p>
                  <p className="text-slate-300 text-xs mt-1">Click any report card on the right to view its full details here.</p>
                </div>
              )}
            </div>

            {/* ── RIGHT PANE: Compact Report List ── */}
            <div className="w-80 shrink-0 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {(showAllReports ? serviceReports : serviceReports.slice(0, VISIBLE_REPORTS_COUNT)).map(ticket => {
                  const isAmcCovered = ticket.isAmcCovered || false;
                  const isSelected = selectedReport?._id === ticket._id;
                  return (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedReport(ticket)}
                      className={`relative cursor-pointer rounded-xl border p-3 transition-all duration-200
                        hover:scale-[1.02] hover:shadow-xs
                        ${
                          isSelected
                            ? 'border-brand-400 bg-brand-50 shadow-md ring-2 ring-brand-200'
                            : 'border-slate-200 bg-white hover:border-brand-200'
                        }`}
                    >
                      {/* Accent bar */}
                      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${
                        isAmcCovered ? 'bg-green-500' : 'bg-brand-500'
                      }`} />

                      <div className="pl-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-800 text-sm tracking-tight truncate">{ticket.ticketId}</p>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 truncate">{ticket.customer?.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-slate-400 font-medium">
                            {ticket.serviceReport?.submittedAt
                              ? new Date(ticket.serviceReport.submittedAt).toLocaleDateString()
                              : '—'}
                          </p>
                          {isAmcCovered && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" /> AMC
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show More / Show Less */}
              {serviceReports.length > VISIBLE_REPORTS_COUNT && (
                <button
                  onClick={() => setShowAllReports(!showAllReports)}
                  className="mt-3 w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 hover:bg-brand-100 transition"
                >
                  {showAllReports
                    ? `Show Less`
                    : `Show More (${serviceReports.length - VISIBLE_REPORTS_COUNT} more)`}
                </button>
              )}
            </div>
          </div>
        )}
    </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">SEARCH</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Ticket ID, Customer..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">STATUS</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="ticket_created">Created</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="on_transit">In Transit</option>
              <option value="under_repair">Under Repair</option>
              <option value="ready_to_dispatch">Ready to Dispatch</option>
              <option value="dispatched">Dispatched</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">PRIORITY</label>
            <select 
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ status: '', priority: '', search: '' })}
              className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-semibold transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Ticket ID</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Customer</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Priority</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Assigned To</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Warranty</th>
                <th className="px-6 py-3 text-center font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No tickets found</td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{ticket.ticketId}</td>
                    <td className="px-6 py-4 text-slate-700">{ticket.customer?.name}</td>
                    <td className="px-6 py-4"><StatusBadge status={ticket.status} /></td>
                    <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-6 py-4 text-slate-700">{ticket.assignedTo?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-700">{ticket.warranty?.status || 'Unknown'}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleViewTicket(ticket)}
                        className="text-brand-600 hover:text-brand-800 font-semibold transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal 
        ticket={{...selectedTicket, serviceHistory: tickets.find(t => t && t._id === selectedTicket?._id)?.serviceHistory}}
        engineers={engineers}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAssign={handleAssignTicket}
        onWarrantyUpdate={handleWarrantyUpdate}
      />

      {/* Create Receipt Modal */}
      <CreateReceiptModal
        ticket={receiptTicket}
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setReceiptTicket(null);
        }}
        onSubmit={handleCreateBilling}
      />
    </div>
  );
}
