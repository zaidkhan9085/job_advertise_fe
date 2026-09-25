import { searchJobLocations } from "@/lib/api";
import type { LocationValue } from "@/components/common/CityAutocomplete";

// Best-effort match against the real location tree -- searchJobLocations
// only does a prefix match on a single name, so a compound string like
// "Dubai, UAE" or "Delhi, India" is split into tokens (most specific first)
// and each is tried in turn. Only an exact (or unambiguous single-result)
// match is returned; anything weaker is left for the recruiter to pick
// manually rather than risk silently attaching the wrong location. Shared
// by the Post Job and Post Story AI poster-scan flows.
export async function resolveBestLocationMatch(text: string): Promise<LocationValue | null> {
  const tokens = text.split(/[,/-]/).map((t) => t.trim()).filter(Boolean);
  for (const token of tokens) {
    try {
      const results = await searchJobLocations(token);
      const exact = results.find((r) => r.name.toLowerCase() === token.toLowerCase());
      if (exact) return exact;
      if (results.length === 1 && results[0].name.toLowerCase().startsWith(token.toLowerCase())) {
        return results[0];
      }
    } catch {
      // Best-effort only — a failed lookup just means no auto-match.
    }
  }
  return null;
}
