import type { TemplateId, TemplateContentProps } from "./types";
import ModernTemplate from "./ModernTemplate";
import AtsSafeTemplate from "./AtsSafeTemplate";
import GulfCvTemplate from "./GulfCvTemplate";
import EuropassTemplate from "./EuropassTemplate";
import BioDataTemplate from "./BioDataTemplate";
import SidebarTemplate from "./SidebarTemplate";
import MinimalistTemplate from "./MinimalistTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";
import TimelineTemplate from "./TimelineTemplate";

// Single dispatch point used by both Preview.tsx (the live editor preview,
// which react-to-print also captures directly -- so this is the one render
// path feeding both screen and PDF) and TemplatePicker.tsx's live thumbnail
// gallery. `templateId` defaults to "modern" for any resume saved before
// templates existed (template: null).
export default function TemplateRenderer({ templateId, sections, theme }: { templateId: TemplateId | null | undefined } & TemplateContentProps) {
  switch (templateId) {
    case "ats-safe":
      return <AtsSafeTemplate sections={sections} theme={theme} />;
    case "gulf-cv":
      return <GulfCvTemplate sections={sections} theme={theme} />;
    case "europass":
      return <EuropassTemplate sections={sections} theme={theme} />;
    case "bio-data":
      return <BioDataTemplate sections={sections} theme={theme} />;
    case "sidebar":
      return <SidebarTemplate sections={sections} theme={theme} />;
    case "minimalist":
      return <MinimalistTemplate sections={sections} theme={theme} />;
    case "executive":
      return <ExecutiveTemplate sections={sections} theme={theme} />;
    case "timeline":
      return <TimelineTemplate sections={sections} theme={theme} />;
    case "modern":
    default:
      return <ModernTemplate sections={sections} theme={theme} />;
  }
}
