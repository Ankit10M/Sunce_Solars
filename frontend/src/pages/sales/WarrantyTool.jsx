import { useState } from 'react';
import { Search, Shield, AlertTriangle, Calendar, RefreshCcw, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function WarrantyTool() {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) {
      toast.error('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      // Search by ticket ID or serial number
      const res = await api.get(`/tickets/${searchQuery.trim()}`);
      const ticket = res.data.ticket;
      
      if (!ticket) {
        toast.error('Ticket not found');
        setResult(null);
        return;
      }

      // Check real AMC model for accurate status
      let amcActive = ticket.isAmcCovered || ticket.warranty?.hasAMC || false;
      let amcExpiry = ticket.warranty?.amcExpiry;
      
      if (ticket.customer?._id && ticket.inverter?._id) {
        try {
          const amcRes = await api.get(`/amc/check?customerId=${ticket.customer._id}&inverterId=${ticket.inverter._id}`);
          if (amcRes.data.hasActiveAMC) {
            amcActive = true;
            amcExpiry = amcRes.data.amc?.endDate;
          }
        } catch (e) {
          // AMC check failed, fall back to ticket data
        }
      }

      // Calculate warranty status
      const now = new Date();
      const startDateRaw = ticket.warranty?.startDate || ticket.inverter?.warrantyStartDate;
      const expiryDateRaw = ticket.warranty?.expiryDate || ticket.inverter?.warrantyEndDate;
      
      const startDate = startDateRaw ? new Date(startDateRaw) : null;
      const expiryDate = expiryDateRaw ? new Date(expiryDateRaw) : null;
      
      let warrantyStatus = ticket.warranty?.status || 'unknown';
      
      if (amcActive) {
        warrantyStatus = 'amc';
      } else if (expiryDate) {
        if (expiryDate < now) {
          warrantyStatus = 'out_of_warranty';
        } else {
          warrantyStatus = 'in_warranty';
        }
      }

      setResult({
        ticketId: ticket.ticketId,
        customer: ticket.customer?.name || 'N/A',
        companyName: ticket.customer?.companyName || 'N/A',
        device: `${ticket.inverter?.make || 'N/A'} ${ticket.inverter?.model || 'N/A'}`,
        make: ticket.inverter?.make,
        model: ticket.inverter?.model,
        serial: ticket.inverter?.serialNumber || 'N/A',
        capacity: ticket.inverter?.capacity || 'N/A',
        status: warrantyStatus,
        startDate: startDate ? startDate.toLocaleDateString() : 'N/A',
        expiryDate: expiryDate ? expiryDate.toLocaleDateString() : 'N/A',
        amc: amcActive,
        amcExpiry: amcExpiry ? new Date(amcExpiry).toLocaleDateString() : 'N/A',
        verifiedBy: ticket.warranty?.verifiedBy?.name || 'Not verified',
        verifiedAt: ticket.warranty?.verifiedAt ? new Date(ticket.warranty.verifiedAt).toLocaleDateString() : 'N/A'
      });
      toast.success('Warranty information loaded!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch warranty information');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Warranty Verification Engine</h1>
        <p className="text-slate-500 mt-1 font-medium">Instantly crosscheck active warranties via Serial Number or Customer Phone</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center">
        <form onSubmit={handleSearch} className="flex w-full gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter Ticket ID (e.g., TK-2024-001)..."
              className="w-full pl-14 pr-6 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50 text-slate-800 font-medium transition-all text-lg"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:bg-slate-400 transition-colors shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search Warranty'
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            {/* Background design */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-xl ${result.status === 'In Warranty' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-brand-500" /> Policy Status
            </h3>
            
            <div className="flex items-center justify-between py-4 border-b border-slate-100">
               <span className="text-slate-500 font-medium">Coverage</span>
               {result.status === 'in_warranty' ? (
                 <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-extrabold text-xs uppercase tracking-wider border border-green-200 shadow-sm flex items-center">
                   <Shield className="w-4 h-4 mr-2" /> In Warranty
                 </span>
               ) : result.status === 'amc' ? (
                 <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs uppercase tracking-wider border border-blue-200 shadow-sm flex items-center">
                   <Shield className="w-4 h-4 mr-2" /> AMC Active
                 </span>
               ) : (
                 <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs uppercase tracking-wider border border-red-200 shadow-sm flex items-center">
                   <AlertTriangle className="w-4 h-4 mr-2" /> Out of Warranty
                 </span>
               )}
            </div>

            <div className="flex justify-between py-4 border-b border-slate-100">
               <span className="text-slate-500 font-medium flex items-center"><Calendar className="w-4 h-4 mr-2" /> Start Date</span>
               <span className="font-semibold text-slate-800">{result.startDate}</span>
            </div>

            <div className="flex justify-between py-4 border-b border-slate-100">
               <span className="text-slate-500 font-medium flex items-center"><Calendar className="w-4 h-4 mr-2" /> Expiry Date</span>
               <span className="font-semibold text-slate-800">{result.expiryDate}</span>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
               <div className="flex flex-col">
                 <span className="text-slate-800 font-bold flex items-center">
                   <RefreshCcw className="w-4 h-4 mr-2 text-brand-500" /> AMC Add-on
                 </span>
                 <span className="text-xs text-slate-400 mt-1">Annual Maintenance Contract</span>
               </div>
               <div className={`px-4 py-2 rounded-lg font-semibold ${result.amc ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                 {result.amc ? '✓ Active' : 'Not Active'}
               </div>
            </div>
            {result.amc && (
              <div className="flex justify-between py-4 border-t border-slate-100 mt-4 pt-4">
                <span className="text-slate-500 font-medium">AMC Expiry</span>
                <span className="font-semibold text-slate-800">{result.amcExpiry}</span>
              </div>
            )}
            <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
              <p className="mb-1"><strong>Verified By:</strong> {result.verifiedBy}</p>
              <p><strong>Verified On:</strong> {result.verifiedAt}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col justify-center space-y-8 relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Shield className="w-32 h-32" />
             </div>
             
             <div>
               <p className="text-xs text-brand-500 font-extrabold uppercase tracking-widest mb-2">Ticket ID</p>
               <p className="text-2xl font-black text-slate-800">{result.ticketId}</p>
             </div>
             <div>
               <p className="text-xs text-brand-500 font-extrabold uppercase tracking-widest mb-2">Registered Owner</p>
               <p className="text-lg font-bold text-slate-800">{result.customer}</p>
               {result.companyName && <p className="text-sm text-slate-600 mt-1">{result.companyName}</p>}
             </div>
             <div>
               <p className="text-xs text-brand-500 font-extrabold uppercase tracking-widest mb-2">Hardware Unit</p>
               <p className="text-sm font-semibold text-slate-700 mb-2">Make: {result.make || 'N/A'}</p>
               <p className="text-sm font-semibold text-slate-700 mb-2">Model: {result.model || 'N/A'}</p>
               <p className="text-sm font-semibold text-slate-700">Capacity: {result.capacity} kW</p>
             </div>
             <div>
               <p className="text-xs text-brand-500 font-extrabold uppercase tracking-widest mb-2">Serial Number</p>
               <p className="text-lg font-mono font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-xl inline-block border border-slate-200">{result.serial}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
