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

interface BuilderPreviewProps {
  data: any;
}

const BuilderPreview = forwardRef<HTMLDivElement, BuilderPreviewProps>(({ data }, ref) => {
  const { personal, summary, experience, education, skills, certifications, projects, languages, socials } = data;

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return <Linkedin className="w-3 h-3" />;
      case 'github': return <Github className="w-3 h-3" />;
      case 'twitter': return <Twitter className="w-3 h-3" />;
      default: return <LinkIcon className="w-3 h-3" />;
    }
  };

  return (
    <div 
      ref={ref}
      className="bg-white w-[210mm] min-h-[297mm] p-[15mm] text-[#334155] font-sans shadow-sm print:shadow-none print:p-0"
      id="resume-preview-root"
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
          #resume-preview-root {
            width: 100% !important;
            min-height: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Header Section */}
      <header className="border-b-4 border-brand-blue pb-6 mb-8">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
          {personal.fullName || "Your Full Name"}
        </h1>
        <p className="text-xl font-bold text-brand-blue uppercase tracking-widest mb-4">
          {personal.jobTitle || "Your Professional Title"}
        </p>
        
        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm font-medium text-slate-500">
          {personal.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-blue" />
              {personal.email}
            </div>
          )}
          {personal.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-blue" />
              {personal.phone}
            </div>
          )}
          {personal.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-blue" />
              {personal.location}
            </div>
          )}
          {personal.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-blue" />
              {personal.website.replace(/^https?:\/\//, '')}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-10">
        
        {/* Left Column (2/3) */}
        <div className="col-span-2 space-y-8">
          
          {/* Summary */}
          {summary && (
            <section>
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-1">
                Professional Summary
              </h2>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                {summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && experience.some((e: any) => e.company || e.position) && (
            <section>
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1">
                Work Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp: any) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xs font-black text-slate-900 uppercase">{exp.position || "Position Title"}</h3>
                      <span className="text-[10px] font-bold text-slate-400 italic">{exp.date}</span>
                    </div>
                    <p className="text-[11px] font-bold text-brand-blue mb-2">{exp.company || "Company Name"}</p>
                    <p className="text-[10px] leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length>0 && projects.some((p:any) => p.name) && (
            <section>
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1">
                Projects
              </h2>
              <div className="space-y-4">
                {projects.map((proj: any) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-xs font-black text-slate-900 uppercase">{proj.name}</h3>
                      {proj.link && <span className="text-[9px] font-bold text-brand-blue underline">{proj.link.replace(/^https?:\/\//, '')}</span>}
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-600 font-medium">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
          
          {/* Skills */}
          {skills.length > 0 && skills.some((s: string) => s) && (
            <section>
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1">
                Core Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.filter((s: string) => s).map((skill: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded uppercase tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && education.some((e: any) => e.school || e.degree) && (
            <section>
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu: any) => (
                  <div key={edu.id}>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase leading-snug">{edu.degree}</h3>
                    <p className="text-[10px] font-bold text-brand-blue mb-0.5">{edu.school}</p>
                    <p className="text-[9px] font-bold text-slate-400 italic">{edu.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && certifications.some((c: string) => c) && (
            <section>
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1">
                Certifications
              </h2>
              <ul className="space-y-1.5">
                {certifications.filter((c: string) => c).map((cert: string, idx: number) => (
                  <li key={idx} className="text-[10px] font-bold text-slate-600 flex gap-2 items-start">
                    <span className="text-brand-blue mt-1">•</span> {cert}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && languages.some((l: string) => l) && (
            <section>
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1">
                Languages
              </h2>
              <div className="space-y-1">
                {languages.filter((l: string) => l).map((lang: string, idx: number) => (
                  <p key={idx} className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                    {lang}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Socials */}
          {socials.length > 0 && socials.some((s: any) => s.url) && (
            <section>
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-1">
                Social Profiles
              </h2>
              <div className="space-y-2">
                {socials.filter((s: any) => s.url).map((social: any) => (
                  <div key={social.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <div className="w-5 h-5 rounded bg-brand-blue/5 text-brand-blue flex items-center justify-center">
                      {getSocialIcon(social.platform)}
                    </div>
                    {social.url.replace(/^https?:\/\//, '')}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
});

BuilderPreview.displayName = "BuilderPreview";

export default BuilderPreview;
