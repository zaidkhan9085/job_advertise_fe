import { 
  Fuel, 
  Zap, 
  Droplets, 
  Building2, 
  Factory, 
  Wrench, 
  Stethoscope, 
  Monitor, 
  Ship, 
  Banknote, 
  Users2, 
  Truck, 
  ShoppingBag, 
  Compass, 
  HardHat, 
  GraduationCap, 
  MoreHorizontal 
} from "lucide-react";

export interface Industry {
  id: string;
  label: string;
  icon: any; // Lucide icon component
  jobCount: number;
  href: string;
}

export const industries: Industry[] = [
  { 
    id: "oil-gas", 
    label: "Oil & Gas, Petrochemical & Refinery", 
    icon: Fuel, 
    jobCount: 1240, 
    href: "/jobs?industry=oil-gas" 
  },
  { 
    id: "power-plant", 
    label: "Power Plant, Substation, Energy & Gas Turbine", 
    icon: Zap, 
    jobCount: 640, 
    href: "/jobs?industry=power-plant" 
  },
  { 
    id: "water-treatment", 
    label: "Water Treatment Plant (WTP), RO & STP", 
    icon: Droplets, 
    jobCount: 420, 
    href: "/jobs?industry=water-treatment" 
  },
  { 
    id: "construction", 
    label: "Building Construction, Infrastructure & EPC Projects", 
    icon: Building2, 
    jobCount: 980, 
    href: "/jobs?industry=construction" 
  },
  { 
    id: "manufacturing", 
    label: "Manufacturing & Production", 
    icon: Factory, 
    jobCount: 760, 
    href: "/jobs?industry=manufacturing" 
  },
  { 
    id: "facility-management", 
    label: "Facility Management & MEP", 
    icon: Wrench, 
    jobCount: 430, 
    href: "/jobs?industry=facility-management" 
  },
  { 
    id: "healthcare", 
    label: "Healthcare & Hospitality", 
    icon: Stethoscope, 
    jobCount: 520, 
    href: "/jobs?industry=healthcare" 
  },
  { 
    id: "it", 
    label: "IT, Hardware, Software & Telecom", 
    icon: Monitor, 
    jobCount: 1100, 
    href: "/jobs?industry=it" 
  },
  { 
    id: "marine", 
    label: "Marine, Maritime, Aviation & Offshore", 
    icon: Ship, 
    jobCount: 310, 
    href: "/jobs?industry=marine" 
  },
  { 
    id: "banking-finance", 
    label: "Banking, Finance & Non-IT Services", 
    icon: Banknote, 
    jobCount: 480, 
    href: "/jobs?industry=banking-finance" 
  },
  { 
    id: "hr-admin", 
    label: "HR, Admin, Back Office & BPO / Telecaller", 
    icon: Users2, 
    jobCount: 350, 
    href: "/jobs?industry=hr-admin" 
  },
  { 
    id: "logistics", 
    label: "Logistics, Transportation, Shipping & Supply Chain", 
    icon: Truck, 
    jobCount: 590, 
    href: "/jobs?industry=logistics" 
  },
  { 
    id: "fmcg", 
    label: "FMCG (Fast-Moving Consumer Goods)", 
    icon: ShoppingBag, 
    jobCount: 280, 
    href: "/jobs?industry=fmcg" 
  },
  { 
    id: "design-engineering", 
    label: "Design, Drafting, Engineering & Consultancy", 
    icon: Compass, 
    jobCount: 320, 
    href: "/jobs?industry=design-engineering" 
  },
  { 
    id: "heavy-industries", 
    label: "Heavy Industries, Steel, Cement & Mining", 
    icon: HardHat, 
    jobCount: 410, 
    href: "/jobs?industry=heavy-industries" 
  },
  { 
    id: "education", 
    label: "Education, Training & Skill Development", 
    icon: GraduationCap, 
    jobCount: 210, 
    href: "/jobs?industry=education" 
  },
  { 
    id: "other", 
    label: "Other Industries", 
    icon: MoreHorizontal, 
    jobCount: 290, 
    href: "/jobs?industry=other" 
  },
];
