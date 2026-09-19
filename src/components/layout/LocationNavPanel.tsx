"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import CityAutocomplete, { type LocationValue } from "@/components/common/CityAutocomplete";
import { slugify } from "@/lib/utils";

// Replaces "Nearby Jobs" -- that was a hand-maintained tree of India
// states/Gulf/Asia countries duplicating what a real location search
// already does better. Reuses the exact same search-as-you-type picker as
// the homepage hero, so a recruiter or candidate gets one consistent way
// to find a location everywhere on the site.
export default function LocationNavPanel({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState<LocationValue | null>(null);

  const handleChange = (location: LocationValue | null) => {
    setValue(location);
    if (location) {
      router.push(`/jobs?location=${slugify(location.name)}`);
      onNavigate();
    }
  };

  return (
    <div className="absolute top-full left-0 pt-3 z-50">
      <div className="w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(200,66,44,0.15)] border border-border/40 p-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
        <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
          <MapPin className="w-3.5 h-3.5 text-brand-blue" /> Find jobs by location
        </p>
        <CityAutocomplete
          value={value}
          onChange={handleChange}
          placeholder="City, state, or country..."
        />
      </div>
    </div>
  );
}
