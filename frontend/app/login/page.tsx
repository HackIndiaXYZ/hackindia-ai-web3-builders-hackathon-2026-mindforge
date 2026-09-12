"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { ArrowRight, Lock, Mail, User, ShieldCheck } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/onboarding";

  const { login, register } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Enter a valid email address";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Sign up specific validations
    if (mode === "signup") {
      if (!fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      if (mode === "signin") {
        await login(email, password);
        toast("Signed in successfully!", "success");
      } else {
        await register(fullName, email, password);
        toast("Account created successfully!", "success");
      }
      router.push(redirectUrl);
    } catch (err: any) {
      toast(err.message || "Authentication failed. Please check credentials.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary-text flex flex-col selection:bg-neutral-800 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-semibold text-primary-text tracking-tight">
              {mode === "signin" ? "Sign in to AgentForge" : "Create your AgentForge account"}
            </h1>
            <p className="text-xs text-secondary-text">
              {mode === "signin"
                ? "Enter your credentials to access your autonomous workspace."
                : "Get started building and deploying autonomous AI employees."}
            </p>
          </div>

          <Card className="p-6 shadow-elevated">
            {/* Tab switchers */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-secondary-surface rounded mb-6 border border-border">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrors({});
                }}
                className={`py-1.5 text-xs font-medium rounded transition-all select-none ${
                  mode === "signin"
                    ? "bg-surface text-primary-text font-semibold shadow-subtle"
                    : "text-secondary-text hover:text-primary-text"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrors({});
                }}
                className={`py-1.5 text-xs font-medium rounded transition-all select-none ${
                  mode === "signup"
                    ? "bg-surface text-primary-text font-semibold shadow-subtle"
                    : "text-secondary-text hover:text-primary-text"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <Input
                  label="Full Name"
                  placeholder="Jane Baker"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.fullName}
                  required
                />
              )}

              <Input
                label="Email address"
                type="email"
                placeholder="owner@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
              />

              {mode === "signup" && (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  required
                />
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-text">
              <span>By continuing, you agree to AgentForge's Terms of Service and Privacy Policy.</span>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-text">Loading authentication...</div>}>
      <AuthForm />
    </Suspense>
  );
}
