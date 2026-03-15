"use client";

import { Plus, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const STORIES = [
  { id: 1, title: "Construction Job | UAE", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 2, title: "Mechanical Design | Qatar", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 3, title: "Oil & Gas | Saudi Arabia", image: "https://images.unsplash.com/photo-1516195851888-6f1a981a8a2a?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 4, title: "Healthcare Staff | Oman", image: "https://images.unsplash.com/photo-1505751172107-160bf2825b7a?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 5, title: "Hospitality | Kuwait", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 6, title: "IT Developer | Bahrain", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 7, title: "Logistics Mgr | Russia", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 8, title: "Civil Engineer | Singapore", image: "https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 9, title: "Electrical Tech | Malaysia", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 10, title: "HR Business | Germany", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&h=450&auto=format&fit=crop" },
  { id: 11, title: "Fin Analyst | Poland", image: "https://images.unsplash.com/photo-1454165833767-131435bb1500?q=80&w=300&h=450&auto=format&fit=crop" },
];

function StoryImage({ src, alt }: { src: string, alt: string }) {
  const [error, setError] = useState(false);

  return (
    <div className="w-full h-full bg-secondary/50 flex items-center justify-center relative overflow-hidden">
      {!error ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
          <ImageIcon className="w-8 h-8" />
          <span className="text-[10px] font-medium">No Preview</span>
        </div>
      )}
    </div>
  );
}

export default function StoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

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
            {/* Create Story Card */}
            <button className="flex-shrink-0 w-[140px] h-[220px] sm:w-[160px] sm:h-[250px] rounded-[24px] border-2 border-dashed border-border hover:border-brand-blue/50 flex flex-col items-center justify-center gap-4 group/btn transition-all bg-secondary/20 hover:bg-brand-blue-muted/30">
              <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover/btn:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <span className="text-[13px] font-black text-foreground/50 group-hover/btn:text-brand-blue tracking-tight">Post Story</span>
            </button>

            {/* Story Cards */}
            {STORIES.map((story) => (
              <div
                key={story.id}
                className="flex-shrink-0 w-[140px] h-[220px] sm:w-[160px] sm:h-[250px] rounded-[24px] overflow-hidden relative group cursor-pointer border border-border/40 shadow-sm hover:shadow-2xl hover:border-brand-blue/40 transition-all duration-500"
              >
                <StoryImage src={story.image} alt={story.title} />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80" />
                
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[12px] sm:text-[13px] font-black text-white line-clamp-2 leading-[1.2] tracking-tight">
                    {story.title}
                  </p>
                </div>

                {/* Status Ring */}
                <div className="absolute top-4 left-4 w-9 h-9 rounded-full border-2 border-brand-blue p-0.5 shadow-2xl backdrop-blur-sm">
                  <div className="w-full h-full rounded-full bg-brand-blue/30" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
