"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, Pause, Play, ArrowUpRight, Building } from "lucide-react";
import { resolveImageUrl, type JobPost } from "@/lib/api";
import { jobPagePath } from "@/lib/jobShare";
import JobPosterImage from "@/components/common/JobPosterImage";

const STORY_DURATION_MS = 5000;
const TICK_MS = 50;

// A group is one company's run of stories, cycled through like an
// Instagram/WhatsApp "stories from a user" viewer -- in practice an
// employer can normally only have one active story at a time (enforced
// both backend-side and in the post-story form's own copy), so most groups
// render as "1/1", same as Instagram treats a single-story user identically
// to a multi-story one. The mechanism itself is what the client asked to
// see, not specifically the multi-story case.
export interface StoryGroup {
  key: string;
  companyName: string;
  companyLogo: string | null;
  stories: JobPost[];
}

export function groupStoriesByCompany(stories: JobPost[]): StoryGroup[] {
  const groups = new Map<string, StoryGroup>();
  for (const story of stories) {
    const key = story.companyId ?? `name:${story.company}`;
    const existing = groups.get(key);
    if (existing) {
      existing.stories.push(story);
    } else {
      groups.set(key, {
        key,
        companyName: story.company,
        companyLogo: story.companyProfile?.logo ?? null,
        stories: [story],
      });
    }
  }
  return Array.from(groups.values());
}

// Resolves a possibly out-of-range (groupIndex, storyIndex) pair into a
// valid one, walking across group boundaries in either direction -- a plain
// loop (not recursion) so it's safe to call from a useCallback without a
// self-reference-before-declaration lint error. Returns null when the walk
// runs off either end of `groups` entirely (closes the viewer).
function resolveStoryPosition(
  groups: StoryGroup[],
  groupIndex: number,
  storyIndex: number
): { groupIndex: number; storyIndex: number } | null {
  let g = groupIndex;
  let s = storyIndex;
  while (g >= 0 && g < groups.length) {
    if (s < 0) {
      g -= 1;
      s = g >= 0 ? groups[g].stories.length - 1 : -1;
      continue;
    }
    if (s >= groups[g].stories.length) {
      g += 1;
      s = 0;
      continue;
    }
    return { groupIndex: g, storyIndex: s };
  }
  return null;
}

export default function StoryViewer({
  groups,
  startGroupIndex,
  startStoryIndex = 0,
  onClose,
}: {
  groups: StoryGroup[];
  startGroupIndex: number;
  startStoryIndex?: number;
  onClose: () => void;
}) {
  const [groupIndex, setGroupIndex] = useState(startGroupIndex);
  const [storyIndex, setStoryIndex] = useState(startStoryIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  // Advancing past the last story of the last group (or back before the
  // first) closes the viewer instead of wrapping.
  const goToStory = useCallback(
    (nextGroupIndex: number, nextStoryIndex: number) => {
      const resolved = resolveStoryPosition(groups, nextGroupIndex, nextStoryIndex);
      if (!resolved) {
        onClose();
        return;
      }
      setGroupIndex(resolved.groupIndex);
      setStoryIndex(resolved.storyIndex);
      setProgress(0);
    },
    [groups, onClose]
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p + (TICK_MS / STORY_DURATION_MS) * 100 >= 100) {
          goToStory(groupIndex, storyIndex + 1);
          return 0;
        }
        return p + (TICK_MS / STORY_DURATION_MS) * 100;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [paused, groupIndex, storyIndex, goToStory]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setPaused(true), 180);
  };
  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setPaused(false);
  };

  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-[420px] h-[85vh] max-h-[760px] rounded-2xl overflow-hidden bg-black shadow-2xl select-none"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        {/* Progress segments -- one per story in this company's group */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < storyIndex ? "100%" : i === storyIndex ? `${progress}%` : "0%",
                  transition: i === storyIndex ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header: company + counter + pause/close */}
        <div className="absolute top-7 left-3 right-3 z-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center overflow-hidden shrink-0 border border-white/40">
              {group.companyLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveImageUrl(group.companyLogo)} alt={group.companyName} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-4 h-4 text-brand-blue" />
              )}
            </div>
            <span className="text-white text-sm font-bold truncate drop-shadow">{group.companyName}</span>
            <span className="text-white/70 text-xs font-bold shrink-0">
              {storyIndex + 1}/{group.stories.length}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPaused((p) => !p);
              }}
              aria-label={paused ? "Play" : "Pause"}
              className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tap zones -- left third = previous, right two-thirds = next */}
        <button
          type="button"
          aria-label="Previous story"
          className="absolute inset-y-0 left-0 w-1/3 z-10"
          onClick={() => goToStory(groupIndex, storyIndex - 1)}
        />
        <button
          type="button"
          aria-label="Next story"
          className="absolute inset-y-0 right-0 w-2/3 z-10"
          onClick={() => goToStory(groupIndex, storyIndex + 1)}
        />

        <JobPosterImage image={story.image} title={story.title} company={story.company} className="w-full h-full bg-black" />

        {/* Caption + View Details */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-10 pb-5 px-4">
          <p className="text-white text-sm font-bold mb-2 line-clamp-1">{story.title}</p>
          {story.description && (
            <p className="text-white/85 text-xs leading-relaxed line-clamp-2 mb-3">{story.description}</p>
          )}
          <Link
            href={jobPagePath(story)}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-white text-black text-sm font-black"
          >
            View Details <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
