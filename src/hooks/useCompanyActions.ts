import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  followCompany,
  unfollowCompany,
  rateCompany,
  unrateCompany,
  blockCompany,
  unblockCompany,
  ApiError,
  type CompanyDetail,
} from "@/lib/api";

// Follow/rate/block, shared between the job detail page's company mini-card
// and the public company page -- extracted so both stay in sync with the
// same optimistic-update behavior instead of drifting apart over time.
// Owns its own copy of the company (seeded from `initial`, kept in sync
// whenever a fresh load replaces it) so callers just render `company`.
export function useCompanyActions(initial: CompanyDetail | null, { requireLogin }: { requireLogin: () => void }) {
  const [company, setCompany] = useState(initial);
  const [myRating, setMyRating] = useState(initial?.myRating ?? 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to a new load from the parent, not derived state
    setCompany(initial);
    setMyRating(initial?.myRating ?? 0);
  }, [initial]);

  const toggleFollow = async (isLoggedIn: boolean) => {
    if (!isLoggedIn) return requireLogin();
    if (!company) return;
    try {
      if (company.isFollowing) {
        await unfollowCompany(company.id);
        setCompany({ ...company, isFollowing: false, followerCount: company.followerCount - 1 });
      } else {
        const result = await followCompany(company.id);
        toast.success(result.message);
        setCompany({ ...company, isFollowing: true, followerCount: company.followerCount + 1 });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update follow status.");
    }
  };

  // Re-fetching the whole company after a rating change (rather than just
  // patching myRating locally) is deliberate -- it's the only way the
  // caller also gets the recomputed averageRating/ratingCount.
  const rate = async (
    isLoggedIn: boolean,
    rating: number,
    review: string | undefined,
    reload: () => Promise<CompanyDetail | void>
  ) => {
    if (!isLoggedIn) return requireLogin();
    if (!company) return;
    setMyRating(rating);
    try {
      const result = await rateCompany(company.id, rating, review);
      toast.success(result.message);
      const refreshed = await reload();
      if (refreshed) setCompany(refreshed);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit rating.");
    }
  };

  const clearRating = async (reload: () => Promise<CompanyDetail | void>) => {
    if (!company) return;
    setMyRating(0);
    try {
      const result = await unrateCompany(company.id);
      toast.success(result.message);
      const refreshed = await reload();
      if (refreshed) setCompany(refreshed);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove rating.");
    }
  };

  const toggleBlock = async (isLoggedIn: boolean) => {
    if (!isLoggedIn) return requireLogin();
    if (!company) return;
    if (!company.isBlocked && !confirm(`Block ${company.name}? Their jobs won't be shown to you anymore.`)) return;
    try {
      if (company.isBlocked) {
        const result = await unblockCompany(company.id);
        toast.success(result.message);
        setCompany({ ...company, isBlocked: false });
      } else {
        const result = await blockCompany(company.id);
        toast.success(result.message);
        setCompany({ ...company, isBlocked: true });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update block status.");
    }
  };

  return { company, myRating, toggleFollow, rate, clearRating, toggleBlock };
}
