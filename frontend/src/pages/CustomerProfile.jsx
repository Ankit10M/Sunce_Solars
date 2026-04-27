import { ArrowLeft, Plus, Trash2, Edit2, Loader, MapPin, Check, Package, Truck, Home, RefreshCw, Clock, CheckCircle2, ChevronDown, ChevronUp, FileText, Download, Receipt, AlertCircle, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 bg-slate-50 text-slate-800 font-medium transition-all placeholder:text-slate-400 placeholder:font-normal";
const labelClass = "block text-sm font-bold text-slate-700 mb-2";

export default function CustomerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [inverters, setInverters] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState({});

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    serialNumber: '',
    capacity: '',
    installationDate: '',
    warrantyStartDate: '',
    warrantyEndDate: '',
    plantLocation: ''
  });

  const [addressFormData, setAddressFormData] = useState({
    street: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    type: 'home'
  });

  // Fetch customer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/customers/my-profile');
        setProfile(res.data.customer);
        setInverters(res.data.inverters || []);
        
        // Fetch customer tickets for tracking
        try {
          const ticketsRes = await api.get('/tickets');
          const allTickets = ticketsRes.data.tickets || ticketsRes.data.data || [];
          // Filter only this customer's tickets
          const customerTickets = allTickets.filter(t => t.customer?._id === res.data.customer._id);
          setTickets(customerTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (ticketError) {
          console.error('Error fetching tickets:', ticketError);
          setTickets([]);
        }

        // Fetch customer billings
        try {
          const billingsRes = await api.get('/billings/my-billings');
          setBillings(billingsRes.data.billings || []);
        } catch (billingError) {
          console.error('Error fetching billings:', billingError);
          setBillings([]);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(error.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInverter = async (e) => {
    e.preventDefault();
    
    if (!formData.make || !formData.model || !formData.serialNumber || !formData.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/customers/inverters', {
        make: formData.make,
        model: formData.model,
        serialNumber: formData.serialNumber,
        capacity: formData.capacity,
        installationDate: formData.installationDate || null,
        warrantyStartDate: formData.warrantyStartDate || null,
        warrantyEndDate: formData.warrantyEndDate || null,
        plantLocation: formData.plantLocation
      });

      if (res.data.success) {
        setInverters([res.data.inverter, ...inverters]);
        setFormData({
          make: '',
          model: '',
          serialNumber: '',
          capacity: '',
          installationDate: '',
          warrantyStartDate: '',
          warrantyEndDate: '',
          plantLocation: ''
        });
        setShowAddForm(false);
        toast.success('✓ Inverter added successfully!');
      }
    } catch (error) {
      console.error('Error adding inverter:', error);
      toast.error(error.response?.data?.message || 'Failed to add inverter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInverter = async (inverter) => {
    if (!window.confirm(`Delete inverter ${inverter.make} ${inverter.model}?`)) return;

    try {
      const res = await api.delete(`/customers/inverters/${inverter._id}`);
      if (res.data.success) {
        setInverters(inverters.filter(i => i._id !== inverter._id));
        toast.success('✓ Inverter removed successfully');
      }
    } catch (error) {
      console.error('Error deleting inverter:', error);
      toast.error(error.response?.data?.message || 'Failed to delete inverter');
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    if (!addressFormData.street || !addressFormData.city || !addressFormData.state || !addressFormData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/customers/${profile._id}/addresses`, addressFormData);

      if (res.data.success) {
        setProfile(prev => ({ ...prev, addresses: res.data.addresses }));
        setAddressFormData({
          street: '',
          city: '',
          state: '',
          country: 'India',
          pincode: '',
          type: 'home'
        });
        setShowAddAddressForm(false);
        toast.success('✓ Address added successfully!');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;

    try {
      const res = await api.delete(`/customers/${profile._id}/addresses/${addressId}`);
      if (res.data.success) {
        setProfile(prev => ({ ...prev, addresses: res.data.addresses }));
        toast.success('✓ Address removed successfully');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await api.patch(`/customers/${profile._id}/addresses/${addressId}/default`);
      if (res.data.success) {
        setProfile(prev => ({ ...prev, addresses: res.data.addresses }));
        toast.success('✓ Default address updated');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error(error.response?.data?.message || 'Failed to set default address');
    }
  };

  const handleRefreshTickets = async () => {
    try {
      const ticketsRes = await api.get('/tickets');
      const allTickets = ticketsRes.data.tickets || ticketsRes.data.data || [];
      const customerTickets = allTickets.filter(t => t.customer?._id === profile._id);
      setTickets(customerTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      toast.success('✓ Tracking list updated!');
    } catch (error) {
      console.error('Error refreshing tickets:', error);
      toast.error(error.response?.data?.message || 'Failed to refresh tracking list');
    }
  };

  // Toggle expanded ticket for M3 dropdown
  const toggleTicketExpand = (ticketId) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  // Download billing as printable HTML
  const handleDownloadBill = (billing) => {
    const relatedTicket = tickets.find(t => t._id === (billing.ticket?._id || billing.ticket));
    const customerName = profile?.name || 'Customer';
    const inverterName = relatedTicket?.inverter ? `${relatedTicket.inverter.make} ${relatedTicket.inverter.model}` : 'N/A';
    const faultDesc = relatedTicket?.faultDescription || relatedTicket?.serviceReport?.faultDescription || 'N/A';
    const solutionDesc = relatedTicket?.serviceReport?.solution || 'N/A';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${billing.invoiceNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #334155; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; }
          .company { font-size: 24px; font-weight: 800; color: #ef4444; }
          .company-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          .invoice-title { font-size: 28px; font-weight: 700; color: #1e293b; text-align: right; }
          .invoice-no { font-size: 14px; color: #64748b; text-align: right; margin-top: 4px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; margin-bottom: 6px; }
          .meta-value { font-size: 14px; font-weight: 600; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #1e293b; color: white; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          tr:nth-child(even) { background: #f8fafc; }
          .total-section { text-align: right; margin-top: 20px; }
          .total-row { display: flex; justify-content: flex-end; gap: 40px; padding: 8px 0; font-size: 14px; }
          .total-label { color: #64748b; min-width: 120px; text-align: right; }
          .total-value { font-weight: 600; min-width: 100px; text-align: right; }
          .grand-total { font-size: 18px; font-weight: 800; color: #ef4444; border-top: 2px solid #1e293b; padding-top: 12px; margin-top: 8px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company">☀ Sunce Renewables</div>
            <div class="company-sub">The Solar Inverter Doctors • Founded 2016 • Noida, India</div>
          </div>
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-no">${billing.invoiceNumber}</div>
          </div>
        </div>
        <div class="meta">
          <div class="meta-box">
            <div class="meta-label">Invoice Date</div>
            <div class="meta-value">${new Date(billing.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Ticket ID</div>
            <div class="meta-value">${billing.ticket?.ticketId || 'N/A'}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Customer</div>
            <div class="meta-value">${customerName}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Inverter</div>
            <div class="meta-value">${inverterName}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
          <h3 style="margin-bottom: 12px; margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Service Summary</h3>
          <p style="margin: 0; font-size: 14px; margin-bottom: 8px; color: #1e293b;"><strong>Fault Reported:</strong> ${faultDesc}</p>
          <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Solution Provided:</strong> ${solutionDesc}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price (₹)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${billing.items?.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unitPrice.toLocaleString('en-IN')}</td>
                <td>₹${item.amount.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total-section">
          <div class="total-row grand-total"><span class="total-label">Final Charge</span><span class="total-value">₹${billing.totalAmount?.toLocaleString('en-IN')}</span></div>
        </div>
        ${billing.notes ? `<div style="margin-top:30px;padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:13px;color:#92400e;"><strong>Notes:</strong> ${billing.notes}</div>` : ''}
        <div class="footer">
          Thank you for choosing Sunce Renewables Pvt. Ltd.<br/>
          For queries, contact support@sunce.com
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${billing.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('✓ Bill downloaded!');
  };

  // Status mapping for customer-friendly tracking
  const getTrackingStatus = (status) => {
    const statusMap = {
      ticket_created: { display: ' Order Created', step: 1, color: 'bg-blue-100 text-blue-700' },
      pickup_scheduled: { display: ' Ready for Pickup', step: 2, color: 'bg-cyan-100 text-cyan-700' },
      on_transit: { display: ' In Transit (to Service)', step: 3, color: 'bg-purple-100 text-purple-700' },
      received: { display: ' Received at Service Center', step: 4, color: 'bg-indigo-100 text-indigo-700' },
      under_diagnosis: { display: ' Received at Service Center', step: 4, color: 'bg-indigo-100 text-indigo-700' },
      under_repair: { display: ' Received at Service Center', step: 4, color: 'bg-indigo-100 text-indigo-700' },
      ready_to_dispatch: { display: ' Ready to Dispatch', step: 5, color: 'bg-lime-100 text-lime-700' },
      dispatched: { display: ' Out for Delivery', step: 6, color: 'bg-green-100 text-green-700' },
      delivered: { display: ' Delivered', step: 7, color: 'bg-teal-100 text-teal-700' },
      closed: { display: ' Closed', step: 8, color: 'bg-slate-100 text-slate-700' }
    };
    return statusMap[status] || { display: status, step: 0, color: 'bg-slate-100 text-slate-700' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard">
          <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your profile and inverters</p>
        </div>
      </div>

      {/* Profile Card */}
      {profile && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-600">Name</p>
              <p className="text-lg font-semibold text-slate-800">{profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="text-lg font-semibold text-slate-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Phone</p>
              <p className="text-lg font-semibold text-slate-800">{profile.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Company</p>
              <p className="text-lg font-semibold text-slate-800">{profile.companyName || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Inverters Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Inverters</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Inverter
          </button>
        </div>

        {/* Add Inverter Form — M2: Added warranty start/end date fields */}
        {showAddForm && (
          <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Add New Inverter</h3>
            <form onSubmit={handleAddInverter} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Make *</label>
                  <input
                    type="text"
                    name="make"
                    placeholder="e.g., Luminous, Microtek"
                    className={inputClass}
                    value={formData.make}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Model *</label>
                  <input
                    type="text"
                    name="model"
                    placeholder="Model number"
                    className={inputClass}
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Serial Number *</label>
                  <input
                    type="text"
                    name="serialNumber"
                    placeholder="Device serial number"
                    className={inputClass}
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Capacity (kW) *</label>
                  <input
                    type="text"
                    name="capacity"
                    placeholder="e.g., 5, 10, 15"
                    className={inputClass}
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Installation Date</label>
                  <input
                    type="date"
                    name="installationDate"
                    className={inputClass}
                    value={formData.installationDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className={labelClass}>Plant Location</label>
                  <input
                    type="text"
                    name="plantLocation"
                    placeholder="e.g., Roof, Ground"
                    className={inputClass}
                    value={formData.plantLocation}
                    onChange={handleInputChange}
                  />
                </div>
                {/* M2: Warranty Start and End Date */}
                <div>
                  <label className={labelClass}>Warranty Start Date</label>
                  <input
                    type="date"
                    name="warrantyStartDate"
                    className={inputClass}
                    value={formData.warrantyStartDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className={labelClass}>Warranty End Date</label>
                  <input
                    type="date"
                    name="warrantyEndDate"
                    className={inputClass}
                    value={formData.warrantyEndDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  Add Inverter
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inverters List — M2: Show warranty dates */}
        {inverters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No inverters registered yet</p>
            <p className="text-slate-500 text-sm">Add an inverter to start raising complaints</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inverters.map(inverter => (
              <div key={inverter._id} className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{inverter.make} {inverter.model}</p>
                  <p className="text-sm text-slate-600">Serial: {inverter.serialNumber}</p>
                  <p className="text-sm text-slate-600">Capacity: {inverter.capacity} kW</p>
                  {inverter.plantLocation && <p className="text-sm text-slate-600">Location: {inverter.plantLocation}</p>}
                  {/* M2: Display warranty dates */}
                  {(inverter.warrantyStartDate || inverter.warrantyEndDate) && (
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      {inverter.warrantyStartDate && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-md text-xs font-semibold text-green-700">
                           Warranty Start: {formatShortDate(inverter.warrantyStartDate)}
                        </span>
                      )}
                      {inverter.warrantyEndDate && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${
                          new Date(inverter.warrantyEndDate) > new Date()
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          {new Date(inverter.warrantyEndDate) > new Date() ? '' : ''} Warranty End: {formatShortDate(inverter.warrantyEndDate)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteInverter(inverter)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all ml-3"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Addresses Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Delivery Addresses</h2>
          <button
            onClick={() => setShowAddAddressForm(!showAddAddressForm)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>

        {/* Add Address Form */}
        {showAddAddressForm && (
          <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Add New Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    placeholder="House no., Street name"
                    className={inputClass}
                    value={addressFormData.street}
                    onChange={handleAddressInputChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className={inputClass}
                    value={addressFormData.city}
                    onChange={handleAddressInputChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    className={inputClass}
                    value={addressFormData.state}
                    onChange={handleAddressInputChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    className={inputClass}
                    value={addressFormData.pincode}
                    onChange={handleAddressInputChange}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    className={inputClass}
                    value={addressFormData.country}
                    onChange={handleAddressInputChange}
                  />
                </div>
                <div>
                  <label className={labelClass}>Address Type</label>
                  <select
                    name="type"
                    value={addressFormData.type}
                    onChange={handleAddressInputChange}
                    className={inputClass}
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  Add Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAddressForm(false)}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {profile?.addresses && profile.addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No addresses saved yet</p>
            <p className="text-slate-500 text-sm">Add an address for service delivery</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile?.addresses?.map(address => (
              <div key={address._id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-slate-800 capitalize">{address.type}</p>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {address.street}
                    </p>
                    <p className="text-sm text-slate-600">
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="text-sm text-slate-500">{address.country}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(address._id)}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-lg transition-all"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== M3: Service Request Tracking with Dropdown ========== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Service Request Tracking
            </h2>
            <p className="text-slate-500 mt-1">Track your service requests — click a ticket to see details</p>
          </div>
          <button
            onClick={handleRefreshTickets}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            title="Refresh tracking list"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* No Tickets */}
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No service requests yet</p>
            <p className="text-slate-500 text-sm mb-6">Raise a complaint to start tracking</p>
            <Link to="/raise-complaint">
              <button className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all">
                Raise Complaint
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const trackingStatus = getTrackingStatus(ticket.status);
              const isExpanded = expandedTickets[ticket._id];
              
              return (
                <div key={ticket._id} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  {/* M3: Clickable Ticket Header with dropdown arrow */}
                  <button
                    onClick={() => toggleTicketExpand(ticket._id)}
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          ticket.status === 'closed' ? 'bg-slate-100' :
                          ticket.status === 'dispatched' || ticket.status === 'ready_to_dispatch' ? 'bg-green-100' :
                          'bg-blue-100'
                        }`}>
                          {ticket.status === 'closed' ? (
                            <CheckCircle2 className="w-5 h-5 text-slate-600" />
                          ) : ticket.status === 'dispatched' || ticket.status === 'ready_to_dispatch' ? (
                            <Truck className="w-5 h-5 text-green-600" />
                          ) : (
                            <Package className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-bold text-slate-800 text-lg">{ticket.ticketId}</p>
                          <span className={`px-3 py-1 rounded-full font-semibold text-xs ${trackingStatus.color} whitespace-nowrap`}>
                            {trackingStatus.display}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {ticket.inverter?.make} {ticket.inverter?.model} • Created {formatShortDate(ticket.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className={`flex-shrink-0 ml-3 p-2 rounded-lg transition-all ${isExpanded ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-400'}`} style={{ transition: 'transform 0.3s ease, background 0.3s ease' }}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  {/* M3: Expandable Dropdown Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 p-6 bg-slate-50/50" style={{ animation: 'slideDown 0.3s ease-out' }}>
                      {/* Product Info */}
                      <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-3">Inverter Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-600 font-semibold uppercase">Make & Model</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {ticket.inverter?.make} {ticket.inverter?.model}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold uppercase">Serial Number</p>
                            <p className="text-sm font-semibold text-slate-800">{ticket.inverter?.serialNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold uppercase">Capacity</p>
                            <p className="text-sm font-semibold text-slate-800">{ticket.inverter?.capacity} kW</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 font-semibold uppercase">Fault</p>
                            <p className="text-sm font-semibold text-slate-800">{ticket.faultDescription || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tracking Timeline */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-600" />
                          Service Journey
                        </h4>
                        
                        <div className="space-y-3">
                          {/* Timeline Steps */}
                          {['ticket_created', 'pickup_scheduled', 'on_transit', 'received', 'dispatched', 'delivered', 'closed'].map((status, idx) => {
                            const statusInfo = getTrackingStatus(status);
                            const isCompleted = statusInfo.step <= getTrackingStatus(ticket.status).step;
                            const isCurrent = ['under_diagnosis', 'received'].includes(ticket.status) && status === 'received' || 
                                            ['under_repair', 'ready_to_dispatch'].includes(ticket.status) && status === 'dispatched' ||
                                            status === ticket.status;
                            
                            return (
                              <div key={status} className="flex items-start gap-4">
                                <div className="relative flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                    isCompleted 
                                      ? 'bg-green-500 text-white' 
                                      : isCurrent
                                      ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                                      : 'bg-slate-300 text-white'
                                  }`}>
                                    {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                                    {!isCompleted && !isCurrent && <Clock className="w-4 h-4 opacity-60" />}
                                  </div>
                                  {idx < 5 && (
                                    <div className={`w-1 h-8 mt-1 ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                  )}
                                </div>
                                <div className="pt-1">
                                  <p className={`font-semibold ${isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-slate-500'}`}>
                                    {statusInfo.display}
                                  </p>
                                  {isCurrent && (
                                    ticket.status === 'closed' ? (
                                      <p className="text-xs text-slate-500 mt-1 font-semibold">Ticket is closed</p>
                                    ) : (
                                      <div className="text-xs text-blue-600 mt-1">
                                        <p>Current Status - Updated {formatDate(ticket.updatedAt)}.</p>
                                        <p className="mt-1">Once the Product is Delivered Our Team will Contact You within 48hours</p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status Info */}
                      {ticket.status === 'dispatched' && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-sm text-green-800 font-semibold mb-2">🚛 On the Way</p>
                          <p className="text-sm text-green-700">Your serviced unit is on its way back to you. Check your email for courier tracking details.</p>
                        </div>
                      )}

                      {ticket.status === 'closed' && (
                        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <p className="text-sm text-slate-800 font-semibold mb-2">✔️ Service Complete</p>
                          <p className="text-sm text-slate-700">Your unit has been successfully delivered. Thank you for choosing Sunce Renewables!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========== M5: Billing Component ========== */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              Billing & Invoices
            </h2>
            <p className="text-slate-500 mt-1">View and download your service bills</p>
          </div>
        </div>

        {/* Case 1: No tickets at all — user hasn't raised any complaint */}
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-lg font-bold text-slate-800 mb-2">No Complaints Generated</p>
            <p className="text-slate-500 text-sm mb-6">Generate a complaint first to receive billing from the sales team.</p>
            <Link to="/dashboard/complaint">
              <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 mx-auto">
                <FileText className="w-4 h-4" />
                Raise Complaint
              </button>
            </Link>
          </div>
        ) : billings.length === 0 ? (
          /* Case 2: Tickets exist but no billing yet — waiting for sales */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-slate-800 mb-2">Waiting for Sales Team Response</p>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Your complaint has been registered. The sales team will review it and send you the billing details once the service assessment is complete.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm font-semibold">Processing your request...</span>
            </div>
          </div>
        ) : (
          /* Case 3: Billings exist — show them with download option */
          <div className="space-y-4">
            {billings.map((billing) => {
              const relatedTicket = tickets.find(t => t._id === (billing.ticket?._id || billing.ticket));
              const customerName = profile?.name || 'Customer';
              const inverterName = relatedTicket?.inverter ? `${relatedTicket.inverter.make} ${relatedTicket.inverter.model}` : 'N/A';
              const faultDesc = relatedTicket?.faultDescription || relatedTicket?.serviceReport?.faultDescription || 'N/A';
              const solutionDesc = relatedTicket?.serviceReport?.solution || 'N/A';

              return (
              <div key={billing._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-slate-800 text-lg">{billing.invoiceNumber}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        billing.status === 'paid' ? 'bg-green-100 text-green-700' :
                        billing.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        billing.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {billing.status?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Ticket: <span className="font-semibold text-slate-700">{billing.ticket?.ticketId || 'N/A'}</span>
                      {' • '} Date: {formatShortDate(billing.createdAt)}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                      <p className="text-sm"><span className="text-slate-500">Customer:</span> <span className="font-medium text-slate-800">{customerName}</span></p>
                      <p className="text-sm"><span className="text-slate-500">Inverter:</span> <span className="font-medium text-slate-800">{inverterName}</span></p>
                      <p className="text-sm col-span-2 mt-1"><span className="text-slate-500">Fault:</span> <span className="font-medium text-slate-800 bg-red-50 text-red-700 px-2 py-0.5 rounded">{faultDesc}</span></p>
                      <p className="text-sm col-span-2"><span className="text-slate-500">Solution:</span> <span className="font-medium text-slate-800 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{solutionDesc}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadBill(billing)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>

                {/* Bill Items */}
                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-4 py-2.5 text-xs font-bold text-slate-600 uppercase">#</th>
                        <th className="px-4 py-2.5 text-xs font-bold text-slate-600 uppercase">Description</th>
                        <th className="px-4 py-2.5 text-xs font-bold text-slate-600 uppercase text-center">Qty</th>
                        <th className="px-4 py-2.5 text-xs font-bold text-slate-600 uppercase text-right">Unit Price</th>
                        <th className="px-4 py-2.5 text-xs font-bold text-slate-600 uppercase text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.items?.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-200">
                          <td className="px-4 py-2.5 text-slate-600">{idx + 1}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-800">{item.description}</td>
                          <td className="px-4 py-2.5 text-center text-slate-600">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-slate-600">₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-800">₹{item.amount?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bill Totals */}
                <div className="mt-4 flex justify-end">
                  <div className="w-auto min-w-[250px]">
                    <div className="flex justify-between items-center text-base font-bold bg-slate-100 px-4 py-3 rounded-lg text-slate-800">
                      <span>Final Charge</span>
                      <span className="text-emerald-600 text-lg">₹{billing.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {billing.notes && (
                  <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <strong>Note:</strong> {billing.notes}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; transform: translateY(-10px); }
          to { opacity: 1; max-height: 2000px; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
