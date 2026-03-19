"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, User, Briefcase, Building, CheckCircle2, Phone, MapPin } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"Candidate" | "Recruiter">("Candidate");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock submit
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border/60 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Create an Account</h1>
          <p className="text-sm text-muted-foreground">
            Join The Jobs Advertise to find your next opportunity or hire top talent.
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("Candidate")}
            className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              role === "Candidate" 
                ? "border-[oklch(0.47_0.20_250)] bg-[oklch(0.47_0.20_250)]/5 text-[oklch(0.47_0.20_250)]" 
                : "border-border/60 hover:border-border text-muted-foreground"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-sm font-semibold">Job Seeker</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("Recruiter")}
            className={`flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              role === "Recruiter" 
                ? "border-brand-blue bg-brand-blue/5 text-brand-blue" 
                : "border-border/60 hover:border-border text-muted-foreground"
            }`}
          >
            <Briefcase className="w-6 h-6" />
            <span className="text-sm font-semibold">Recruiter</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
              <input 
                type="text" 
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
              <input 
                type="email" 
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                required
              />
            </div>
          </div>

          {role === "Candidate" && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Position</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                  <input 
                    type="text" 
                    placeholder="Software Engineer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                  <input 
                    type="text" 
                    placeholder="New York, NY"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {role === "Recruiter" && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                  <input 
                    type="text" 
                    placeholder="Acme Corp"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                  <input 
                    type="text" 
                    placeholder="London, UK"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white hover:bg-brand-blue-medium py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-70 mt-2"
          >
            {isLoading ? "Creating account..." : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-semibold text-[oklch(0.47_0.20_250)] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
