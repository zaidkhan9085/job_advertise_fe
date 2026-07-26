"use client";

import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { getJobStories, type JobPost, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import JobPosterImage from "@/components/common/JobPosterImage";
import StoryViewer from "./StoryViewer";

export default function StoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [stories, setStories] = useState<JobPost[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const { user } = useAuth();

  const loadStories = useCallback(async () => {
    try {
      setStories(await getJobStories());
    } catch (err) {
      if (!(err instanceof ApiError)) console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching from the backend API on mount, not duplicated React state
    loadStories();
  }, [loadStories]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 400);
    }
  };

  const postStoryHref = !user
    ? "/login"
    : user.role === "employer" || user.role === "sub_admin" || user.role === "admin"
    ? "/dashboard/stories/new"
    : "/dashboard";

  return (
    <section className="py-12 bg-white border-b border-border/40 overflow-hidden">
      <div className="container-site relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[14px] font-black text-brand-blue uppercase tracking-[0.2em] flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
            Live Highlights
          </h2>

          <div className="flex gap-2.5">
            <button
              onClick={() => scroll("left")}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                showLeft ? "bg-white text-brand-blue border-border hover:bg-brand-blue-muted shadow-sm" : "bg-transparent text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
              }`}
              disabled={!showLeft}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                showRight ? "bg-white text-brand-blue border-border hover:bg-brand-blue-muted shadow-sm" : "bg-transparent text-muted-foreground border-border/40 cursor-not-allowed opacity-50"
              }`}
              disabled={!showRight}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative group">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-1"
          >
            <Link
              href={postStoryHref}
              className="flex-shrink-0 w-[140px] h-[220px] sm:w-[160px] sm:h-[250px] rounded-[24px] border-2 border-dashed border-border hover:border-brand-blue/50 flex flex-col items-center justify-center gap-4 group/btn transition-all bg-secondary/20 hover:bg-brand-blue-muted/30"
            >
              <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover/btn:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <span className="text-[13px] font-black text-foreground/50 group-hover/btn:text-brand-blue tracking-tight">Post Story</span>
            </Link>

            {stories.map((story, i) => (
              <button
                key={story.id}
                onClick={() => setViewerIndex(i)}
                className="flex-shrink-0 w-[140px] h-[220px] sm:w-[160px] sm:h-[250px] rounded-[24px] overflow-hidden relative group cursor-pointer border border-border/40 shadow-sm hover:shadow-2xl hover:border-brand-blue/40 transition-all duration-500 text-left"
              >
                <JobPosterImage image={story.image} title={story.title} company={story.company} className="w-full h-full" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80" />

                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[12px] sm:text-[13px] font-black text-white line-clamp-2 leading-[1.2] tracking-tight">
                    {story.title}
                  </p>
                </div>

                <div className="absolute top-4 left-4 w-9 h-9 rounded-full border-2 border-brand-blue p-0.5 shadow-2xl backdrop-blur-sm">
                  <div className="w-full h-full rounded-full bg-brand-blue/30" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewerIndex !== null && (
        <StoryViewer stories={stories} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </section>
  );
}
