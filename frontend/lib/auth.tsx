"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  apiRequest,
  UserProfile,
  RegisterResponse,
  AuthTokenResponse,
  ForgotPasswordResponse,
} from "./api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<RegisterResponse>;
  verifySignupOtp: (email: string, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (email: string, otp: string, newPassword: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const existingToken = getAuthToken();
    if (existingToken) {
      setTokenState(existingToken);
      // Fetch user profile
      apiRequest<UserProfile>("/auth/me")
        .then((res) => {
          setUser(res);
        })
        .catch(() => {
          // If token expired, clear
          clearAuthToken();
          setTokenState(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<AuthTokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setAuthToken(res.access_token);
    setTokenState(res.access_token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string): Promise<RegisterResponse> => {
    const res = await apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: name,
        email,
        password,
        confirm_password: confirmPassword || password,
      }),
    });

    return res;
  };

  const verifySignupOtp = async (email: string, otp: string) => {
    const res = await apiRequest<AuthTokenResponse>("/auth/verify-signup-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });

    setAuthToken(res.access_token);
    setTokenState(res.access_token);
    setUser(res.user);
  };

  const forgotPassword = async (email: string): Promise<string> => {
    const res = await apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return res.message;
  };

  const resetPassword = async (email: string, otp: string, newPassword: string, confirmPassword: string) => {
    const res = await apiRequest<AuthTokenResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });

    setAuthToken(res.access_token);
    setTokenState(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    clearAuthToken();
    setTokenState(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        verifySignupOtp,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
