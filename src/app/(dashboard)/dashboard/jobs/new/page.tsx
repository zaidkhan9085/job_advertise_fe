"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Briefcase, MapPin, Building, Target, Save, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PostJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setIsSubmitting(true);
    // Mock save & redirect
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard/jobs");
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header & Back */}
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Post a New Job</h1>
          <p className="text-muted-foreground mt-1 text-sm">Fill out the details below to publish a new vacancy.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Main Form Area */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          
          {/* Progress Steps Header */}
          <div className="flex items-center px-6 sm:px-8 py-5 border-b border-border/60 bg-muted/10 overflow-x-auto">
            <div className={`flex items-center gap-2 font-semibold text-sm whitespace-nowrap ${currentStep >= 1 ? "text-[oklch(0.68_0.21_45)]" : "text-muted-foreground"}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs text-white ${currentStep >= 1 ? "bg-[oklch(0.68_0.21_45)]" : "bg-border"}`}>1</span>
              Basic Details
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-3 shrink-0" />
            
            <div className={`flex items-center gap-2 font-semibold text-sm whitespace-nowrap ${currentStep >= 2 ? "text-[oklch(0.68_0.21_45)]" : "text-muted-foreground"}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs text-white ${currentStep >= 2 ? "bg-[oklch(0.68_0.21_45)]" : "bg-border"}`}>2</span>
              Job Description
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-3 shrink-0" />
            
            <div className={`flex items-center gap-2 font-semibold text-sm whitespace-nowrap ${currentStep >= 3 ? "text-[oklch(0.68_0.21_45)]" : "text-muted-foreground"}`}>
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs text-white ${currentStep >= 3 ? "bg-[oklch(0.68_0.21_45)]" : "bg-border"}`}>3</span>
              Visibility & Publishing
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {/* STEP 1: Basic Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Job Title <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                    <input 
                      type="text" 
                      placeholder="e.g. Senior Site Engineer"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Company Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                      <input 
                        type="text" 
                        defaultValue="Global Construction Co."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Location <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                      <input 
                        type="text" 
                        placeholder="e.g. Dubai, UAE"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Job Type <span className="text-rose-500">*</span></label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Temporary</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Workplace Type</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all">
                      <option>On-site</option>
                      <option>Hybrid</option>
                      <option>Remote</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Experience Level</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all">
                      <option>Entry Level</option>
                      <option>Mid-Senior Level</option>
                      <option>Director</option>
                      <option>Executive</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Category/Industry <span className="text-rose-500">*</span></label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all">
                      <option>Construction</option>
                      <option>Oil & Gas</option>
                      <option>IT & Software</option>
                      <option>Healthcare</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Salary Range (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 font-semibold text-muted-foreground/60">$</span>
                      <input 
                        type="text" 
                        placeholder="e.g. 5,000 - 8,000 AED"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Job Description */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Job Summary <span className="text-rose-500">*</span></label>
                  <textarea 
                    rows={4}
                    placeholder="Provide a brief overview of the role and what the candidate will be doing..."
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all resize-y"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Key Responsibilities <span className="text-rose-500">*</span></label>
                  <textarea 
                    rows={5}
                    placeholder="List the main duties (one per line)...&#10;- Manage daily site operations&#10;- Communicate with subcontractors"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all resize-y font-mono text-sm leading-relaxed"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">We will automatically format these into a bulleted list.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Requirements & Qualifications <span className="text-rose-500">*</span></label>
                  <textarea 
                    rows={5}
                    placeholder="List the requirements (one per line)...&#10;- 5+ years experience in construction&#10;- B.Sc in Civil Engineering"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all resize-y font-mono text-sm leading-relaxed"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Benefits & Perks</label>
                  <textarea 
                    rows={4}
                    placeholder="List perks like Free Food, Accommodation, Transport (one per line)..."
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all resize-y font-mono text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Visibility & Publish */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                
                <div className="p-4 bg-[oklch(0.47_0.20_250)]/5 border border-[oklch(0.47_0.20_250)]/20 rounded-xl space-y-3">
                  <h3 className="font-bold text-[oklch(0.47_0.20_250)] flex items-center gap-2">
                    <Target className="w-5 h-5" /> Maximize Your Reach
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Make your job listing stand out with our premium tags. Jobs with badges get <strong>5x more views</strong> on average.
                  </p>
                  
                  <div className="space-y-2 mt-4">
                    <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border/60 hover:border-[oklch(0.47_0.20_250)] transition-colors cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 rounded text-[oklch(0.68_0.21_45)] focus:ring-[oklch(0.68_0.21_45)]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Feature as Premium</span>
                          <span className="text-[10px] font-bold bg-[oklch(0.68_0.21_45)] text-white px-2 py-0.5 rounded uppercase tracking-wider">Premium</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Pins your job to the top of category pages for 14 days.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border/60 hover:border-[oklch(0.47_0.20_250)] transition-colors cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">Mark as Urgent Hiring</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Adds a highlighted urgent visual indicator on search pages.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Contact Email or Apply URL <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Where should candidates send applications?"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Applications inside the platform are always active by default.</p>
                </div>

              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2.5 rounded-xl font-semibold border border-input text-foreground hover:bg-secondary transition-colors"
                >
                  Previous
                </button>
              ) : <div></div>}
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-[oklch(0.68_0.21_45)] text-white hover:bg-[oklch(0.55_0.22_45)] px-8 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-70 shadow-sm"
              >
                {isSubmitting ? (
                  "Publishing..."
                ) : currentStep === 3 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Publish Job
                  </>
                ) : (
                  <>
                    Next Step <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Sidebar */}
        <div className="w-full lg:w-80 shrink-0 sticky top-24 space-y-4">
          <div className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-[oklch(0.47_0.20_250)]" /> Live Preview
          </div>
          <div className="bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)] p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-12 h-12 bg-secondary rounded-lg mb-3 flex items-center justify-center">
              <Building className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <h3 className="font-bold text-sm text-muted-foreground/50 mb-1">Company Name</h3>
            <h2 className="font-bold text-lg text-foreground mb-3 leading-tight">Job Title Preview</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex text-[10px] font-bold uppercase py-0.5 px-2 bg-secondary text-muted-foreground rounded-md">Full-time</span>
              <span className="inline-flex text-[10px] font-bold uppercase py-0.5 px-2 bg-secondary text-muted-foreground rounded-md">Location</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full mb-2"></div>
            <div className="h-2 w-3/4 bg-secondary rounded-full"></div>
            <div className="mt-5 w-full py-2 rounded-lg bg-secondary text-center text-xs font-bold text-muted-foreground/50 border border-border/40">
              Apply Now Button
            </div>
          </div>
          <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-xl border border-blue-100 leading-relaxed shadow-sm">
            <span className="font-bold">Tip:</span> Descriptive job titles and clear requirements help you attract the highly skilled candidates you are looking for.
          </div>
        </div>

      </div>
    </div>
  );
}

// Temporary import fixes for icons
import { Eye } from "lucide-react";
