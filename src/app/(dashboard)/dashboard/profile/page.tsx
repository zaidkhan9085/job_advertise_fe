"use client";

import { useState } from "react";
import { mockCompanyProfile } from "@/data/company";
import { Building, Globe, MapPin, Mail, Phone, Users, Save } from "lucide-react";

export default function CompanyProfilePage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your company information and branding.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Logo Section */}
            <div className="w-full sm:w-48 shrink-0 flex flex-col gap-3">
              <label className="text-sm font-semibold text-foreground">Company Logo</label>
              <div className="aspect-square w-full sm:w-40 rounded-2xl border-2 border-dashed border-border/80 bg-secondary flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer group">
                <img 
                  src={mockCompanyProfile.logoUrl} 
                  alt="Company Logo" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Recommended size: 400x400px. JPG, PNG.
              </p>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-5 w-full">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Company Name <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                  <input 
                    type="text" 
                    defaultValue={mockCompanyProfile.name}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Industry <span className="text-rose-500">*</span></label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all">
                    <option value="Construction & Engineering">Construction & Engineering</option>
                    <option value="Oil & Gas">Oil & Gas</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Company Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                    <select className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all">
                      <option value="1-50">1-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1000-5000" selected>1000-5000 employees</option>
                      <option value="5000+">5000+ employees</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Detailed Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5 min-w-0">
              <label className="text-sm font-semibold text-foreground">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                <input 
                  type="email" 
                  defaultValue={mockCompanyProfile.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 min-w-0">
              <label className="text-sm font-semibold text-foreground">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                <input 
                  type="tel" 
                  defaultValue={mockCompanyProfile.phone}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className="text-sm font-semibold text-foreground">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                <input 
                  type="url" 
                  defaultValue={mockCompanyProfile.website}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <label className="text-sm font-semibold text-foreground">Headquarters Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/60" />
                <input 
                  type="text" 
                  defaultValue={mockCompanyProfile.location}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Company Description</label>
            <textarea 
              rows={5}
              defaultValue={mockCompanyProfile.description}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-[oklch(0.68_0.21_45)] outline-none transition-all resize-y"
              placeholder="Describe your company, benefits, and workplace culture..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button 
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[oklch(0.68_0.21_45)] text-white hover:bg-[oklch(0.55_0.22_45)] px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-70 shadow-sm"
            >
              {isSaving ? "Saving..." : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
