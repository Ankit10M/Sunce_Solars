import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4500/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [accessToken]);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;
        if (
          error.response?.status === 401 &&
          !original._retry &&
          !original.url?.includes("/auth/refresh")
        ) {
          original._retry = true;
          try {
            const { data } = await api.post("/auth/refresh");
            setAccessToken(data.accessToken);
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(original);
          } catch (error) {
            setUser(null);
            setAccessToken(null);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);

        // Also fetch the full user profile so we have name, role, _id, etc.
        const meRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        setUser(meRes.data.user);
      } catch {
        // No valid refresh cookie — user needs to log in
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.user;
    } catch (error) {
      // Pass through 429 errors for proper UI handling
      if (error.response?.status === 429) {
        const rateLimitError = new Error("Too many login attempts. Please wait before trying again.");
        rateLimitError.response = error.response;
        throw rateLimitError;
      }
      throw error;
    }
  }, []);
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Skeleton Navbar */}
        <div className="bg-white border-b border-slate-200 h-16 flex items-center px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg animate-pulse" />
            <div className="h-5 w-40 bg-slate-200 rounded-md animate-pulse" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse hidden sm:block" />
            <div className="h-4 w-16 bg-slate-200 rounded animate-pulse hidden sm:block" />
            <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Skeleton Body */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
              <div className="h-3 w-32 bg-slate-100 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
