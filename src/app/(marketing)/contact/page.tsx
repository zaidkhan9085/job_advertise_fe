"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MessageSquare, Send, LifeBuoy, CheckCircle2, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import DecorativeBlur from "@/components/common/DecorativeBlur";
import { useAuth } from "@/context/AuthContext";
import { createSupportMessage, ApiError } from "@/lib/api";

// Replaces the old support@ mailto form (never actually wired to anything)
// with a real submission into the in-app Support inbox admin/sub_admin
// triage from their dashboard. Logged-in only, by deliberate scope choice
// -- a guest sees a log-in prompt instead of the form, same as every other
// support-email reference removed site-wide.
const SUBJECT_OPTIONS = ["Job Seeker Inquiry", "Recruiter Partnership", "Bug Report", "Other"];

export default function ContactPage() {
  const { user, isLoading } = useAuth();
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await createSupportMessage(subject, message.trim());
      toast.success("Message sent — our team will get back to you.");
      setMessage("");
      setSent(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send your message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStaff = user?.role === "admin" || user?.role === "sub_admin";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/10 -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <MessageSquare className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Contact Support</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            How Can We <span className="text-brand-blue-light italic">Help You?</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Whether you&apos;re a recruiter looking for talent or a candidate seeking a dream job, our team is here for you.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container-site">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-brand-blue mb-8">Get In Touch</h2>

            <div className="flex gap-5 p-6 rounded-3xl border border-brand-blue/5 bg-brand-blue-muted/30 group hover:border-brand-blue/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-brand-blue/5">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-brand-blue/40 uppercase tracking-widest mb-1">In-App Support</div>
                <div className="font-bold text-brand-blue">Message our team directly below</div>
              </div>
            </div>

            <div className="flex gap-5 p-6 rounded-3xl border border-brand-blue/5 bg-brand-blue-muted/30 group hover:border-brand-blue/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-brand-blue/5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-brand-blue/40 uppercase tracking-widest mb-1">Working Hours</div>
                <div className="font-bold text-brand-blue">Mon - Fri: 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 p-10 rounded-[40px] border border-brand-blue/15 bg-white shadow-2xl shadow-brand-blue/5">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-brand-blue-muted/30" />
            ) : !user ? (
              <div className="text-center py-10">
                <LogIn className="w-10 h-10 text-brand-blue/40 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-brand-blue mb-3">Log In to Contact Support</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Messaging our support team requires an account, so we can follow up with you directly.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-xl font-black text-sm hover:bg-brand-blue-medium shadow-lg shadow-brand-blue/20 transition-all uppercase tracking-widest"
                >
                  Sign In
                </Link>
              </div>
            ) : isStaff ? (
              <div className="text-center py-10">
                <ShieldCheck className="w-10 h-10 text-brand-blue/40 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-brand-blue mb-3">You&apos;re Signed In as Staff</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  This form is for candidates and employers. Incoming messages are in your Support inbox.
                </p>
                <Link
                  href="/dashboard/admin/support"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white rounded-xl font-black text-sm hover:bg-brand-blue-medium shadow-lg shadow-brand-blue/20 transition-all uppercase tracking-widest"
                >
                  Go to Support Inbox
                </Link>
              </div>
            ) : sent ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-brand-blue mb-3">Message Sent</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Our team will review it and follow up if needed.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue-muted/50 text-brand-blue rounded-xl font-black text-sm hover:bg-brand-blue-muted transition-all uppercase tracking-widest"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-brand-blue mb-8 leading-tight">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-brand-blue uppercase tracking-widest">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-brand-blue-muted/30 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all outline-none font-medium appearance-none"
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-brand-blue uppercase tracking-widest">Your Message</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help..."
                      className="w-full px-5 py-4 rounded-xl bg-brand-blue-muted/30 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all outline-none font-medium resize-none"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || !message.trim()}
                      className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-brand-blue text-white rounded-xl font-black text-sm hover:bg-brand-blue-medium shadow-lg shadow-brand-blue/20 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"} <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
