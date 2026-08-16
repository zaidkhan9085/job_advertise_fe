"use client";

import { 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Award, 
  Layers, 
  Languages, 
  Share2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import PhoneInput from "@/components/common/PhoneInput";

interface BuilderFormProps {
  resumeData: any;
  setResumeData: (data: any) => void;
}

export default function BuilderForm({ resumeData, setResumeData }: BuilderFormProps) {
  const [activeSection, setActiveSection] = useState<string>("personal");

  const updatePersonal = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personal: { ...resumeData.personal, [field]: value }
    });
  };

  const addItem = (section: string, emptyItem: any) => {
    setResumeData({
      ...resumeData,
      [section]: [...resumeData[section], { ...emptyItem, id: Date.now().toString() }]
    });
  };

  const removeItem = (section: string, id: string) => {
    setResumeData({
      ...resumeData,
      [section]: resumeData[section].filter((item: any) => item.id !== id)
    });
  };

  const updateItem = (section: string, id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      [section]: resumeData[section].map((item: any) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const moveItem = (section: string, index: number, direction: 'up' | 'down') => {
    const newItems = [...resumeData[section]];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setResumeData({ ...resumeData, [section]: newItems });
  };

  const SectionWrapper = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => (
    <div className={`bg-white rounded-2xl border transition-all duration-300 ${activeSection === id ? "border-brand-blue shadow-md ring-1 ring-brand-blue/20" : "border-border/60 shadow-sm"}`}>
      <button 
        onClick={() => setActiveSection(activeSection === id ? "" : id)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeSection === id ? "bg-brand-blue text-white" : "bg-secondary text-muted-foreground"}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-black text-foreground uppercase tracking-wider text-sm">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${activeSection === id ? "rotate-180" : ""}`} />
      </button>
      {activeSection === id && (
        <div className="px-6 pb-8 space-y-6 animate-in fade-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      
      {/* 1. Personal Details */}
      <SectionWrapper id="personal" title="Personal Details" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
            <input 
              type="text" 
              value={resumeData.personal.fullName}
              onChange={(e) => updatePersonal("fullName", e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Professional Title</label>
            <input 
              type="text" 
              value={resumeData.personal.jobTitle}
              onChange={(e) => updatePersonal("jobTitle", e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              value={resumeData.personal.email}
              onChange={(e) => updatePersonal("email", e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
            <PhoneInput value={resumeData.personal.phone} onChange={(v) => updatePersonal("phone", v)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Location</label>
            <input 
              type="text" 
              value={resumeData.personal.location}
              onChange={(e) => updatePersonal("location", e.target.value)}
              placeholder="e.g. New York, USA"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Portfolio/Website</label>
            <input 
              type="url" 
              value={resumeData.personal.website}
              onChange={(e) => updatePersonal("website", e.target.value)}
              placeholder="e.g. https://johndoe.com"
              className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* 2. Summary */}
      <SectionWrapper id="summary" title="Professional Summary" icon={FileText}>
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Highlight your expertise</label>
            <button className="text-[10px] font-black text-brand-blue flex items-center gap-1.5 hover:underline decoration-2">
              <Sparkles className="w-3 h-3" /> AI Improve (Coming Soon)
            </button>
          </div>
          <textarea 
            rows={6}
            value={resumeData.summary}
            onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
            placeholder="A brief overview of your career and key achievements..."
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm resize-none"
          />
        </div>
      </SectionWrapper>

      {/* 3. Work Experience */}
      <SectionWrapper id="experience" title="Work Experience" icon={Briefcase}>
        <div className="space-y-4">
          {resumeData.experience.map((exp: any, index: number) => (
            <div key={exp.id} className="p-5 rounded-2xl bg-secondary/20 border border-border/40 relative group/item">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Job Title / Position"
                  value={exp.position}
                  onChange={(e) => updateItem("experience", exp.id, "position", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-bold text-sm"
                />
                <input 
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(e) => updateItem("experience", exp.id, "company", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-bold text-sm"
                />
                <input 
                  placeholder="Date Range (e.g. Jan 2020 - Present)"
                  value={exp.date}
                  onChange={(e) => updateItem("experience", exp.id, "date", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-medium text-xs"
                />
                <div className="flex items-center justify-end gap-2">
                   <button onClick={() => moveItem("experience", index, 'up')} disabled={index === 0} className="p-1.5 rounded-md hover:bg-white text-muted-foreground disabled:opacity-20"><ChevronUp className="w-4 h-4"/></button>
                   <button onClick={() => moveItem("experience", index, 'down')} disabled={index === resumeData.experience.length - 1} className="p-1.5 rounded-md hover:bg-white text-muted-foreground disabled:opacity-20"><ChevronDown className="w-4 h-4"/></button>
                   <button onClick={() => removeItem("experience", exp.id)} className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4"/></button>
                </div>
                <div className="md:col-span-2">
                  <textarea 
                    placeholder="Key responsibilities and achievements..."
                    value={exp.description}
                    rows={4}
                    onChange={(e) => updateItem("experience", exp.id, "description", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-medium text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => addItem("experience", { company: "", position: "", date: "", description: "" })}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
      </SectionWrapper>

      {/* 4. Education */}
      <SectionWrapper id="education" title="Education" icon={GraduationCap}>
        <div className="space-y-4">
          {resumeData.education.map((edu: any, index: number) => (
            <div key={edu.id} className="p-5 rounded-2xl bg-secondary/20 border border-border/40 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Degree / Certificate"
                  value={edu.degree}
                  onChange={(e) => updateItem("education", edu.id, "degree", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-bold text-sm"
                />
                <input 
                  placeholder="School / University"
                  value={edu.school}
                  onChange={(e) => updateItem("education", edu.id, "school", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-bold text-sm"
                />
                <input 
                  placeholder="Date / Graduation Year"
                  value={edu.date}
                  onChange={(e) => updateItem("education", edu.id, "date", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-medium text-xs"
                />
                <div className="flex items-center justify-end gap-2">
                   <button onClick={() => removeItem("education", edu.id)} className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => addItem("education", { school: "", degree: "", date: "" })}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
      </SectionWrapper>

      {/* 5. Skills */}
      <SectionWrapper id="skills" title="Skills" icon={Wrench}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl bg-secondary/20 border border-border/40">
             {resumeData.skills.map((skill: string, index: number) => (
                <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border/60 rounded-lg shadow-sm text-xs font-bold text-foreground overflow-hidden group/skill">
                   <input 
                     value={skill} 
                     onChange={(e) => {
                       const newSkills = [...resumeData.skills];
                       newSkills[index] = e.target.value;
                       setResumeData({...resumeData, skills: newSkills});
                     }}
                     className="bg-transparent outline-none w-[80px]"
                   />
                   <button onClick={() => {
                     const newSkills = resumeData.skills.filter((_: any, i: number) => i !== index);
                     setResumeData({...resumeData, skills: newSkills});
                   }} className="text-rose-500 opacity-0 group-hover/skill:opacity-100 transition-opacity">
                     <Plus className="w-3 h-3 rotate-45" />
                   </button>
                </div>
             ))}
          </div>
          <button 
            onClick={() => setResumeData({...resumeData, skills: [...resumeData.skills, ""]})}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>
      </SectionWrapper>

      {/* 6. Certifications */}
      <SectionWrapper id="certifications" title="Certifications" icon={Award}>
        <div className="space-y-4">
          {resumeData.certifications.map((cert: string, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <input 
                value={cert}
                onChange={(e) => {
                  const newCerts = [...resumeData.certifications];
                  newCerts[index] = e.target.value;
                  setResumeData({...resumeData, certifications: newCerts});
                }}
                placeholder="Certification Name / Entity"
                className="flex-1 px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
              />
              <button onClick={() => {
                const newCerts = resumeData.certifications.filter((_: any, i: number) => i !== index);
                setResumeData({...resumeData, certifications: newCerts});
              }} className="p-3 rounded-xl hover:bg-rose-50 text-rose-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setResumeData({...resumeData, certifications: [...resumeData.certifications, ""]})}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        </div>
      </SectionWrapper>

      {/* 7. Projects */}
      <SectionWrapper id="projects" title="Projects & Portfolio" icon={Layers}>
        <div className="space-y-4">
          {resumeData.projects.map((proj: any, index: number) => (
            <div key={proj.id} className="p-5 rounded-2xl bg-secondary/20 border border-border/40 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) => updateItem("projects", proj.id, "name", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-bold text-sm"
                />
                <input 
                  placeholder="Project Link (Optional)"
                  value={proj.link}
                  onChange={(e) => updateItem("projects", proj.id, "link", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-medium text-xs"
                />
                <div className="md:col-span-2">
                  <textarea 
                    placeholder="Short description of your contribution..."
                    value={proj.description}
                    rows={3}
                    onChange={(e) => updateItem("projects", proj.id, "description", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-medium text-xs resize-none"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                   <button onClick={() => removeItem("projects", proj.projId)} className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => addItem("projects", { name: "", link: "", description: "" })}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </SectionWrapper>

      {/* 8. Languages */}
      <SectionWrapper id="languages" title="Languages" icon={Languages}>
        <div className="space-y-4">
          {resumeData.languages.map((lang: string, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <input 
                value={lang}
                onChange={(e) => {
                  const newLangs = [...resumeData.languages];
                  newLangs[index] = e.target.value;
                  setResumeData({...resumeData, languages: newLangs});
                }}
                placeholder="Language (e.g. English - Professional)"
                className="flex-1 px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
              />
              <button onClick={() => {
                const newLangs = resumeData.languages.filter((_: any, i: number) => i !== index);
                setResumeData({...resumeData, languages: newLangs});
              }} className="p-3 rounded-xl hover:bg-rose-50 text-rose-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setResumeData({...resumeData, languages: [...resumeData.languages, ""]})}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Language
          </button>
        </div>
      </SectionWrapper>

      {/* 9. Social Links */}
      <SectionWrapper id="socials" title="Social Profiles" icon={Share2}>
        <div className="space-y-4">
          {resumeData.socials.map((social: any) => (
            <div key={social.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select 
                value={social.platform}
                onChange={(e) => updateItem("socials", social.id, "platform", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-bold text-sm"
              >
                <option>LinkedIn</option>
                <option>GitHub</option>
                <option>Twitter</option>
                <option>Portfolio</option>
                <option>Dribbble</option>
              </select>
              <div className="flex items-center gap-2">
                <input 
                  placeholder="Profile URL"
                  value={social.url}
                  onChange={(e) => updateItem("socials", social.id, "url", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-border/60 focus:ring-1 focus:ring-brand-blue outline-none font-medium text-xs"
                />
                <button onClick={() => removeItem("socials", social.id)} className="p-2 rounded-md hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => addItem("socials", { platform: "LinkedIn", url: "" })}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-brand-blue hover:text-brand-blue transition-all flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Social Profile
          </button>
        </div>
      </SectionWrapper>

    </div>
  );
}
