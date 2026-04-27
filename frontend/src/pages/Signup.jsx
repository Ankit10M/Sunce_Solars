import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  Zap,
  UserCircle,
  Briefcase,
  Wrench,
  ShieldAlert,
  Sun,
  CheckCircle,
} from "lucide-react";
import { api } from "../contexts/AuthContext";


const ROLES = [
  {
    value: "customer",
    label: "Customer",
    icon: <UserCircle className="w-5 h-5" />,
    description: "Raise complaints and track inverter repairs",
    color: "btn-primary",
  },
  {
    value: "sales",
    label: "Sales / BD",
    icon: <Briefcase className="w-5 h-5" />,
    description: "Manage tickets, warranty and logistics",
    color: "btn-secondary",
    pendingApproval: true,
  },
  {
    value: "engineer",
    label: "Service Engineer",
    icon: <Wrench className="w-5 h-5" />,
    description: "Handle diagnostics, repairs and job cards",
    color: "btn-accent",
    pendingApproval: true,
  },
  {
    value: "service_manager",
    label: "Service Manager",
    icon: <ShieldAlert className="w-5 h-5" />,
    description: "Oversee service operations and SLA",
    color: "btn-warning",
    pendingApproval: true,
  },
];

  const Field = ({ label, name, type = 'text', placeholder, required = false, value, onChange }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
      />
    </div>
  );

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
  });
  const selectedRole = ROLES.find((r) => r.value === role);
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        phone: form.phone,
        companyName: form.companyName || undefined,
      };
      const { data } = await api.post("/auth/register", payload);
      if (role === "customer") {
        // Customer gets logged in right away
        toast.success("Account created! Welcome to Sunce ERP.");
        // AuthContext will restore via cookie — reload to trigger it
        window.location.href = "/";
      } else {
        // Non-customer roles need admin approval
        setDoneMsg("Account created successfully! Please wait for admin approval. You will receive a confirmation email once approved.");
        setDone(true);
        toast.success("Account created! Awaiting admin approval...");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
 if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 font-sans relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-yellow-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10"></div>
        <div className="z-10 w-full max-w-md p-6 md:p-8 glass-effect rounded-2xl shadow-2xl border border-white/10 m-4 relative backdrop-blur-xl bg-white/10 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-green-50/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Request Submitted!
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">{doneMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-lg shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-800 via-brand-900 to-slate-800 font-sans relative overflow-hidden min-h-screen py-10 px-4">
      {/* Abstract background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-yellow-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10"></div>

      <div className="z-10 w-full max-w-lg">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="p-3 bg-brand-500/20 rounded-full mb-4 ring-1 ring-brand-400/50 w-fit mx-auto">
            <Sun className="h-10 w-10 text-brand-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight text-center">
            Sunce Renewables
          </h1>
          <p className="text-brand-200 mt-2 text-sm font-black">
            The Solar Inverter Doctors
          </p>
        </div>

        {/* Card */}
        <div className="glass-effect rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl bg-white/10">
          <div className="px-8 py-6 border-b border-white/10 flex items-center gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-300 hover:text-white transition-colors font-medium text-sm"
              >
                ←
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {step === 1 ? 'Select your role' : `${selectedRole?.label} Registration`}
              </h2>
              {step === 2 && selectedRole?.pendingApproval && (
                <p className="text-xs text-amber-300 font-medium mt-0.5">
                  ⚠ Account will require admin approval to activate
                </p>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* ── Step 1: Role picker ────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="space-y-3">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => { setRole(r.value); setStep(2); }}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-lg border-2 border-slate-700 hover:border-brand-500/50 hover:bg-brand-500/10 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800 group-hover:bg-brand-500/30 flex items-center justify-center text-slate-400 group-hover:text-brand-300 transition-colors shrink-0">
                        {r.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{r.label}</span>
                          {r.pendingApproval && (
                            <span className="text-xs bg-amber-500/30 text-amber-200 font-semibold px-2 py-0.5 rounded-full">
                              Needs approval
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{r.description}</p>
                      </div>
                      <span className="text-slate-500 group-hover:text-brand-400 transition-colors font-bold">→</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-sm text-slate-300">
                    Already have an account?{' '}
                    <Link to="/login" className="text-black font-semibold hover:text-gray-800 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 2: Registration form ──────────────────────────────── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Email — all roles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full Name"      name="name"  placeholder="Rohit Sharma" required value={form.name} onChange={handleChange} />
                  <Field label="Email Address"  name="email" type="email" placeholder="you@example.com" required value={form.email} onChange={handleChange} />
                </div>

                {/* Phone & Company — customer only */}
                {role === 'customer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Phone Number"  name="phone"       placeholder="9876543210" required value={form.phone} onChange={handleChange} />
                    <Field label="Company Name (Optional)"  name="companyName" placeholder="Your company name" value={form.companyName} onChange={handleChange} />
                  </div>
                )}

                {/* Password fields — all roles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPass ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all pr-11"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                    <input
                      name="confirmPassword"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold shadow-lg shadow-brand-500/30 transform transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none rounded-lg flex justify-center items-center gap-2 mt-2"
                >
                  {loading
                    ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <span>{role === 'customer' ? 'Create Account' : 'Submit Request'}</span>
                  }
                </button>

                <p className="text-center text-sm text-slate-300 pt-1">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand-300 font-semibold hover:text-brand-200 transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          © 2024 Sunce Renewables Pvt. Ltd.
          <br />
          Founded 2016 • Noida, India
        </p>
      </div>
    </div>
  );
};

export default Signup;
