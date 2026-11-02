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
  FileText,
  Target
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import { getMyResume, upsertMyResume, getMyCandidateProfile, ApiError } from "@/lib/api";
import Editor from "@/components/resume-builder/Editor";
import Preview from "@/components/resume-builder/Preview";
import TemplatePicker from "@/components/resume-builder/TemplatePicker";
import MatchScoreModal from "@/components/resume-builder/MatchScoreModal";
import DecorativeBlur from "@/components/common/DecorativeBlur";
import { mapProfileToResumeSections } from "@/lib/resumeProfileMapping";
import type { ResumeData, TemplateId } from "@/lib/resumeTemplates/types";

const DEFAULT_RESUME_DATA: ResumeData = {
  theme: {
    color: "#1098F0", // brand-blue (Coral Reef) -- also RESUME_PALETTES' "signal-blue"
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
  ],
};

// A4 at 96dpi, minus a little breathing room on each side so the page
// never touches the preview panel's edges even at its largest fit.
const A4_WIDTH_PX = Math.round(210 * (96 / 25.4));
const FIT_MARGIN_PX = 32;
// Letting this exceed 1 (up to 1.25x "real" size) is what actually closes
// the grey gap on wide panels -- capping at a hard 1.0 meant any panel
// wider than the natural page width (793px) just left the extra width as
// visible grey margin on both sides, which is exactly what read as "too
// much white/grey space around" the page.
const MAX_FIT_SCALE = 1.25;

