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
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Check,
  X,
  KeyRound,
  RotateCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";

type AuthMode = "signin" | "signup" | "verify_otp" | "forgot_password" | "reset_password";

interface PasswordValidation {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  score: number; // 0 - 5
  isValid: boolean;
}

function evaluatePassword(pwd: string): PasswordValidation {
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':",.<>?/\\|`~]/.test(pwd);

  const checks = [hasMinLength, hasUpper, hasLower, hasNumber, hasSymbol];
  const score = checks.filter(Boolean).length;

  return {
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    score,
    isValid: score === 5,
  };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;

  const { hasMinLength, hasUpper, hasLower, hasNumber, hasSymbol, score, isValid } =
    evaluatePassword(password);

  const requirements = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "One uppercase letter (A-Z)", met: hasUpper },
    { label: "One lowercase letter (a-z)", met: hasLower },
    { label: "One number (0-9)", met: hasNumber },
    { label: "One special character (!@#$%...)", met: hasSymbol },
  ];

  const getStrengthLabel = () => {
    if (score <= 2) return { label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    if (score <= 4) return { label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    return { label: "Strong & Secure", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getStrengthLabel();

  return (
    <div className="p-3 bg-secondary-surface rounded-lg border border-border space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-secondary-text font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-secondary-text" /> Password Strength:
        </span>
        <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-5 gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              level <= score ? strength.color : "bg-neutral-800"
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            )}
            <span className={req.met ? "text-primary-text font-medium" : "text-muted-text"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/onboarding";

  const { login, register, verifySignupOtp, forgotPassword, resetPassword } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [unverifiedNotice, setUnverifiedNotice] = useState<string | null>(null);

  // Switch between tabs
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setUnverifiedNotice(null);
  };

  // Sign In submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
      toast("Signed in successfully!", "success");
      router.push(redirectUrl);
    } catch (err: any) {
      const msg = err.message || "Failed to sign in";
      if (msg.toLowerCase().includes("not verified") || msg.toLowerCase().includes("activation code")) {
        setUnverifiedNotice(msg);
        toast("Account unverified. 6-digit OTP sent to your email!", "info");
        setMode("verify_otp");
      } else {
        toast(msg, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Enter a valid email address";
    }

    const { isValid } = evaluatePassword(password);
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isValid) {
      newErrors.password = "Please create a strong password matching all criteria below";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await register(fullName, email, password, confirmPassword);
      toast(res.message || "Verification code sent to your email!", "success");
      setMode("verify_otp");
    } catch (err: any) {
      toast(err.message || "Registration failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Sign Up OTP submit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      setErrors({ otp: "Please enter the complete 6-digit verification code" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await verifySignupOtp(email, cleanOtp);
      toast("Account verified and signed in successfully!", "success");
      router.push(redirectUrl);
    } catch (err: any) {
      toast(err.message || "Invalid or expired verification code", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Sign Up OTP
  const handleResendOtp = async () => {
    if (!email.trim()) {
      toast("Please enter your email to resend code", "error");
      return;
    }
    setIsResending(true);
    try {
      await register(fullName || "User", email, password || "StrongPass!123", password || "StrongPass!123");
      toast("A new 6-digit verification code has been sent to your email!", "success");
    } catch (err: any) {
      toast(err.message || "Could not resend code. Please try again.", "error");
    } finally {
      setIsResending(false);
    }
  };

  // Forgot Password submit (request OTP)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const msg = await forgotPassword(email);
      toast(msg || "Password reset code sent to your email!", "success");
      setMode("reset_password");
    } catch (err: any) {
      toast(err.message || "Failed to request password reset code", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password submit (verify OTP & set new password)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      newErrors.otp = "Please enter the 6-digit reset code sent to your email";
    }

    const { isValid } = evaluatePassword(password);
    if (!password) {
      newErrors.password = "New password is required";
    } else if (!isValid) {
      newErrors.password = "Please create a strong password matching all criteria below";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await resetPassword(email, cleanOtp, password, confirmPassword);
      toast("Password successfully reset! You are now signed in.", "success");
      router.push(redirectUrl);
    } catch (err: any) {
      toast(err.message || "Failed to reset password. Please check code.", "error");
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
              {mode === "signin" && "Sign in to AgentForge"}
              {mode === "signup" && "Create your AgentForge account"}
              {mode === "verify_otp" && "Verify your email"}
              {mode === "forgot_password" && "Reset your password"}
              {mode === "reset_password" && "Create new password"}
            </h1>
            <p className="text-xs text-secondary-text">
              {mode === "signin" && "Enter your credentials to access your autonomous workspace."}
              {mode === "signup" && "Deploy autonomous AI employees for your business in minutes."}
              {mode === "verify_otp" && `Enter the 6-digit verification code sent to ${email || "your email"}.`}
              {mode === "forgot_password" && "We'll send a 6-digit OTP to your registered email to reset your password."}
              {mode === "reset_password" && `Enter the 6-digit code sent to ${email} and choose a new password.`}
            </p>
          </div>

          <Card className="p-6 shadow-elevated border border-border">
            {/* Tab switchers only on signin/signup */}
            {(mode === "signin" || mode === "signup") && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-secondary-surface rounded mb-6 border border-border">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
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
                  onClick={() => switchMode("signup")}
                  className={`py-1.5 text-xs font-medium rounded transition-all select-none ${
                    mode === "signup"
                      ? "bg-surface text-primary-text font-semibold shadow-subtle"
                      : "text-secondary-text hover:text-primary-text"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Notification alert if unverified */}
            {unverifiedNotice && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{unverifiedNotice}</span>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="owner@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />

                <div className="space-y-1">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    required
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot_password")}
                      className="text-xs text-secondary-text hover:text-primary-text hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            )}

            {/* 2. SIGN UP FORM */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Jane Baker"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.fullName}
                  required
                />

                <Input
                  label="Email address"
                  type="email"
                  placeholder="owner@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    required
                  />
                  <div className="mt-2.5">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  required
                />

                {confirmPassword && password && (
                  <div className="text-[11px] flex items-center gap-1.5 font-medium">
                    {password === confirmPassword ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    <span>Create Account & Send Code</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            )}

            {/* 3. VERIFY SIGNUP OTP FORM */}
            {mode === "verify_otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex justify-center my-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs text-secondary-text">
                    We sent an activation OTP to:
                  </p>
                  <p className="text-xs font-semibold text-primary-text bg-secondary-surface py-1 px-2 rounded inline-block">
                    {email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5 text-center">
                    Enter 6-digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOtpCode(val);
                    }}
                    className="w-full h-12 text-center text-2xl font-mono tracking-[0.4em] rounded bg-surface border border-border text-primary-text focus:outline-none focus:border-primary-text focus:ring-1 focus:ring-primary-text/20"
                  />
                  {errors.otp && (
                    <p className="text-xs text-rose-500 text-center mt-1.5 font-medium">
                      {errors.otp}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  <span>Activate Account & Sign In</span>
                </Button>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-secondary-text hover:text-primary-text flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                    <span>{isResending ? "Sending code..." : "Resend code"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="text-secondary-text hover:text-primary-text transition-colors"
                  >
                    Change email
                  </button>
                </div>
              </form>
            )}

            {/* 4. FORGOT PASSWORD FORM */}
            {mode === "forgot_password" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="flex justify-center my-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-secondary-text">
                    <KeyRound className="w-6 h-6" />
                  </div>
                </div>

                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="owner@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    <span>Send 6-Digit Reset Code</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>

                <div className="pt-3 text-center border-t border-border">
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="text-xs text-secondary-text hover:text-primary-text inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {/* 5. RESET PASSWORD FORM */}
            {mode === "reset_password" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center space-y-1 mb-2">
                  <p className="text-xs text-secondary-text">
                    Resetting password for:
                  </p>
                  <p className="text-xs font-semibold text-primary-text bg-secondary-surface py-1 px-2 rounded inline-block">
                    {email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-text mb-1.5 text-center">
                    Enter 6-digit Reset Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOtpCode(val);
                    }}
                    className="w-full h-11 text-center text-xl font-mono tracking-[0.3em] rounded bg-surface border border-border text-primary-text focus:outline-none focus:border-primary-text focus:ring-1 focus:ring-primary-text/20"
                  />
                  {errors.otp && (
                    <p className="text-xs text-rose-500 text-center mt-1 font-medium">
                      {errors.otp}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    required
                  />
                  <div className="mt-2.5">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                </div>

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  required
                />

                {confirmPassword && password && (
                  <div className="text-[11px] flex items-center gap-1.5 font-medium">
                    {password === confirmPassword ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    <span>Update Password & Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>

                <div className="pt-3 text-center border-t border-border">
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="text-xs text-secondary-text hover:text-primary-text inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-border text-center text-[11px] text-muted-text">
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
