import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/axios";
import { loginUser, registerUser } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore persisted session on app start ──
  useEffect(() => {
    const loadSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("userToken"),
          AsyncStorage.getItem("userInfo"),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn("Failed to restore session:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  // ── Login ──
  // Web backend returns: { user, accessToken }
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await loginUser({ email, password });

      const accessToken = data.accessToken || data.token;
      const userData = data.user;

      setToken(accessToken);
      setUser(userData);

      await Promise.all([
        AsyncStorage.setItem("userToken", accessToken),
        AsyncStorage.setItem("userInfo", JSON.stringify(userData)),
      ]);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Login failed",
      };
    }
  }, []);

  // ── Register ──
  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await registerUser({ name, email, password });

      // Web backend may return a message (email verification) instead of token
      if (data.accessToken || data.token) {
        const accessToken = data.accessToken || data.token;
        const userData = data.user;

        setToken(accessToken);
        setUser(userData);

        await Promise.all([
          AsyncStorage.setItem("userToken", accessToken),
          AsyncStorage.setItem("userInfo", JSON.stringify(userData)),
        ]);

        return { success: true, user: userData };
      }

      // Email verification flow – no auto-login
      return {
        success: true,
        message: data.message || "Registration successful! Please verify your email.",
        requiresVerification: true,
        verifyUrl: data.verifyUrl,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Registration failed",
      };
    }
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await Promise.all([
      AsyncStorage.removeItem("userToken"),
      AsyncStorage.removeItem("userInfo"),
    ]);
  }, []);

  // ── Update profile in context (after API call) ──
  const updateProfileContext = useCallback(async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfileContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};