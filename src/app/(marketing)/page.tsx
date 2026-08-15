import StoriesSection from "@/components/sections/StoriesSection";
import SearchSection from "@/components/sections/SearchSection";
import HomeCTASection from "@/components/sections/HomeCTASection";
import PremiumAdsSection from "@/components/sections/PremiumAdsSection";
import GeneralAdsSection from "@/components/sections/GeneralAdsSection";
import IndustrySection from "@/components/sections/IndustrySection";
import RegionsSection from "@/components/sections/RegionsSection";
import TrustCTASection from "@/components/sections/TrustCTASection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SafetySection from "@/components/sections/SafetySection";

export default function Home() {
  return (
    <>
      <StoriesSection />
      <SearchSection />
      <HomeCTASection />
      <PremiumAdsSection />
      <GeneralAdsSection />
      <IndustrySection />
      <RegionsSection />
      <TestimonialsSection />
      <SafetySection />
    </>
  );
}
