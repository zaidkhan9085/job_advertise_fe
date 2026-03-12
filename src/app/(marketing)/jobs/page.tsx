"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  ArrowRight, 
  Heart, 
  MessageCircle, 
  Phone, 
  Building,
  LayoutGrid,
  List as ListIcon,
  X
} from "lucide-react";
import { featuredJobs, type Job } from "@/data/jobs";

function JobsListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "Any Location");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "Any Category");
  const [activeType, setActiveType] = useState(searchParams.get("type") || "any");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Derived filtered jobs
  const filteredJobs = featuredJobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Detailed location/region matching
    const matchesLocation = selectedLocation === "Any Location" || 
      job.location?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      (selectedLocation === "GCC" && job.location?.includes("UAE")) ||
      (selectedLocation === "GCC" && job.location?.includes("Saudi")) ||
      (selectedLocation === "GCC" && job.location?.includes("Qatar"));
    
    const matchesCategory = selectedCategory === "Any Category" || 
      job.category.toLowerCase().includes(selectedCategory.toLowerCase());

    // Basic type handling (vacancies usually map to certain categories)
    const matchesType = activeType === "any" || 
      (activeType === "vacancy" && job.badges.includes("New")) ||
      (activeType === "nearby" && (job.location?.includes("India") || job.location?.includes("GCC")));
    
    return matchesSearch && matchesLocation && matchesCategory && matchesType;
  });

  // Sync state with URL if needed (optional but good for UX)
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "Any Location" && value !== "Any Category") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      
      {/* Search Header Banner */}
      <div className="bg-[oklch(0.12_0.02_260)] text-white pt-16 pb-24 md:pt-20 md:pb-28 border-b border-border/20">
        <div className="container-site text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            {selectedLocation !== "Any Location" ? `Jobs in ${selectedLocation}` : 
             selectedCategory !== "Any Category" ? `${selectedCategory} Opportunities` : 
             "Find Your Dream Job Today"}
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Browse verified overseas job vacancies across the Middle East, Europe, and Asia.
          </p>
        </div>
      </div>

      {/* Main Search Interface overlapping the banner */}
      <div className="container-site relative -mt-10 mb-10 z-10 px-4">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-border/60">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary/50 border-none outline-none focus:ring-2 focus:ring-brand-orange transition-all font-medium text-foreground h-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-64 relative shrink-0">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary/50 border-none outline-none focus:ring-2 focus:ring-brand-orange transition-all font-medium text-foreground appearance-none h-full cursor-pointer"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option>Any Location</option>
                <option>Dubai, UAE</option>
                <option>Riyadh, Saudi Arabia</option>
                <option>GCC</option>
                <option>Europe</option>
                <option>India</option>
              </select>
            </div>
            <button className="md:w-36 flex items-center justify-center gap-2 bg-brand-orange text-white hover:bg-brand-orange-dark rounded-xl font-bold py-3.5 px-6 transition-colors shadow-sm shrink-0">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="container-site px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Filters</h3>
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3">Category</h4>
                  <div className="space-y-2">
                    {["Any Category", "Gulf Jobs", "Europe Jobs", "Asia Jobs", "Construction", "Saudi Arabia"].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="category"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(cat)}
                          className="w-4 h-4 text-brand-orange focus:ring-brand-orange border-border/60" 
                        />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/60">
                  <h4 className="text-sm font-bold text-foreground mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {["Full-time", "Contract", "Part-time"].map((type) => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 text-brand-orange rounded focus:ring-brand-orange border-border/60" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Job Listings Area */}
          <div className="flex-1 w-full space-y-4">
            
            {/* View Controls */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                 <h2 className="font-bold text-foreground">
                  Showing <span className="text-brand-orange">{filteredJobs.length}</span> jobs
                </h2>
                {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border/60 text-sm font-bold shadow-sm"
                >
                  <Filter className="w-4 h-4" /> Filter
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-lg border border-border/60 p-0.5 shadow-sm">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-secondary text-brand-orange shadow-inner" : "text-muted-foreground hover:text-foreground"}`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-secondary text-brand-orange shadow-inner" : "text-muted-foreground hover:text-foreground"}`}
                    title="List View"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium ml-2">
                  Sort by:
                  <select className="bg-transparent font-bold text-foreground outline-none cursor-pointer">
                    <option>Newest First</option>
                    <option>Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border/40 p-12 text-center shadow-sm">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground">No jobs found matching your criteria</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedLocation("Any Location"); setSelectedCategory("Any Category"); }}
                  className="mt-6 text-brand-orange font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5" : "space-y-4"}>
                {filteredJobs.map((job) => (
                  <JobCardView key={job.id} job={job} mode={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination Placeholder */}
            {filteredJobs.length > 0 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center gap-1">
                  <button className="px-4 py-2 rounded-xl border border-border/60 bg-white font-bold text-sm text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50" disabled>Previous</button>
                  <button className="px-4 py-2 rounded-xl bg-brand-orange text-white font-bold text-sm shadow-md">1</button>
                  <button className="px-4 py-2 rounded-xl border border-border/60 bg-white font-bold text-sm text-muted-foreground hover:bg-secondary transition-colors">2</button>
                  <button className="px-4 py-2 rounded-xl border border-border/60 bg-white font-bold text-sm text-muted-foreground hover:bg-secondary transition-colors">Next</button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[280px] bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-extrabold text-xl">Filters</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Mobile filters would go here */}
            <div className="space-y-8">
               <div>
                  <h4 className="text-sm font-bold text-foreground mb-3">Category</h4>
                  <div className="space-y-3">
                    {["Any Category", "Gulf Jobs", "Europe Jobs", "Asia Jobs"].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="mobile-cat"
                          checked={selectedCategory === cat}
                          onChange={() => { setSelectedCategory(cat); setIsSidebarOpen(false); }}
                          className="w-5 h-5 text-brand-orange focus:ring-brand-orange" 
                        />
                        <span className="text-base font-medium">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobCardView({ job, mode }: { job: Job; mode: "grid" | "list" }) {
  const [imgError, setImgError] = useState(false);
  const fallbackImg = "https://placehold.co/600x450/f8fafc/94a3b8?text=Image+Not+Available";
  const posterImg = imgError ? fallbackImg : (job.image || fallbackImg);

  if (mode === "grid") {
    return (
      <div className="group bg-white rounded-2xl border border-border/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/40">
           {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterImg}
            alt={job.imageAlt || job.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {job.badges.slice(0, 2).map(badge => (
              <span key={badge} className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-black/80 text-white backdrop-blur-sm">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <Link href={`/jobs/${job.id}`} className="block mb-3">
            <h3 className="font-extrabold text-lg leading-tight group-hover:text-brand-orange transition-colors line-clamp-2">
              {job.title}
            </h3>
          </Link>
          <div className="space-y-2 mb-4 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5"><Building className="w-4 h-4 text-brand-orange/60" /> {job.company}</div>
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-orange/60" /> {job.location}</div>
          </div>
          <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-1 bg-secondary rounded text-muted-foreground">{job.category}</span>
            <div className="flex items-center gap-2">
               {job.whatsapp && (
                <a href={job.whatsapp} target="_blank" className="p-2 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
               <Link href={`/jobs/${job.id}`} className="p-2 rounded-lg bg-secondary text-foreground hover:bg-border/60 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-border/60 p-4 sm:p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        <div className="w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-border/60">
           {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterImg}
            alt={job.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <Link href={`/jobs/${job.id}`}>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground group-hover:text-brand-orange transition-colors line-clamp-1 leading-snug">
                {job.title}
              </h3>
            </Link>
            <button className="shrink-0 w-8 h-8 rounded-full border border-border/60 text-muted-foreground flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm font-bold text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5"><Building className="w-4 h-4 opacity-70" /> {job.company}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-70" /> {job.location}</span>
            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 opacity-70" /> {job.type || "Full-time"}</span>
          </div>
          <div className="flex items-center gap-2">
            {job.badges.map(badge => (
              <span key={badge} className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="w-full sm:w-auto sm:border-l sm:border-border/60 sm:pl-6 flex flex-row sm:flex-col gap-2 shrink-0">
          {job.whatsapp && (
            <a href={job.whatsapp} target="_blank" className="flex-1 sm:w-32 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-[13px] transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          )}
          <Link href={`/jobs/${job.id}`} className="flex-1 sm:w-32 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-foreground hover:bg-border/60 font-bold text-[13px] transition-colors">
            Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/10 animate-pulse" />}>
      <JobsListingContent />
    </Suspense>
  );
}
