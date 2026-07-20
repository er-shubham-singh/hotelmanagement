import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/auth.api.js";
import { setAccessToken, setUnauthorizedHandler } from "../api/axiosClient.js";

const AuthContext = createContext(null);

const ALLOWED_ROLES = ["admin", "hotelOwner"];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data: refreshData } = await authApi.refreshSession();
        setAccessToken(refreshData.data.accessToken);
        const { data: meData } = await authApi.getMe();
        if (!ALLOWED_ROLES.includes(meData.data.user.role)) throw new Error("Not authorized");
        setUser(meData.data.user);
      } catch (error) {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, [clearSession]);

  const login = async (identifier, password) => {
    const { data } = await authApi.login(identifier, password);
    if (!ALLOWED_ROLES.includes(data.data.user.role)) {
      throw new Error("This account does not have admin or hotel-owner access.");
    }
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;
