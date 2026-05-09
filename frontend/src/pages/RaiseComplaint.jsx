import { AlertCircle, CheckCircle, ArrowLeft, Zap, AlertTriangle, Loader, MapPin, Package, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import RaiseComplaintSkeleton from '../components/skeletons/RaiseComplaintSkeleton';

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 bg-slate-50 text-slate-800 font-medium transition-all placeholder:text-slate-400 placeholder:font-normal";

const labelClass = "block text-sm font-bold text-slate-700 mb-2";

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="px-8 py-6">{children}</div>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen({ ticketId, onReset }) {
  return (
    <div className="bg-gray-200 rounded-3xl p-12 shadow-sm border border-slate-100 max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-8">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">Complaint Registered</h2>
      <p className="text-slate-600 mb-2 text-lg leading-relaxed">
        Your service request has been successfully logged.
      </p>
      <p className="text-red-600 font-bold text-xl mb-6">Ticket ID: {ticketId}</p>
      <p className="text-slate-600 mb-4 text-lg leading-relaxed">
        Our technical team will review it and contact you shortly to provide assistance.
      </p>
      
      {/* Tracking Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Package className="w-5 h-5 text-blue-600" />
          <p className="text-blue-800 font-semibold text-lg">Now you can track your package</p>
        </div>
        <p className="text-blue-700 text-sm mb-4">
          Monitor your service request status in real-time from your profile
        </p>
        <Link to="/dashboard/profile">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
            Go to My Profile → Tracking
          </button>
        </Link>
      </div>

      <button
        onClick={onReset}
        className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
      >
        Submit Another Request
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RaiseComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [profile, setProfile] = useState(null);
  const [inverters, setInverters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedInverter, setSelectedInverter] = useState('');
  const [fault, setFault] = useState({ category: 'no-output', priority: 'normal', description: '' });
  const [requestAmc, setRequestAmc] = useState(false);
  const [amcPlan, setAmcPlan] = useState(90);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch customer inverters and profile
  useEffect(() => {
    const fetchInverters = async () => {
      try {
        setLoading(true);
        const res = await api.get('/customers/my-profile');
        setProfile(res.data.customer);
        setInverters(res.data.inverters || []);
      } catch (error) {
        console.error('Error fetching inverters:', error);
        toast.error('Failed to load your inverters');
      } finally {
        setLoading(false);
      }
    };
    fetchInverters();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedInverter) {
      toast.error('Please select an inverter');
      return;
    }
    if (!fault.description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    try {
      setSubmitting(true);
      const profileRes = await api.get('/customers/my-profile');
      const customerId = profileRes.data.customer._id;

      // Create comprehensive fault description combining category and description
      const fullDescription = `[${fault.category.toUpperCase()}] ${fault.description}`;

      const response = await api.post('/tickets', {
        customerId,
        inverterId: selectedInverter,
        faultDescription: fullDescription,
        errorCode: '',
        urgency: 'medium',  // Default urgency (low, medium, high)
        priority: fault.priority,  // Priority (normal, high, critical)
        requestAmc,
        amcPlan
      });

      if (response.data.success) {
        setTicketId(response.data.ticket.ticketId);
        setSubmitted(true);
        toast.success('Complaint registered successfully!');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to register complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setTicketId('');
    setSelectedInverter('');
    setFault({ category: 'no-output', priority: 'normal', description: '' });
    setRequestAmc(false);
    setAmcPlan(90);
  };


  if (submitted) return <SuccessScreen ticketId={ticketId} onReset={handleReset} />;

  if (loading) {
    return <RaiseComplaintSkeleton />;
  }

  if (inverters.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to='/'>
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Raise a Complaint</h1>
            <p className="text-slate-500 mt-1 font-medium">Submit a service request for your solar equipment</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">You don't have any inverters registered yet.</p>
          <p className="text-slate-500 text-sm">Please add an inverter to your account first to register a complaint.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <Link to='/'>
          <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Raise a Complaint</h1>
            <p className="text-slate-500 mt-1 font-medium">Submit a service request for your solar equipment</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Section 1: Inverter Selection ── */}
        <SectionCard
          icon={Zap}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-500"
          title="Select Inverter"
          subtitle="Choose the equipment with the issue"
        >
          <div>
            <label className={labelClass}>Inverter</label>
            <select
              className={inputClass}
              value={selectedInverter}
              onChange={e => setSelectedInverter(e.target.value)}
              required
            >
              <option value="">-- Select Inverter --</option>
              {inverters.map(inv => (
                <option key={inv._id} value={inv._id}>
                  {inv.make} {inv.model} (Serial: {inv.serialNumber})
                </option>
              ))}
            </select>
          </div>
        </SectionCard>

        {/* ── Section 2: Delivery Address ── */}
        {profile && (
          <SectionCard
            icon={MapPin}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            title="Delivery Address"
            subtitle="This address will be used for service delivery"
          >
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Customer Name</p>
              <p className="font-semibold text-slate-800 mb-4">{profile.name}</p>
              
              <p className="text-sm text-slate-600 mb-1">Phone</p>
              <p className="font-semibold text-slate-800 mb-4">{profile.phone}</p>
              
              {/* Show default address or old address field */}
              {profile.addresses && profile.addresses.length > 0 ? (
                (() => {
                  const defaultAddr = profile.addresses.find(a => a.isDefault) || profile.addresses[0];
                  return (
                    <>
                      <p className="text-sm text-slate-600 mb-1">Address ({defaultAddr.type})</p>
                      <p className="font-semibold text-slate-800 mb-1">
                        {[defaultAddr.street, defaultAddr.city, defaultAddr.state, defaultAddr.pincode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p className="text-xs text-slate-600">{defaultAddr.country}</p>
                    </>
                  );
                })()
              ) : profile.address && (
                <>
                  <p className="text-sm text-slate-600 mb-1">Address</p>
                  <p className="font-semibold text-slate-800 mb-1">
                    {[profile.address.street, profile.address.city, profile.address.state, profile.address.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              To update your delivery address, please visit your <Link to="/dashboard/profile" className="text-red-500 hover:text-red-600 font-semibold">My Profile</Link> page
            </p>
          </SectionCard>
        )}

        {/* ── Section 3: Fault Details ── */}
        <SectionCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          title="Fault Details"
          subtitle="Describe the issue"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={labelClass}>Fault Category</label>
              <select
                className={inputClass}
                value={fault.category}
                onChange={e => setFault(p => ({ ...p, category: e.target.value }))}
                required
              >
                <option value="no-output">No Output</option>
                <option value="low-output">Low Output</option>
                <option value="error-code">Error Code / Fault Code</option>
                <option value="overheating">Overheating</option>
                <option value="communication">Communication / SCADA Issue</option>
                <option value="physical-damage">Physical Damage</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                className={inputClass}
                value={fault.priority}
                onChange={e => setFault(p => ({ ...p, priority: e.target.value }))}
                required
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Problem Description</label>
            <textarea
              rows={5}
              placeholder="Describe the issue in detail..."
              className={`${inputClass} resize-none`}
              value={fault.description}
              onChange={e => setFault(p => ({ ...p, description: e.target.value }))}
              required
            />
          </div>
        </SectionCard>

        {/* ── Section 4: AMC Request ── */}
        <SectionCard
          icon={ShieldCheck}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          title="AMC Request"
          subtitle="Generate AMC Contract request for Sales Team (Optional)"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requestAmc"
              className="w-5 h-5 accent-red-500 cursor-pointer"
              checked={requestAmc}
              onChange={(e) => setRequestAmc(e.target.checked)}
            />
            <label htmlFor="requestAmc" className="font-semibold text-slate-700 cursor-pointer">
              Request to Activate AMC (for expired warranty / out of warranty)
            </label>
          </div>
          {requestAmc && (
            <div className="mt-4 pl-8 mb-2" style={{ animation: 'fadeIn 0.3s' }}>
              <label className={labelClass}>Select AMC Duration</label>
              <select
                className={inputClass}
                value={amcPlan}
                onChange={e => setAmcPlan(Number(e.target.value))}
                required={requestAmc}
              >
                <option value={30}>Monthly (Minimum - 30 Days)</option>
                <option value={90}>Quarterly (90 Days)</option>
                <option value={180}>Half Yearly (180 Days)</option>
                <option value={365}>Yearly (Maximum - 365 Days)</option>
              </select>
            </div>
          )}
        </SectionCard>

        {/* ── Footer Buttons ── */}
        <div className="flex justify-end items-center gap-4 pt-2 pb-6">
          <button
            type="button"
            onClick={handleReset}
            className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-10 py-3.5 cursor-pointer flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-xl shadow-red-500/20 transform transition-all hover:-translate-y-0.5"
          >
            {submitting && <Loader className="w-4 h-4 animate-spin" />}
            Submit Complaint
          </button>
        </div>

      </form>
    </div>
  );
}