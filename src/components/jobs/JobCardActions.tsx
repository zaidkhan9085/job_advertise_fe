"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { recordJobInteraction, type JobPost } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ApplyDialog from "@/components/jobs/ApplyDialog";
import { buildJobWhatsAppUrl } from "@/lib/jobShare";

type ActionJob = Pick<JobPost, "id" | "title" | "company" | "location" | "contactPhone" | "contactWhatsapp">;

// The one action row every job card on the site uses -- Apply, WhatsApp,
// Call, always in that order and always all three, so a card behaves the
// same on the homepage as on /jobs. WhatsApp/Call are shown disabled (not
// hidden) when a job has no number, keeping every card's layout identical.
//
// Apply opens the apply dialog right here instead of navigating into the
// job page first. The dialog is portalled to <body> because cards are
// `overflow-hidden` and some lift on hover (a transformed ancestor becomes
// the containing block for `position: fixed`, which would clip the dialog
// inside the card); the wrapper stops click events from bubbling through
// the portal back up to the card's own click-to-open-job handler.
//
// "compact" = grid/carousel cards (Apply gets the width, WhatsApp and Call
// are icon buttons); "list" = the wide list row, where all three fit as
// labelled buttons.
export default function JobCardActions({
  job,
  hasApplied = false,
  onApplied,
  layout = "compact",
}: {
  job: ActionJob;
  hasApplied?: boolean;
  onApplied?: () => void;
  layout?: "compact" | "list";
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    if (hasApplied) return;
    setIsApplyOpen(true);
  };

  const whatsappHref = job.contactWhatsapp ? buildJobWhatsAppUrl(job.contactWhatsapp, job) : null;
  const telHref = job.contactPhone ? `tel:${job.contactPhone}` : null;

  const isList = layout === "list";

  const applyClass = isList
    ? "flex-1 sm:flex-none sm:w-36 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-[13px] transition-colors"
    : "flex items-center justify-center h-8 px-3 rounded-lg font-black text-[12px] transition-colors min-w-0";
  const secondaryClass = isList
    ? "flex-1 sm:flex-none sm:w-36 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-[13px] transition-colors"
    : "flex items-center justify-center w-9 h-8 rounded-lg transition-colors";
  const iconClass = isList ? "w-4 h-4 shrink-0" : "w-3.5 h-3.5";
  const disabledClass = "bg-secondary text-muted-foreground/40 cursor-not-allowed";

  return (
    <>
      <div
        className={
          isList
            ? "w-full sm:w-auto flex flex-row sm:flex-col gap-1.5 sm:gap-2 shrink-0"
            : "grid grid-cols-[1fr_auto_auto] gap-1.5"
        }
      >
        {hasApplied ? (
          <span className={`${applyClass} bg-emerald-50 text-emerald-600`}>
            <CheckCircle2 className={iconClass} /> Applied
          </span>
        ) : (
          <button
            type="button"
            onClick={handleApplyClick}
            className={`${applyClass} bg-brand-blue text-white hover:bg-brand-blue-medium`}
          >
            Apply
          </button>
        )}

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp"
            aria-label="WhatsApp"
            onClick={(e) => {
              e.stopPropagation();
              recordJobInteraction(job.id, "WHATSAPP");
            }}
            className={`${secondaryClass} bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20`}
          >
            <MessageCircle className={iconClass} />
            {isList && "WhatsApp"}
          </a>
        ) : (
          <span
            title="WhatsApp not available"
            aria-label="WhatsApp not available"
            aria-disabled="true"
            onClick={(e) => e.stopPropagation()}
            className={`${secondaryClass} ${disabledClass}`}
          >
            <MessageCircle className={iconClass} />
            {isList && "WhatsApp"}
          </span>
        )}

        {telHref ? (
          <a
            href={telHref}
            title="Call"
            aria-label="Call"
            onClick={(e) => {
              e.stopPropagation();
              recordJobInteraction(job.id, "CALL");
            }}
            className={`${secondaryClass} bg-brand-blue-muted text-brand-blue hover:bg-brand-blue-muted/70`}
          >
            <Phone className={iconClass} />
            {isList && "Call"}
          </a>
        ) : (
          <span
            title="Call not available"
            aria-label="Call not available"
            aria-disabled="true"
            onClick={(e) => e.stopPropagation()}
            className={`${secondaryClass} ${disabledClass}`}
          >
            <Phone className={iconClass} />
            {isList && "Call"}
          </span>
        )}
      </div>

      {isApplyOpen &&
        createPortal(
          <div onClick={(e) => e.stopPropagation()}>
            <ApplyDialog
              jobId={job.id}
              jobTitle={job.title}
              onClose={() => setIsApplyOpen(false)}
              onSuccess={() => onApplied?.()}
            />
          </div>,
          document.body
        )}
    </>
  );
}
