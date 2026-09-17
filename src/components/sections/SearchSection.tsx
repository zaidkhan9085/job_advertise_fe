"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import CityAutocomplete, { type LocationValue } from "@/components/common/CityAutocomplete";
import { slugify } from "@/lib/utils";

const POPULAR_SEARCHES = ["Safety Officer", "Electrician", "HVAC Technician", "Welder", "Heavy Driver", "IT Jobs"];

export default function SearchSection() {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    // Same ?location=<slug> contract /jobs already resolves back to a real
    // location via its own search-and-match round trip (see RegionsSection).
    if (location) params.set("location", slugify(location.name));
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="py-8 md:py-10 bg-white">
      <div className="container-site">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl font-black text-foreground tracking-tight mb-2">
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
            <div className="sm:w-64">
              <CityAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Any Location"
                inputClassName="w-full h-11 pl-10 pr-9 border-none outline-none bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground truncate"
              />
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
