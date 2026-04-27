import { useState, useEffect } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { api } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function TicketCreation() {
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedInverter, setSelectedInverter] = useState('');

  const [formData, setFormData] = useState({
    faultDescription: '',
    errorCode: '',
    urgency: 'medium',
    priority: 'normal',
  });

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        setCustomers(res.data.customers || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch inverters when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      const fetchInverters = async () => {
        try {
          const res = await api.get(`/customers/inverters/by-customer?customerId=${selectedCustomer}`);
          setInverters(res.data.inverters || []);
        } catch (error) {
          console.error('Error fetching inverters:', error);
        }
      };
      fetchInverters();
    }
  }, [selectedCustomer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedInverter) {
      toast.error('Please select customer and inverter');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/tickets', {
        customerId: selectedCustomer,
        inverterId: selectedInverter,
        ...formData,
      });

      setTicketId(res.data.ticket.ticketId);
      toast.success(`Ticket ${res.data.ticket.ticketId} created successfully!`);
      setSubmitted(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setStep(1);
        setSelectedCustomer('');
        setSelectedInverter('');
        setFormData({
          faultDescription: '',
          errorCode: '',
          urgency: 'medium',
          priority: 'normal',
        });
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Ticket Created Successfully!</h2>
          <p className="text-green-700 text-lg mb-4">Ticket ID: <span className="font-bold text-brand-600">{ticketId}</span></p>
          <p className="text-green-600">Your ticket has been logged and queued for processing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create New Ticket</h1>
        <p className="text-slate-500 mt-1 font-medium">Raise a new service ticket for a customer</p>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-4">
        {[1, 2].map((s) => (
          <div 
            key={s}
            onClick={() => s <= step && setStep(s)}
            className={`flex items-center gap-3 cursor-pointer`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition ${
              step >= s 
                ? 'bg-brand-500 text-white' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {s}
            </div>
            <span className={`text-sm font-semibold ${step >= s ? 'text-slate-800' : 'text-slate-500'}`}>
              {s === 1 ? 'Select Details' : 'Describe Issue'}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreateTicket}>
        {/* Step 1: Customer & Inverter Selection */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => {
                  setSelectedCustomer(e.target.value);
                  setSelectedInverter('');
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
              >
                <option value="">-- Choose a customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.companyName})
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Select Inverter</label>
                <select
                  value={selectedInverter}
                  onChange={(e) => setSelectedInverter(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                >
                  <option value="">-- Choose an inverter --</option>
                  {inverters.map(inv => (
                    <option key={inv._id} value={inv._id}>
                      {inv.make} {inv.model} ({inv.serialNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!selectedCustomer || !selectedInverter}
                className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Issue Details */}
        {step === 2 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Fault Description *</label>
              <textarea
                name="faultDescription"
                value={formData.faultDescription}
                onChange={handleInputChange}
                placeholder="Describe the issue in detail..."
                required
                rows="5"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Error Code (Optional)</label>
              <input
                type="text"
                name="errorCode"
                value={formData.errorCode}
                onChange={handleInputChange}
                placeholder="e.g., E001, FAULT_CODE"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Urgency Level</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Priority Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-lg font-semibold transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !formData.faultDescription}
                className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
