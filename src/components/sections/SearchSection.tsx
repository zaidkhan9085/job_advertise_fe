"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchSection() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="py-8 md:py-10 bg-white">
      <div className="container-site">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl font-black text-foreground tracking-tight mb-2">
            Find Verified India, Gulf &amp; Overseas Jobs Faster
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
            <button type="submit" className="h-11 px-6 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-medium transition-colors shrink-0">
              Search Jobs
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
