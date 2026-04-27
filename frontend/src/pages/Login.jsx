import { useState, useEffect } from "react";
import { useNavigate, Link, replace } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Zap, ShieldCheck, ExternalLink, Sun } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../contexts/AuthContext";

const ROLE_HOME = {
  customer: "/",
  sales: "/sales",
  engineer: "/service",
  service_manager: "/service",
  admin: "/admin",
};

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastLoginAttempt, setLastLoginAttempt] = useState(0);

  const [adminPending, setAdminPending] = useState(false);
  const [devVerifyUrl, setDevVerifyUrl] = useState("");

  useEffect(() => {
    if (user) {
      navigate(ROLE_HOME[user.role] || "/login", { replace: true });
    }
  }, [user, navigate]);
  const isAdminEmail = email.toLowerCase().endsWith("@sunce.com");
  const handleRegularLogin = async (e) => {
    e.preventDefault();
    
    // Prevent rapid login attempts (minimum 2 seconds between attempts)
    const now = Date.now();
    if (now - lastLoginAttempt < 2000) {
      toast.error("Please wait before trying again");
      return;
    }
    
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      navigate(ROLE_HOME[loggedInUser.role] || "/");
    } catch (err) {
      setLastLoginAttempt(Date.now()); // Record failed attempt
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    // Prevent rapid login attempts (minimum 2 seconds between attempts)
    const now = Date.now();
    if (now - lastLoginAttempt < 2000) {
      toast.error("Please wait before trying again");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post("/auth/admin-login", { email, password });
      toast.success("Verification link sent! Check your email.");
      setAdminPending(true);
      // devVerifyUrl is only returned in development mode
      if (data.devVerifyUrl) setDevVerifyUrl(data.devVerifyUrl);
    } catch (err) {
      setLastLoginAttempt(Date.now()); // Record failed attempt
      const msg = err.response?.data?.message || "Admin login failed.";
      if (err.response?.status === 429) {
        toast.error("Too many login attempts. Please wait a moment and try again.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isAdminEmail ? handleAdminLogin : handleRegularLogin;

  if (adminPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 font-sans relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-yellow-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10"></div>
        <div className="z-10 w-full max-w-md p-6 md:p-8 glass-effect rounded-2xl shadow-2xl border border-white/10 m-4 relative backdrop-blur-xl bg-white/10 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-green-50/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Check Your Email
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            A verification link has been sent to{" "}
            <span className="font-semibold text-white">{email}</span>. Click
            it to access the admin dashboard. The link expires in{" "}
            <span className="font-semibold">10 minutes</span>.
          </p>

          {/* Dev-only: shows verify URL directly so you can test without SMTP */}
          {devVerifyUrl && (
            <div className="bg-amber-500/20 border border-amber-400 rounded-xl p-4 text-left text-xs space-y-2">
              <p className="font-bold text-amber-300">
                🛠 Dev mode — click to verify directly:
              </p>
              <a
                href={devVerifyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-300 hover:text-brand-200 break-all flex items-start gap-1 font-mono"
              >
                {devVerifyUrl}
                <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
              </a>
              <p className="text-amber-300">
                Remove devVerifyUrl before going to production.
              </p>
            </div>
          )}

          <button
            className="text-sm text-slate-300 hover:text-white font-medium transition-colors"
            onClick={() => {
              setAdminPending(false);
              setDevVerifyUrl("");
            }}
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  // ── Main login form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 font-sans relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-yellow-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10"></div>

      <div className="z-10 w-full max-w-md p-6 md:p-8 glass-effect rounded-2xl shadow-2xl border border-white/10 m-4 relative backdrop-blur-xl bg-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-500/20 rounded-full mb-4 ring-1 ring-brand-400/50">
            <Sun className="h-10 w-10 text-brand-400" />
          </div>
          <h1 className="text-2xl md:text-3xl items-center font-bold text-white tracking-tight text-center">
            Sunce Renewables
          </h1>
          <p className="text-brand-200 mt-2 text-sm font-medium">
            The Solar Inverter Doctors
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin notice */}
          {isAdminEmail && (
            <div className="bg-blue-500/20 border border-blue-400 text-blue-200 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                A one-time verification link will be sent to your email.
              </span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email ID
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              placeholder="sunceSolars@sunce.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            {isAdminEmail && (
              <p className="text-xs text-green-400 font-medium pl-1 mt-1">
                ✓ Admin account detected (@sunce.admin.com)
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all pr-11"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold shadow-lg shadow-brand-500/30 transform transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isAdminEmail ? (
              <>
                <span>Send Verification Link</span>
                <Zap className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                <span>Secure Login</span>
                <Zap className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          {/* Signup link */}
          <p className="text-center text-sm text-slate-300 pt-1">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-black font-semibold hover:text-gray-800 transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          © 2024 Sunce Renewables Pvt. Ltd.
          <br />
          Founded 2016 • Noida, India
        </p>
      </div>
    </div>
  );
}
