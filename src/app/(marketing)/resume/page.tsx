"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function PostResumePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-3xl border border-border/60 shadow-xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Resume Received!</h1>
          <p className="text-muted-foreground text-lg">
            Your profile has been successfully uploaded to our global candidate database. Recruiters can now discover your expertise.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-[oklch(0.47_0.20_250)] text-white font-bold py-4 rounded-2xl hover:bg-[oklch(0.35_0.20_250)] transition-all shadow-md active:scale-[0.98]"
          >
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-[oklch(0.12_0.02_260)] text-white pt-16 pb-32 md:pt-20 md:pb-40 border-b border-border/20">
        <div className="container-site px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="text-white/90 text-sm font-bold uppercase tracking-widest">Global Talent Pool</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Get Hired by <span className="text-brand-orange">Top Employers</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Join 2.4 million+ professionals. Upload your resume and let your dream job in Gulf or Europe find you.
          </p>
        </div>
      </div>

      <div className="container-site px-4 -mt-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-2xl border border-border/60 overflow-hidden">
              <div className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal info */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                      <span className="w-8 h-8 rounded-lg bg-[oklch(0.47_0.20_250)]/10 text-[oklch(0.47_0.20_250)] flex items-center justify-center text-sm">1</span>
                      Personal Information
                    </h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80 ml-1">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-5 py-4 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-[oklch(0.47_0.20_250)] focus:bg-white transition-all outline-none font-medium" 
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80 ml-1">Date of Birth *</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-5 py-4 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-[oklch(0.47_0.20_250)] focus:bg-white transition-all outline-none font-medium" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80 ml-1">WhatsApp Number *</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">+91</span>
                        <input 
                          type="tel" 
                          required
                          className="w-full pl-16 pr-5 py-4 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-[oklch(0.47_0.20_250)] focus:bg-white transition-all outline-none font-medium" 
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80 ml-1">Email Address *</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-5 py-4 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-[oklch(0.47_0.20_250)] focus:bg-white transition-all outline-none font-medium" 
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Career info */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                      <span className="w-8 h-8 rounded-lg bg-[oklch(0.68_0.21_45)]/10 text-[oklch(0.68_0.21_45)] flex items-center justify-center text-sm">2</span>
                      Career Preferences
                    </h3>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80 ml-1">Preferred Location *</label>
                      <select required className="w-full px-5 py-4 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-[oklch(0.47_0.20_250)] focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer">
                        <option value="">Select Destination</option>
                        <option>Dubai, UAE</option>
                        <option>Saudi Arabia</option>
                        <option>Qatar</option>
                        <option>Europe</option>
                        <option>Anywhere</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80 ml-1">Current Industry *</label>
                      <select required className="w-full px-5 py-4 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-[oklch(0.47_0.20_250)] focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer">
                        <option value="">Select Industry</option>
                        <option>Oil & Gas</option>
                        <option>Construction</option>
                        <option>IT & Software</option>
                        <option>Healthcare</option>
                        <option>Hospitality</option>
                      </select>
                    </div>
                    
                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80 ml-1">Upload Resume (PDF/DOC) *</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          required
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full px-5 py-10 rounded-2xl bg-[oklch(0.47_0.20_250)]/5 border-2 border-dashed border-[oklch(0.47_0.20_250)]/20 group-hover:bg-[oklch(0.47_0.20_250)]/10 group-hover:border-[oklch(0.47_0.20_250)]/40 transition-all text-center">
                          <Upload className="w-8 h-8 text-[oklch(0.47_0.20_250)] mx-auto mb-3" />
                          <p className="text-sm font-bold text-[oklch(0.47_0.20_250)]">Drop your file here or click to browse</p>
                          <p className="text-xs text-muted-foreground mt-2">Max file size: 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-6">
                    <button 
                      type="submit"
                      className="w-full bg-[oklch(0.47_0.20_250)] text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-[oklch(0.47_0.20_250)]/20 hover:bg-[oklch(0.35_0.20_250)] hover:-translate-y-1 transition-all active:scale-[0.98]"
                    >
                      Submit Your Resume
                    </button>
                    <p className="text-center text-xs text-muted-foreground mt-4 font-medium italic">
                      By submitting, you agree to our Terms of Service & Privacy Policy.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar / Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-border/60 shadow-lg">
              <h3 className="font-extrabold text-xl mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-orange" />
                Why Post Your CV?
              </h3>
              <ul className="space-y-6">
                {[
                  { title: "Direct Exposure", desc: "Your CV is visible to 12,000+ verified recruiters globally.", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
                  { title: "Smart Matching", desc: "Our AI matches your profile with high-paying job vacancies.", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
                  { title: "Instant Alerts", desc: "Get notified as soon as a company views your profile.", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> }
                ].map(item => (
                  <li key={item.title} className="flex gap-4">
                    <div className="mt-1 shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-foreground text-base mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-50 p-8 rounded-3xl border border-orange-200">
              <h3 className="font-extrabold text-orange-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-brand-orange" />
                Safety First
              </h3>
              <p className="text-sm text-orange-800 leading-relaxed font-medium">
                We never ask for payment for job applications. Beware of fraudulent recruitment agencies. Always verify the company before sharing sensitive information.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
