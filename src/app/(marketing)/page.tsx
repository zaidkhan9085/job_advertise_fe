import HeroSection from "@/components/sections/HeroSection";
import FeaturedJobsSection from "@/components/sections/FeaturedJobsSection";
import IndustrySection from "@/components/sections/IndustrySection";
import RegionsSection from "@/components/sections/RegionsSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import CTASections from "@/components/sections/CTASections";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SafetySection from "@/components/sections/SafetySection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedJobsSection />
      <IndustrySection />
      <RegionsSection />
      <HowItWorksSection />
      <CTASections />
      <PricingSection />
      <TestimonialsSection />
      <SafetySection />
    </>
  );
}
