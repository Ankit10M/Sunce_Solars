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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "14px",
          color: "#666",
        }}
      >
        Loading...
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
