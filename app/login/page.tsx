"use client";

import React, { useState } from "react";
import { Mail, Lock, LogIn, Plus, ShieldCheck, CheckCircle2, User, Users, ArrowRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState("Super Admin");
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (!email || !password) {
        setError("Please fill in all fields.");
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        const correctEmail = 
          loginRole === "Super Admin" ? "superadmin@example.com" :
          loginRole === "Admin" ? "admin@example.com" :
          "user@example.com";
        
        const isCorrectEmail = 
          loginRole === "Users"
            ? (email.toLowerCase() === "user@example.com" || email.toLowerCase() === "users@example.com")
            : email.toLowerCase() === correctEmail;

        if (isCorrectEmail && password === "Password123") {
          localStorage.setItem("userRole", loginRole);
          router.push("/");
        } else {
          setError(`Invalid credentials. Try ${correctEmail} / Password123`);
        }
      }, 1500);
    } else {
      if (!fullName || !email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      if (!validatePassword(password)) {
        setError("Password does not meet requirements.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setIsLoading(true);
      
      setTimeout(() => {
        setIsLoading(false);
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setFullName("");
        setConfirmPassword("");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans text-slate-800 relative overflow-hidden">
      {/* Background decorations for a premium feel */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      
      {/* Left Side - Welcome Area */}
      <div className="relative w-full md:w-1/2 p-10 lg:p-20 flex flex-col justify-center min-h-[40vh] md:min-h-screen">
        <div className="max-w-md mx-auto md:mx-0 md:ml-auto md:mr-12 lg:mr-20">
          {/* Logo/Icon Container - Go Back */}
          <button 
            type="button"
            onClick={() => {
              if (!isLogin) {
                setIsLogin(true);
                setError("");
                setPassword("");
                setConfirmPassword("");
              } else {
                router.back();
              }
            }}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 transition-all cursor-pointer block text-left"
            title="Go Back"
          >
            <LogIn size={26} className="translate-x-[1px] mx-auto" />
          </button>
          
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            {isLogin ? "Welcome back" : "Secure Documents"}
          </h1>
          <p className="text-slate-500 text-base mb-10">
            {isLogin 
              ? "Your document platform awaits. Sign in to continue." 
              : "Set up your secure credentials to get started with DocFlow AI."
            }
          </p>

          {/* Bullet Points */}
          <div className="space-y-4">
            {isLogin ? (
              [
                "Access all your templates",
                "Generate custom documents",
                "Track your workflow"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100/40">
                    <Plus size={14} strokeWidth={3} />
                  </div>
                  <span className="text-slate-700 font-medium text-sm lg:text-base">{text}</span>
                </div>
              ))
            ) : (
              [
                "Strict, robust validation logic",
                "Role-based access controls",
                "Automated template workflows"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100/40">
                    <ShieldCheck size={14} strokeWidth={2.5} />
                  </div>
                  <span className="text-slate-700 font-medium text-sm lg:text-base">{text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full md:w-1/2 p-6 lg:p-12 flex flex-col justify-center relative md:min-h-screen">
        {/* Main Login Card (White Box) */}
        <div className="w-full max-w-md mx-auto bg-white p-8 lg:p-10 rounded-[2rem] shadow-xl border border-slate-100/80">
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
              {isLogin ? "Sign in" : "Create account"}
            </h2>
            <p className="text-slate-400 text-sm">
              {isLogin ? "Enter your credentials to access DocFlow AI" : "Register to get started with DocFlow AI"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Tabs - Only on Login */}
            {isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Login as</label>
                <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 mb-4">
                  {["Super Admin", "Admin", "Users"].map((r) => {
                    const isActive = loginRole === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setLoginRole(r)}
                        className={`flex-1 py-2 px-1.5 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          isActive
                            ? "bg-white text-blue-600 shadow-sm border border-slate-200/30"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {r === "Super Admin" && <ShieldCheck size={14} />}
                        {r === "Admin" && <Shield size={14} />}
                        {r === "Users" && <Users size={14} />}
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Name - Only on Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl py-3 pl-11 pr-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email address */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email address</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl py-3 pl-11 pr-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <span className="text-[10px] text-slate-400 font-medium">Use the seeded demo accounts below</span>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="password123"
                  className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl py-3 pl-11 pr-16 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Password Guidelines - Only on Register */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mt-2 px-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={10} className={password.length >= 8 ? "text-emerald-500" : ""} /> At least 8 characters
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={10} className={/[A-Z]/.test(password) ? "text-emerald-500" : ""} /> One uppercase letter
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={10} className={/[a-z]/.test(password) ? "text-emerald-500" : ""} /> One lowercase letter
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={10} className={/[0-9]/.test(password) ? "text-emerald-500" : ""} /> One number
                </div>
              </div>
            )}

            {/* Confirm Password - Only on Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Confirm password</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl py-3 pl-11 pr-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}</span>
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </div>

            {/* Switch Link - Conditional based on selected role in Login view */}
            {isLogin ? (
              loginRole === "Users" && (
                <div className="text-center mt-6">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsLogin(false);
                        setError("");
                        setPassword("");
                        setConfirmPassword("");
                      }} 
                      className="text-blue-500 font-semibold hover:underline"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              )
            ) : (
              <div className="text-center mt-6">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsLogin(true);
                      setError("");
                      setPassword("");
                      setConfirmPassword("");
                    }} 
                    className="text-blue-500 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}

            {/* Demo Credentials Box - Only on Login */}
            {isLogin && (
              <div className="mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-500">
                <p className="text-[10px] font-bold text-slate-400 mb-2 tracking-wider">DEMO CREDENTIALS</p>
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold text-slate-600">Super Admin:</span> superadmin@example.com / Password123</p>
                  <p><span className="font-semibold text-slate-600">Admin:</span> admin@example.com / Password123</p>
                  <p><span className="font-semibold text-slate-600">Users:</span> user@example.com / Password123</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
