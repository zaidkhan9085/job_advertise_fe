import StoriesSection from "@/components/sections/StoriesSection";
import PremiumAdsSection from "@/components/sections/PremiumAdsSection";
import GeneralAdsSection from "@/components/sections/GeneralAdsSection";

// Same home feed for every role (Admin/Recruiter/Candidate) — matches what a
// guest sees on the public homepage. Role-specific actions live in the
// sidebar (Manage Jobs, Pending Jobs, Post Story, etc.), not here.
export default function DashboardHome() {
  return (
    <>
      <StoriesSection />
      <PremiumAdsSection />
      <GeneralAdsSection />
    </>
  );
}
