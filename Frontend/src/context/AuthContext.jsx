import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/auth.api.js";
import { setAccessToken, setUnauthorizedHandler } from "../api/axiosClient.js";
import { signInWithGoogle } from "../firebase/firebaseClient.js";

const AuthContext = createContext(null);

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

  // On first load, try to silently restore a session from the httpOnly refresh cookie.
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data: refreshData } = await authApi.refreshSession();
        setAccessToken(refreshData.data.accessToken);
        const { data: meData } = await authApi.getMe();
        setUser(meData.data.user);
      } catch (error) {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, [clearSession]);

  const applySession = (payload) => {
    setAccessToken(payload.accessToken);
    setUser(payload.user);
  };

  const loginWithPassword = async (identifier, password) => {
    const { data } = await authApi.login(identifier, password);
    applySession(data.data);
    return data.data.user;
  };

  const loginWithOtp = async (phone, code, name, referralCode) => {
    const { data } = await authApi.verifyOtp(phone, code, name, referralCode);
    applySession(data.data);
    return data.data.user;
  };

  const registerWithPassword = async (payload) => {
    const { data } = await authApi.register(payload);
    applySession(data.data);
    return data.data.user;
  };

  const sendEmailOtp = (email) => authApi.sendEmailOtp(email);

  const verifyEmailOtp = (email, code) => authApi.verifyEmailOtp(email, code);

  const registerWithEmailOtp = async (payload) => {
    const { data } = await authApi.registerWithEmail(payload);
    applySession(data.data);
    return data.data.user;
  };

  const loginWithGoogle = async (referralCode) => {
    const idToken = await signInWithGoogle();
    const { data } = await authApi.googleLogin(idToken, referralCode);
    applySession(data.data);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  const refreshProfile = async () => {
    const { data } = await authApi.getMe();
    setUser(data.data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithPassword,
        loginWithOtp,
        loginWithGoogle,
        registerWithPassword,
        sendEmailOtp,
        verifyEmailOtp,
        registerWithEmailOtp,
        logout,
        refreshProfile,
      }}
    >
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
