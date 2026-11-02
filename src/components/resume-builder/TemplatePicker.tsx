"use client";

import { useState } from "react";
import { X, Check, LayoutGrid } from "lucide-react";
import TemplateRenderer from "@/lib/resumeTemplates/TemplateRenderer";
import { SAMPLE_SECTIONS } from "@/lib/resumeTemplates/sampleData";
import {
  TEMPLATES,
  RESUME_PALETTES,
  type TemplateId,
  type ResumeTheme,
} from "@/lib/resumeTemplates/types";

// Thumbnails are real TemplateRenderer instances at full A4 size, scaled
// down via CSS transform -- not static images, so they can never drift out
// of sync with what a template actually looks like (same technique the
// sister site's gallery uses, built fresh here rather than copied).
function Thumbnail({
  templateId,
  theme,
  scale,
  active,
}: {
  templateId: TemplateId;
  theme: ResumeTheme;
  scale: number;
  active?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-md bg-white ring-1 transition-all ${active ? "ring-brand-blue/30 shadow-lg shadow-brand-blue/15" : "ring-slate-200 shadow-sm group-hover:shadow-md group-hover:ring-slate-300"}`}
      style={{ width: 210 * scale, height: 297 * scale }}
    >
      <div
        className="bg-white p-[15mm] origin-top-left pointer-events-none"
        style={{
          width: "210mm",
          transform: `scale(${scale})`,
          fontFamily: theme.fontFamily,
        }}
      >
        <TemplateRenderer
          templateId={templateId}
          sections={SAMPLE_SECTIONS}
          theme={theme}
        />
      </div>
    </div>
  );
}

// Bigger than the sister site's own factor on purpose -- at 0.42 each
// thumbnail rendered at ~88x125px, so small the actual template design
// (especially the restrained Minimalist/Executive ones) was barely
// legible. 0.6 keeps 9 thumbnails comfortably in one row on a normal
// desktop width while actually showing what each template looks like.
const THUMB_SCALE = 0.6;

export default function TemplatePicker({
  templateId,
  theme,
  onSelectTemplate,
  onSelectPalette,
}: {
  templateId: TemplateId;
  theme: ResumeTheme;
  onSelectTemplate: (id: TemplateId) => void;
  onSelectPalette: (color: string) => void;
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <div className="space-y-2 lg:space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Template
        </p>
        <button
          onClick={() => setGalleryOpen(true)}
          className="flex items-center gap-1.5 text-[10px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/5 hover:bg-brand-blue/10 px-3 py-1.5 rounded-full transition-all"
        >
          <LayoutGrid className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Choose Template</span><span className="sm:hidden">Gallery</span>
        </button>
      </div>

      {/* Name pills, not preview cards -- the live-rendered thumbnails ate
          a lot of vertical space for something this bar's job doesn't
          actually need: quick switching between templates you've likely
          already seen. Visual comparison still exists, just one level
          down, via "Choose Template" above, which keeps the real preview
          cards for when someone genuinely wants to look before picking.
          Below lg, 9 pills wrapped into 3 full rows and ate a lot of
          mobile screen height before the form even starts -- a single
          horizontally-scrollable row keeps this bar compact on phones,
          same as the color swatch row below it. lg+ has the width to just
          wrap them all into view at once, so it switches back to that. */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5 lg:flex-wrap lg:overflow-visible">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTemplate(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all shrink-0 ${
              templateId === t.id
                ? "bg-brand-gradient text-white shadow-md shadow-brand-blue/25"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
            {t.atsSafe && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black tracking-wider ${templateId === t.id ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                ATS
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ATS-Safe stays intentionally colorless -- color is exactly what an
          ATS-parsing-safe resume avoids, so no swatch row for it. Every
          other template (Modern, Gulf CV, Europass, Bio-Data) reads
          theme.color directly. */}
      {templateId !== "ats-safe" && (
        <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
          {RESUME_PALETTES.map((p) => (
            <button
              key={p.id}
              title={p.label}
              onClick={() => onSelectPalette(p.color)}
              className={`w-6 h-6 shrink-0 rounded-full border-2 transition-all ${theme.color === p.color ? "border-slate-900 scale-110" : "border-white shadow-sm"}`}
              style={{ backgroundColor: p.color }}
            />
          ))}
        </div>
      )}

      {galleryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setGalleryOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[85vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-foreground">
                Choose Your Template
              </h3>
              <button
                onClick={() => setGalleryOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTemplate(t.id);
                    setGalleryOpen(false);
                  }}
                  className={`flex-1 basis-[200px] max-w-[260px] flex flex-col items-center text-left rounded-xl p-3 border transition-all ${
                    templateId === t.id ? "bg-brand-blue/5 border-brand-blue/20" : "bg-slate-50/60 border-transparent hover:bg-slate-100/80"
                  }`}
                >
                  <Thumbnail
                    templateId={t.id}
                    theme={theme}
                    scale={THUMB_SCALE}
                    active={templateId === t.id}
                  />
                  <div className="w-full mt-2.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-foreground">
                        {t.label}
                      </p>
                      {t.atsSafe && (
                        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ATS-Safe
                        </span>
                      )}
                      {templateId === t.id && (
                        <Check className="w-3.5 h-3.5 text-brand-blue ml-auto" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
