import StoriesSection from "@/components/sections/StoriesSection";
import SearchSection from "@/components/sections/SearchSection";
import HomeCTASection from "@/components/sections/HomeCTASection";
import TopCompaniesSection from "@/components/sections/TopCompaniesSection";
import PremiumAdsSection from "@/components/sections/PremiumAdsSection";
import GeneralAdsSection from "@/components/sections/GeneralAdsSection";
import IndustrySection from "@/components/sections/IndustrySection";
import RegionsSection from "@/components/sections/RegionsSection";
import TrustCTASection from "@/components/sections/TrustCTASection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";

export default function Home() {
  return (
    <>
      <SearchSection />
      <StoriesSection />
      <HomeCTASection />
      <PremiumAdsSection />
      <GeneralAdsSection />
      <IndustrySection />
      <RegionsSection />
      <TestimonialsSection />
      <TopCompaniesSection />
    </>
  );
}
