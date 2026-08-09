"use client";

import { useState, useRef, useEffect, useDeferredValue } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  Save, 
  Layout, 
  Eye, 
  Smartphone,
  Monitor,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  SearchIcon,
  ZoomIn,
  ZoomOut,
  Maximize
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { getMyResume, upsertMyResume, ApiError } from "@/lib/api";
import Editor from "@/components/resume-builder/Editor";
import Preview from "@/components/resume-builder/Preview";

export default function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState({
    theme: {
      color: "#1E3A8A", // brand-blue
      fontFamily: "Inter",
      fontSize: 11,
      lineHeight: 1.5,
      sectionSpacing: 20,
    },
    sections: [
      { id: "personal", type: "PERSONAL", title: "Personal Details", isExpanded: true, data: { fullName: "", jobTitle: "", email: "", phone: "", location: "", website: "" } },
      { id: "summary", type: "SUMMARY", title: "Professional Summary", isExpanded: true, data: { content: "" } },
      { id: "experience", type: "LIST", title: "Work Experience", isExpanded: true, lastId: 1, items: [{ id: "1", title: "", subtitle: "", date: "", content: "" }] },
      { id: "education", type: "LIST", title: "Education", isExpanded: true, lastId: 1, items: [{ id: "1", title: "", subtitle: "", date: "", content: "" }] },
      { id: "skills", type: "TAGS", title: "Core Skills", isExpanded: true, items: [""] },
    ]
  });

  const [viewMode, setViewMode] = useState<"edit" | "preview" | "both">("both");
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(0.85); // Professional default scale
  const previewRef = useRef<HTMLDivElement>(null);
  
  // High performance: separate editor typing from preview rendering
  const deferredResumeData = useDeferredValue(resumeData);

  // Persistence & Viewport Defaults
  useEffect(() => {
    // Initial mobile check
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setViewMode("edit");
      setZoom(0.4); // 40% zoom as requested
    }

    // Server data wins if it exists; localStorage is only a fallback for a
    // draft made before this was wired up (or if the load request fails).
    (async () => {
      try {
        const saved = await getMyResume();
        if (saved && (saved.theme || saved.sections)) {
          setResumeData((prev) => ({
            theme: saved.theme ? (saved.theme as typeof prev.theme) : prev.theme,
            sections: saved.sections ? (saved.sections as typeof prev.sections) : prev.sections,
          }));
          return;
        }
      } catch (err) {
        console.error("Failed to load saved resume:", err);
      }

      const localDraft = localStorage.getItem("resume-builder-v2");
      if (localDraft) {
        try { setResumeData(JSON.parse(localDraft)); } catch (e) { console.error(e); }
      }
    })();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem("resume-builder-v2", JSON.stringify(resumeData));
    try {
      await upsertMyResume({ theme: resumeData.theme, sections: resumeData.sections });
      toast.success("Resume saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save resume.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: `Resume_${resumeData.sections?.[0]?.data?.fullName || "Draft"}`,
  });

  const handleZoom = (type: "in" | "out" | "reset") => {
    if (type === "in") setZoom(prev => Math.min(prev + 0.1, 1.5));
    else if (type === "out") setZoom(prev => Math.max(prev - 0.1, 0.4));
    else setZoom(0.85);
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will clear your current draft.")) {
      localStorage.removeItem("resume-builder-v2");
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9] overflow-hidden">
      
      {/* Precision Header */}
      <header className="flex flex-col lg:flex-row lg:h-16 bg-white border-b border-border/40 px-4 py-3 lg:px-6 lg:py-0 lg:items-center justify-between shrink-0 z-50 transition-all">
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <div className="flex items-center gap-3">
            <Link href="/resume" className="p-2 hover:bg-secondary rounded-lg transition-all text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-baseline gap-2">
              <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight">ResumePro</h1>
              <span className="text-[9px] font-black text-brand-blue/30 uppercase tracking-widest hidden sm:block">Modern Builder</span>
            </div>
          </div>

          {/* View Switcher (Dynamic - Integrated in Row 1 for mobile) */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 scale-90 sm:scale-100 origin-right">
             <button 
               onClick={() => setViewMode("edit")}
               className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-2 ${viewMode === "edit" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
             >
               <Layout className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit</span>
             </button>
             <button 
               onClick={() => setViewMode("both")}
               className={`hidden lg:flex px-4 py-1.5 rounded-lg text-xs font-bold transition-all items-center gap-2 ${viewMode === "both" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
             >
               <Monitor className="w-3.5 h-3.5" /> Split
             </button>
             <button 
               onClick={() => setViewMode("preview")}
               className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-2 ${viewMode === "preview" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
             >
               <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
             </button>
          </div>
        </div>

        {/* Action Buttons: Moved to next row on mobile as requested */}
        <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto mt-3 lg:mt-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button onClick={handleReset} title="Reset Draft" className="p-2.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100 shrink-0">
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 flex-1 lg:flex-initial">
            <button onClick={handleSave} className="flex-1 lg:flex-initial px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-secondary flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0">
              <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} /> 
              <span className="hidden md:inline">{isSaving ? "Saving..." : "Save Draft"}</span>
              <span className="md:hidden text-xs">Save</span>
            </button>
            
            <button onClick={handlePrint} className="flex-1 lg:flex-initial px-5 py-2.5 rounded-xl text-sm font-black bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-medium flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Download</span>
              <span className="md:hidden text-xs">Download</span>
            </button>
          </div>
        </div>
      </header>

      {/* Overhauled Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Detail Panel: Editor */}
        <div className={`flex flex-col bg-white border-r border-slate-200 overflow-hidden transition-all duration-500 ${
          viewMode === "preview" ? "w-0 opacity-0 pointer-events-none" : viewMode === "both" ? "w-[58%] xl:w-[55%]" : "w-full"
        }`}>
          <div className="flex-1 overflow-y-auto px-8 py-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="max-w-xl mx-auto space-y-12">
               <Editor sections={resumeData.sections} setSections={(newSections: any) => setResumeData({...resumeData, sections: newSections})} />
               
               {/* Footer Control Area */}
               <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
                  <div className="group flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-orange/10 text-brand-orange">
                       <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">AI Tools Coming Soon</p>
                  </div>
                  <button className="text-xs font-bold text-brand-blue underline underline-offset-4 decoration-2 decoration-brand-blue/30 hover:decoration-brand-blue transition-all">Add Custom Section</button>
               </div>
            </div>
          </div>
        </div>

        {/* Master Panel: Live Document Preview */}
        <div className={`flex-1 bg-[#CBD5E1] overflow-y-auto relative p-12 transition-all duration-500 flex justify-center ${
          viewMode === "edit" ? "hidden lg:flex w-0 p-0 opacity-0 invisible" : "w-full flex"
        }`}>
          
          {/* Floating Preview Controls */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-10 bg-slate-900/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-500">
             <div className="flex items-center gap-2 pr-6 border-r border-white/10">
                <button 
                  onClick={() => handleZoom("out")}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div 
                  onClick={() => handleZoom("reset")}
                  className="w-16 flex items-center justify-center cursor-pointer group/zoom"
                  title="Reset Zoom"
                >
                   <span className="text-[10px] font-black tracking-widest text-white group-hover/zoom:text-brand-orange transition-colors">
                      {Math.round(zoom * 100)}%
                   </span>
                </div>
                <button 
                  onClick={() => handleZoom("in")}
                  title="Zoom In"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
             </div>
             <button 
                onClick={() => setZoom(prev => prev === 1 ? 0.85 : 1)}
                title="Fit to Height/Width"
                className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/60 hover:text-brand-orange uppercase transition-all"
             >
                <Maximize className="w-3.5 h-3.5" />
                Fit
             </button>
          </div>

          {/* Precision Scaled A4 Sheet */}
          <div 
            className="relative group transition-transform duration-500 origin-top h-fit"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="absolute inset-0 bg-slate-900/10 blur-3xl rounded-full translate-y-12 scale-90 group-hover:opacity-40 transition-opacity" />
            <Preview ref={previewRef} data={deferredResumeData} />
          </div>

          {/* Sticky Empty State Indicator (If no data) */}
          {!resumeData.sections?.[0]?.data?.fullName && (
            <div className="absolute top-20 right-20 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white shadow-xl max-w-[200px] animate-bounce-slow pointer-events-none">
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                Preview reflects your edits instantly. Try typing your name!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
