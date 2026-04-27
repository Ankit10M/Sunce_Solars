
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ShieldCheck, XCircle, Loader } from "lucide-react";
import { api } from "../contexts/AuthContext";
import { useAuth } from "../contexts/AuthContext";

const AdminVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verfivcation token found in the URL");
      return;
    }
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/admin-verify?token=${token}`);
        toast.success("Indentity Verified! Redirecting to admin dashboard...");
        setStatus("success");
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1500);
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          "Verification failed. The link may have expired";
        setStatus("error");
        setMessage(msg);
        toast.error(msg);
      }
    };
    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body items-center text-center gap-5">
          {status === "verifying" && (
            <>
              <Loader className="w-12 h-12 text-primary animate-spin" />
              <h2 className="text-xl font-bold text-base-content">
                Verifying your identity...
              </h2>
              <p className="text-base-content/50 text-sm">
                Please wait a moment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-base-content">Verified!</h2>
              <p className="text-base-content/50 text-sm">
                Redirecting to admin dashboard...
              </p>
              <span className="loading loading-dots loading-md text-primary" />
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-error" />
              </div>
              <h2 className="text-xl font-bold text-base-content">
                Verification Failed
              </h2>
              <p className="text-base-content/50 text-sm">{message}</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/", { replace: true })}
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVerify;