export default function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [templateId, setTemplateId] = useState<TemplateId>("modern");

  const [viewMode, setViewMode] = useState<"edit" | "preview" | "both">("both");
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showMatchScore, setShowMatchScore] = useState(false);
  // Replaces the old manual zoom in/out controls -- the page now always
  // scales to exactly fill the preview panel's width on its own, measured
  // live via ResizeObserver, so there's never a stale/wrong zoom level to
  // fight with (split view vs full-width preview, window resizes, mobile
  // vs desktop) and never anything for the candidate to manually fiddle
  // with just to see their resume at a reasonable size.
  const [autoFitScale, setAutoFitScale] = useState(0.85);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewPanelRef = useRef<HTMLDivElement>(null);

  // High performance: separate editor typing from preview rendering
  const deferredResumeData = useDeferredValue(resumeData);
  const personalSection = resumeData.sections.find((s) => s.type === "PERSONAL");
  const personalData = personalSection?.type === "PERSONAL" ? personalSection.data : undefined;

  // Fills the builder from the candidate's existing CandidateProfile --
  // shared by the automatic first-visit pre-fill and the manual "Import
  // from My Profile" button, so both go through the one mapping function.
  const importFromProfile = async (): Promise<boolean> => {
    try {
      const profile = await getMyCandidateProfile();
      if (!profile) return false;
      setResumeData((prev) => ({ ...prev, sections: mapProfileToResumeSections(profile) }));
      return true;
    } catch (err) {
      console.error("Failed to load candidate profile for pre-fill:", err);
      return false;
    }
  };

  const handleImportClick = async () => {
    if (!confirm("Import from your profile? This replaces the current content in the builder.")) return;
    setIsImporting(true);
    const ok = await importFromProfile();
    setIsImporting(false);
    if (ok) toast.success("Imported from your profile");
    else toast.error("Couldn't load your profile — fill in manually instead.");
  };

  // "Split" (viewMode "both") only ever makes sense at lg+ -- the
  // Split button itself is already hidden below lg in the header, but
  // viewMode itself was only ever corrected to "edit" on first mount, not
  // on a live resize. Rotating a phone, or resizing/using DevTools'
  // responsive mode on a desktop session that loaded at lg+ first, kept
  // `viewMode: "both"` intact, which the editor/preview widths below
  // weren't gated against either -- the result was a genuinely broken
  // 58/42 split squeezed into a phone-width screen (the actual bug
  // reported). A matchMedia listener corrects it live, not just once.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (!mq.matches) setViewMode((prev) => (prev === "both" ? "edit" : prev));
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Persistence
  useEffect(() => {
    // Server data wins if it exists; localStorage is only a fallback for a
    // draft made before this was wired up (or if the load request fails).
    (async () => {
      try {
        const saved = await getMyResume();
        if (saved && (saved.theme || saved.sections)) {
          setResumeData((prev) => ({
            theme: saved.theme ? (saved.theme as ResumeData["theme"]) : prev.theme,
            sections: saved.sections ? (saved.sections as ResumeData["sections"]) : prev.sections,
          }));
          if (saved.template) setTemplateId(saved.template as TemplateId);
          return;
        }
      } catch (err) {
        console.error("Failed to load saved resume:", err);
      }

      const localDraft = localStorage.getItem("resume-builder-v2");
      if (localDraft) {
        try {
          setResumeData(JSON.parse(localDraft));
          return;
        } catch (e) {
          console.error(e);
        }
      }

      // No saved resume anywhere -- genuinely first visit. Pre-fill from
      // the candidate's existing profile automatically rather than
      // starting blank, silently falling back to the default empty form
      // if there's no profile yet either.
      await importFromProfile();
    })();
  }, []);

  useEffect(() => {
    const panel = previewPanelRef.current;
    if (!panel) return;

    const recompute = () => {
      const available = panel.clientWidth - FIT_MARGIN_PX;
      if (available <= 0) return;
      setAutoFitScale(Math.min(MAX_FIT_SCALE, available / A4_WIDTH_PX));
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [viewMode]);

  const handleSave = async () => {
    setIsSaving(true);
    localStorage.setItem("resume-builder-v2", JSON.stringify(resumeData));
    try {
      await upsertMyResume({ theme: resumeData.theme, sections: resumeData.sections, template: templateId });
      toast.success("Resume saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save resume.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: `Resume_${personalData?.fullName || "Draft"}`,
  });

  const handleReset = () => {
    if (confirm("Are you sure? This will clear your current draft.")) {
      localStorage.removeItem("resume-builder-v2");
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9] overflow-hidden">
      
      {/* Precision Header */}
      <header className="relative flex flex-col lg:flex-row lg:h-16 bg-white px-4 py-3 lg:px-6 lg:py-0 lg:items-center justify-between shrink-0 z-50 transition-all after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-brand-blue/30 after:to-transparent">
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/my-profile" className="p-2 hover:bg-secondary rounded-lg transition-all text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md shadow-brand-blue/30">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight">ResumePro</h1>
                <span className="text-[9px] font-black text-brand-blue/40 uppercase tracking-widest hidden sm:block">Modern Builder</span>
              </div>
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
            
            <button onClick={handlePrint} className="flex-1 lg:flex-initial px-5 py-2.5 rounded-xl text-sm font-black bg-brand-gradient text-white shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Download</span>
              <span className="md:hidden text-xs">Download</span>
            </button>
          </div>
        </div>
      </header>

      {/* Template + Color Bar -- full page width on purpose, not squeezed
          into the editor column (which left the thumbnails stranded next to
          a lot of dead white space). Its own horizontal scroller handles a
          longer template/color list without needing the whole page to
          scroll. */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 lg:px-6 py-2.5 lg:py-4">
        <TemplatePicker
          templateId={templateId}
          theme={resumeData.theme}
          onSelectTemplate={setTemplateId}
          onSelectPalette={(color) => setResumeData((prev) => ({ ...prev, theme: { ...prev.theme, color } }))}
        />
      </div>

      {/* Overhauled Workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Detail Panel: Editor */}
        {/* The 58/42 split only ever applies at lg+ (`lg:w-[58%]`, not a
            bare `w-[58%]`) -- defense-in-depth alongside the matchMedia
            correction above, so even a viewMode of "both" momentarily
            surviving into a sub-lg width (e.g. mid-resize) can't squeeze
            this panel into a useless sliver; below lg it's always either
            full width or fully hidden, never a fraction. */}
        <div className={`relative flex flex-col bg-white border-r border-slate-200 overflow-hidden transition-all duration-500 ${
          viewMode === "preview" ? "w-0 opacity-0 pointer-events-none" : viewMode === "both" ? "w-full lg:w-[58%] xl:w-[55%]" : "w-full"
        }`}>
          <DecorativeBlur size="xl" blur="3xl" className="-top-10 -left-20 bg-brand-blue/5" />
          <div className="relative flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="max-w-xl mx-auto space-y-12">
               {/* Editor's setSections may be called with a plain array OR a
                   React-style updater over the latest sections (see Editor.tsx) --
                   threading that updater into setResumeData, rather than resolving
                   it against this render's resumeData.sections, is what lets two
                   edits fired in quick succession (e.g. typing into an Experience
                   field then an Education field before a re-render lands) both
                   survive instead of the second stomping the first. Reproduced
                   live before this fix: scripted rapid field edits silently lost
                   data. */}
               <Editor
                 sections={resumeData.sections}
                 setSections={(update) =>
                   setResumeData((prev) => ({
                     ...prev,
                     sections: typeof update === "function" ? update(prev.sections) : update,
                   }))
                 }
               />

               {/* Footer Control Area */}
               <div className="pt-10 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={handleImportClick}
                    disabled={isImporting}
                    className="group flex items-center gap-3 disabled:opacity-50"
                  >
                    <div className="p-2 rounded-lg bg-brand-blue-muted text-brand-blue-light">
                       <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">
                      {isImporting ? "Importing..." : "Import from My Profile"}
                    </p>
                  </button>
                  <div className="flex items-center gap-5">
                     <button
                       onClick={() => setShowMatchScore(true)}
                       className="group flex items-center gap-3"
                     >
                       <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600">
                          <Target className="w-4 h-4" />
                       </div>
                       <p className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">
                         Check Job Match
                       </p>
                     </button>
                     <button className="text-xs font-bold text-brand-blue underline underline-offset-4 decoration-2 decoration-brand-blue/30 hover:decoration-brand-blue transition-all">Add Custom Section</button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Master Panel: Live Document Preview */}
        {/* "both" is also hidden below lg here (same reasoning as the
            editor panel above) -- without this, "both" rendered this
            panel at `w-full flex` on every screen size, so a sub-lg width
            showed it stacked edge-to-edge alongside the editor's own
            fractional width in the same flex ROW, squeezing both into
            slivers (the reported bug) instead of showing either one
            properly. */}
        <div
          ref={previewPanelRef}
          className={`flex-1 bg-[#CBD5E1] overflow-y-auto relative transition-all duration-500 flex-col items-center ${
            viewMode === "edit" ? "hidden lg:flex w-0 p-0 opacity-0 invisible" : viewMode === "both" ? "hidden lg:flex w-full lg:flex-1" : "flex w-full"
          }`}
        >
          <DecorativeBlur size="2xl" blur="strong" className="-top-20 right-0 bg-brand-blue/10" />

          {/* Precision Scaled A4 Sheet -- the page always auto-fits the
              panel's actual width (see the ResizeObserver effect above), so
              there's no manual zoom control or fit indicator needed here.

              `transform: scale()` only shrinks what's PAINTED, never the
              element's own layout box -- so with the default center-top
              origin, `items-center` on the panel centers the FULL-SIZE
              (793px) box, and on any screen narrower than that the
              scaled-down page renders off-center, clipping one side (the
              mobile bug reported: "RAHUL SHARMA" painting as "HUL SHARMA").
              Setting an explicit width equal to the real scaled size, with
              transform-origin pinned to the box's own top-left corner,
              makes the element's layout box match what's actually
              painted, so centering (and any future layout math against
              this element) is correct at every screen size. */}
          <div
            className="relative group transition-transform duration-500 h-fit mt-8 mb-6"
            style={{ transform: `scale(${autoFitScale})`, transformOrigin: "top left", width: A4_WIDTH_PX * autoFitScale }}
          >
            <div className="absolute inset-0 bg-slate-900/10 blur-3xl rounded-full translate-y-12 scale-90 group-hover:opacity-40 transition-opacity" />
            <Preview ref={previewRef} data={{ ...deferredResumeData, templateId }} />

            {/* Empty State Indicator (If no data) */}
            {!personalData?.fullName && (
              <div className="absolute top-6 -right-6 translate-x-full bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white shadow-xl max-w-[200px] animate-bounce-slow pointer-events-none">
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                  Preview reflects your edits instantly. Try typing your name!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMatchScore && (
        <MatchScoreModal sections={resumeData.sections} onClose={() => setShowMatchScore(false)} />
      )}
    </div>
  );
}
