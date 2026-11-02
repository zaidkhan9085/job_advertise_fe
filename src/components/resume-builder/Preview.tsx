"use client";

import { forwardRef } from "react";
import TemplateRenderer from "@/lib/resumeTemplates/TemplateRenderer";
import type { ResumeData, TemplateId } from "@/lib/resumeTemplates/types";

interface PreviewProps {
  data: ResumeData & { templateId?: TemplateId | null };
}

// The one A4-page/print-CSS shell, shared by every template -- only the
// inner content (TemplateRenderer's pick) varies. react-to-print captures
// this exact DOM node (see page.tsx's `contentRef`), so whatever renders
// here on screen is byte-for-byte what downloads as the PDF.
const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ data }, ref) => {
  const { sections, theme, templateId } = data;

  if (!sections?.length) return null;

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

      <div id="resume-v2-content">
        <TemplateRenderer templateId={templateId} sections={sections} theme={theme} />
      </div>
    </div>
  );
});

Preview.displayName = "Preview";

export default Preview;
