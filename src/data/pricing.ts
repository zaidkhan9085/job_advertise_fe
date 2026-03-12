export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  subPeriod?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular: boolean;
  highlight?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Golden Package",
    highlight: "Recommended",
    price: "₹ 2,999.00",
    period: "/ 30 days",
    subPeriod: "Per Package | Monthly Plan",
    description: "Premium exposure with priority listings and live support.",
    features: [
      "200 Website Jobs Listing",
      "30 Feature Ads (Top View)",
      "Social Media Promotion",
      "200 Regular Listings",
      "30 Featured Listings",
      "Live Chat Included"
    ],
    cta: "Choose Golden",
    href: "/pricing",
    popular: true,
  },
  {
    name: "Silver Package",
    price: "₹ 999.00",
    period: "/ 30 days",
    subPeriod: "Per Package | Monthly Plan",
    description: "Standard visibility for small teams and quick hires.",
    features: [
      "50 Website Jobs Listing",
      "5 Feature Ads",
      "50 Regular Listings",
      "5 Featured Listings",
      "Live Chat Included"
    ],
    cta: "Choose Silver",
    href: "/pricing",
    popular: false,
  },
  {
    name: "Free Package",
    price: "₹ 0.00",
    period: "/ 30 days",
    subPeriod: "Per Package",
    description: "Basic entry plan for listing single vacancies.",
    features: [
      "5 Regular Listings",
      "Standard Visibility",
      "Community Dashboard",
      "Basic Support"
    ],
    cta: "Get Started",
    href: "/pricing",
    popular: false,
  },
];
