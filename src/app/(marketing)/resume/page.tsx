"use client";

import { useState } from "react";
import { 
  Upload, 
  CheckCircle2, 
  ChevronDown, 
  Mail, 
  MapPin, 
  Briefcase, 
  MessageSquare,
  FileIcon
} from "lucide-react";
import { industries } from "@/data/industries";

const countryCodes = [
  { code: "+971", label: "UAE", flag: "🇦🇪" },
  { code: "+91", label: "IND", flag: "🇮🇳" },
  { code: "+966", label: "KSA", flag: "🇸🇦" },
  { code: "+974", label: "QAT", flag: "🇶🇦" },
  { code: "+965", label: "KWT", flag: "🇰🇼" },
  { code: "+968", label: "OMN", flag: "🇴🇲" },
  { code: "+973", label: "BAH", flag: "🇧🇭" },
  { code: "+44", label: "UK", flag: "🇬🇧" },
  { code: "+1", label: "USA", flag: "🇺🇸" },
];

export default function PostResumePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
            onClick={() => {
              setIsSubmitted(false);
              setSelectedFile(null);
            }}
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
            <span className="w-2 h-2 rounded-full bg-brand-blue-light animate-pulse" />
            <span className="text-white/90 text-sm font-bold uppercase tracking-widest">Global Talent Pool</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Submit Your <span className="text-brand-blue-light italic">Resume</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Join 2.4 million+ professionals. Upload your resume and let your dream job find you.
          </p>
        </div>
      </div>

      <div className="container-site px-4 -mt-20 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-border/60 overflow-hidden overflow-visible">
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Select Industry */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-blue" />
                    Select Industry *
                  </label>
                  <div className="relative group">
                    <select 
                      required 
                      className="w-full pl-5 pr-12 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                    >
                      <option value="">Select your industry</option>
                      {industries.map(ind => (
                        <option key={ind.id} value={ind.id}>{ind.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-focus-within:text-brand-blue transition-colors" />
                  </div>
                </div>

                {/* WhatsApp with Country Code */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-blue" />
                    WhatsApp No *
                  </label>
                  <div className="flex gap-2">
                    <div className="w-1/3 relative group">
                      <select 
                        required 
                        className="w-full pl-4 pr-10 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer text-sm"
                      >
                        {countryCodes.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-focus-within:text-brand-blue" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="WhatsApp Number"
                      className="w-2/3 px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Email ID */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-blue" />
                    Email Id *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@mail.com"
                    className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
                  />
                </div>

                {/* Current & Preferred Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-blue" />
                      Current Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai, India"
                      className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-blue" />
                      Preferred Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dubai, UAE"
                      className="w-full px-5 py-4 rounded-2xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-brand-blue" />
                    Resume Upload (PDF / DOC) *
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-5 py-12 rounded-2xl bg-brand-blue/5 border-2 border-dashed border-brand-blue/20 group-hover:bg-brand-blue/10 group-hover:border-brand-blue/40 transition-all text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-brand-blue" />
                      </div>
                      <p className="text-base font-black text-brand-blue">
                        {selectedFile ? selectedFile.name : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-brand-blue text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-brand-blue/20 hover:bg-brand-blue-medium hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    Submit Resume
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground mt-4 font-medium uppercase tracking-wider">
                    Secure & Confidential • Free for candidates
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
