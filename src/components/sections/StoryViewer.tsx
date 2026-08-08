"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, Phone, MessageSquare, ArrowUpRight } from "lucide-react";
import { resolveImageUrl, type JobPost } from "@/lib/api";

const STORY_DURATION_MS = 5000;

// Owns its own progress state, remounted per-story via `key` on the parent —
// letting React's remount reset progress to 0 naturally instead of an
// explicit setState(0) call inside an effect.
function ActiveProgressSegment({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / STORY_DURATION_MS) * 100);
      setProgress(pct);

      if (pct >= 100) {
        onComplete();
      } else {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return <div className="h-full bg-white transition-[width] duration-100 linear" style={{ width: `${progress}%` }} />;
}

export default function StoryViewer({
  stories,
  startIndex,
  onClose,
}: {
  stories: JobPost[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i >= stories.length - 1) {
        onClose();
        return i;
      }
      return i + 1;
    });
  }, [stories.length, onClose]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  const story = stories[index];
  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      <div className="relative w-full max-w-sm h-full sm:h-[90vh] sm:rounded-3xl overflow-hidden bg-black">
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
          {stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
              {i < index ? (
                <div className="h-full bg-white" style={{ width: "100%" }} />
              ) : i === index ? (
                <ActiveProgressSegment key={index} onComplete={goNext} />
              ) : null}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-8 right-3 z-20 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="absolute inset-0 z-10 flex">
          <button className="w-1/2 h-full" onClick={goPrev} aria-label="Previous story" />
          <button className="w-1/2 h-full" onClick={goNext} aria-label="Next story" />
        </div>

        {story.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImageUrl(story.image)} alt={story.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-blue/10 text-brand-blue p-8 text-center">
            <span className="text-xl font-black">{story.title}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-16 space-y-3">
          {story.tag && (
            <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-full">
              {story.tag}
            </span>
          )}
          <h3 className="text-white font-black text-lg leading-tight wrap-break-word">{story.title}</h3>
          {story.description && (
            <p className="text-white/80 text-sm line-clamp-3 wrap-break-word">{story.description}</p>
          )}
          {story.location && <p className="text-white/60 text-xs">{story.location}</p>}

          <Link
            href={`/jobs/${story.id}`}
            className="flex items-center justify-center gap-1.5 bg-white/15 border border-white/30 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-white/25 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" /> View Full Job Details
          </Link>

          <div className="flex gap-2 pt-2">
            {story.contactPhone && (
              <a
                href={`tel:${story.contactPhone}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white text-foreground font-bold text-sm py-2.5 rounded-xl"
              >
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
            {story.contactWhatsapp && (
              <a
                href={`https://wa.me/${story.contactWhatsapp.replace(/[^\d+]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 text-white font-bold text-sm py-2.5 rounded-xl"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
