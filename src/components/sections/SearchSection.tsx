"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

const POPULAR_SEARCHES = ["Safety Officer", "Electrician", "HVAC Technician", "Welder", "Heavy Driver", "IT Jobs"];

export default function SearchSection() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [location, setLocation] = useState("Any Location");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    if (location !== "Any Location") params.set("location", location);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="py-8 md:py-10 bg-white">
      <div className="container-site">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mb-2">
            Find verified Gulf &amp; overseas jobs, faster
          </h1>
          <p className="text-muted-foreground font-medium mb-5">
            Search live openings from real employers — no agency fees, ever.
          </p>

          <form onSubmit={submit} className="bg-white border border-border/60 rounded-2xl shadow-lg p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                type="text"
                placeholder="Job title, e.g. Electrician, Safety Officer"
                className="w-full h-11 border-none outline-none bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="hidden sm:block w-px bg-border self-center h-6" />
            <div className="flex items-center gap-2.5 px-3 sm:w-52">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-11 border-none outline-none bg-transparent text-sm font-medium text-foreground appearance-none cursor-pointer"
              >
                <option>Any Location</option>
                <option>Dubai, UAE</option>
                <option>Riyadh, Saudi Arabia</option>
                <option>GCC</option>
                <option>Europe</option>
                <option>India</option>
              </select>
            </div>
            <button type="submit" className="h-11 px-6 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-medium transition-colors shrink-0">
              Search Jobs
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mr-1">Popular:</span>
            {POPULAR_SEARCHES.map((s) => (
              <button
                key={s}
                onClick={() => router.push(`/jobs?q=${encodeURIComponent(s)}`)}
                className="text-xs font-bold text-foreground bg-secondary/60 hover:bg-secondary border border-border/60 hover:border-brand-blue/40 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
