"use client";

import React, { forwardRef } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter, 
  Link as LinkIcon 
} from "lucide-react";

interface PreviewProps {
  data: any;
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ data }, ref) => {
  const { sections, theme } = data;

  // Use a map for quick access but we'll render in section order
  const personalSection = sections.find((s: any) => s.type === "PERSONAL");
  const otherSections = sections.filter((s: any) => s.type !== "PERSONAL");

  if (!personalSection) return null;

  const personal = personalSection.data;

  // Helper to render sections
  const renderSection = (section: any) => {
    switch (section.type) {
      case "SUMMARY":
        if (!section.data.content) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-1" style={{ color: theme.color }}>
              {section.title}
            </h2>
            <p className="text-[10px] leading-relaxed text-slate-600 font-medium whitespace-pre-line">
              {section.data.content}
            </p>
          </section>
        );

      case "LIST":
        const hasContent = section.items.some((i: any) => i.title || i.subtitle);
        if (!hasContent) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1" style={{ color: theme.color }}>
              {section.title}
            </h2>
            <div className="space-y-6">
              {section.items.map((item: any) => (
                (item.title || item.subtitle) && (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-[11px] font-black text-slate-900 uppercase">{item.title}</h3>
                      <span className="text-[9px] font-bold text-slate-400 italic">{item.date}</span>
                    </div>
                    <p className="text-[10px] font-bold mb-2" style={{ color: theme.color }}>{item.subtitle}</p>
                    <p className="text-[9px] leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                )
              ))}
            </div>
          </section>
        );

      case "TAGS":
        const hasTags = section.items.some((t: string) => t);
        if (!hasTags) return null;
        return (
          <section key={section.id} className="mb-8">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1" style={{ color: theme.color }}>
              {section.title}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {section.items.filter((t: string) => t).map((tag: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={ref}
      className="bg-white w-[210mm] min-h-[297mm] p-[15mm] text-[#334155] shadow-sm print:shadow-none print:p-0 transition-all duration-500"
      id="resume-v2-preview"
      style={{ fontFamily: theme.fontFamily }}
    >
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
          #resume-v2-preview {
            width: 100% !important;
            min-height: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Modern Header */}
      <header className="border-b-4 pb-6 mb-8" style={{ borderColor: theme.color }}>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
          {personal.fullName || "Your Full Name"}
        </h1>
        <p className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: theme.color }}>
          {personal.jobTitle || "Your Professional Title"}
        </p>
        
        <div className="flex flex-wrap gap-y-2 gap-x-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {personal.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: theme.color }} />
              {personal.email}
            </div>
          )}
          {personal.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" style={{ color: theme.color }} />
              {personal.phone}
            </div>
          )}
          {personal.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: theme.color }} />
              {personal.location}
            </div>
          )}
          {personal.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" style={{ color: theme.color }} />
              {personal.website.replace(/^https?:\/\//, '')}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="space-y-2">
        {otherSections.map((section: any) => renderSection(section))}
      </div>
    </div>
  );
});

Preview.displayName = "Preview";

export default Preview;
