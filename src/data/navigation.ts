export interface NavDropdownItem {
  label: string;
  href: string;
  subItems?: NavDropdownItem[];
}

export interface NavItem {
  label: string;
  href: string;
  dropdownItems?: NavDropdownItem[];
}

export const indiaStates: NavDropdownItem[] = [
  { label: "Maharashtra", href: "/jobs?location=maharashtra" },
  { label: "Delhi / NCR", href: "/jobs?location=delhi" },
  { label: "Karnataka", href: "/jobs?location=karnataka" },
  { label: "Tamil Nadu", href: "/jobs?location=tamil-nadu" },
  { label: "Gujarat", href: "/jobs?location=gujarat" },
  { label: "Telangana", href: "/jobs?location=telangana" },
  { label: "Uttar Pradesh", href: "/jobs?location=uttar-pradesh" },
  { label: "West Bengal", href: "/jobs?location=west-bengal" },
  { label: "Kerala", href: "/jobs?location=kerala" },
  { label: "Punjab", href: "/jobs?location=punjab" },
  { label: "Haryana", href: "/jobs?location=haryana" },
  { label: "Rajasthan", href: "/jobs?location=rajasthan" },
  { label: "Andhra Pradesh", href: "/jobs?location=andhra-pradesh" },
  { label: "Bihar", href: "/jobs?location=bihar" },
  { label: "Madhya Pradesh", href: "/jobs?location=madhya-pradesh" },
  { label: "Chhattisgarh", href: "/jobs?location=chhattisgarh" },
  { label: "Jharkhand", href: "/jobs?location=jharkhand" },
  { label: "Odisha", href: "/jobs?location=odisha" },
  { label: "Assam", href: "/jobs?location=assam" },
  { label: "Uttarakhand", href: "/jobs?location=uttarakhand" },
  { label: "Himachal Pradesh", href: "/jobs?location=himachal-pradesh" },
  { label: "Jammu & Kashmir", href: "/jobs?location=jammu-kashmir" },
  { label: "Goa", href: "/jobs?location=goa" },
];

export const industryItems: NavDropdownItem[] = [
  { label: "Oil & Gas, Petrochemical & Refinery", href: "/jobs?industry=oil-gas" },
  { label: "Power Plant, Substation, Energy & Gas Turbine", href: "/jobs?industry=power-plant" },
  { label: "Water Treatment Plant (WTP), RO & STP", href: "/jobs?industry=water-treatment" },
  { label: "Building Construction, Infrastructure & EPC Projects", href: "/jobs?industry=construction" },
  { label: "Manufacturing & Production", href: "/jobs?industry=manufacturing" },
  { label: "Facility Management & MEP", href: "/jobs?industry=facility-management" },
  { label: "Healthcare & Hospitality", href: "/jobs?industry=healthcare" },
  { label: "IT, Hardware, Software & Telecom", href: "/jobs?industry=it" },
  { label: "Marine, Maritime, Aviation & Offshore", href: "/jobs?industry=marine" },
  { label: "Banking, Finance & Non-IT Services", href: "/jobs?industry=banking-finance" },
  { label: "HR, Admin, Back Office & BPO / Telecaller", href: "/jobs?industry=hr-admin" },
  { label: "Logistics, Transportation, Shipping & Supply Chain", href: "/jobs?industry=logistics" },
  { label: "FMCG (Fast-Moving Consumer Goods)", href: "/jobs?industry=fmcg" },
  { label: "Design, Drafting, Engineering & Consultancy", href: "/jobs?industry=design-engineering" },
  { label: "Heavy Industries, Steel, Cement & Mining", href: "/jobs?industry=heavy-industries" },
  { label: "Education, Training & Skill Development", href: "/jobs?industry=education" },
  { label: "Other Industries", href: "/jobs?industry=other" },
];

export const nearbyJobsItems: NavDropdownItem[] = [
  { 
    label: "All India States", 
    href: "/jobs?location=india",
    subItems: indiaStates
  },
  { 
    label: "Gulf Jobs", 
    href: "/jobs?location=gulf",
    subItems: [
      { label: "UAE", href: "/jobs?location=uae" },
      { label: "Saudi Arabia", href: "/jobs?location=saudi-arabia" },
      { label: "Qatar", href: "/jobs?location=qatar" },
      { label: "Oman", href: "/jobs?location=oman" },
      { label: "Kuwait", href: "/jobs?location=kuwait" },
      { label: "Bahrain", href: "/jobs?location=bahrain" },
      { label: "Iran", href: "/jobs?location=iran" },
      { label: "Iraq", href: "/jobs?location=iraq" },
      { label: "Turkey", href: "/jobs?location=turkey" },
    ]
  },
  {
    label: "Asia Jobs",
    href: "/jobs?location=asia",
    subItems: [
      { label: "Singapore", href: "/jobs?location=singapore" },
      { label: "Malaysia", href: "/jobs?location=malaysia" },
      { label: "Thailand", href: "/jobs?location=thailand" },
      { label: "Indonesia", href: "/jobs?location=indonesia" },
      { label: "Philippines", href: "/jobs?location=philippines" },
      { label: "Jobs in Japan", href: "/jobs?location=japan" },
      { label: "South Korea", href: "/jobs?location=south-korea" },
    ]
  },
  { label: "Europe", href: "/jobs?location=europe" },
];

export const vacancyItems: NavDropdownItem[] = [
  { 
    label: "Jobs in Gulf", 
    href: "/jobs?category=gulf-jobs",
    subItems: [
      { label: "Jobs in UAE", href: "/jobs?location=uae" },
      { label: "Jobs in Saudi Arabia", href: "/jobs?location=saudi-arabia" },
      { label: "Jobs in Qatar", href: "/jobs?location=qatar" },
      { label: "Jobs in Oman", href: "/jobs?location=oman" },
      { label: "Jobs in Kuwait", href: "/jobs?location=kuwait" },
      { label: "Jobs in Bahrain", href: "/jobs?location=bahrain" },
      { label: "Jobs in Iran", href: "/jobs?location=iran" },
      { label: "Jobs in Iraq", href: "/jobs?location=iraq" },
      { label: "Jobs in Turkey", href: "/jobs?location=turkey" },
    ]
  },
  { 
    label: "Jobs in Asia", 
    href: "/jobs?category=asia-jobs",
    subItems: [
      { label: "Jobs in Singapore", href: "/jobs?location=singapore" },
      { label: "Jobs in Malaysia", href: "/jobs?location=malaysia" },
      { label: "Jobs in Thailand", href: "/jobs?location=thailand" },
      { label: "Jobs in Indonesia", href: "/jobs?location=indonesia" },
      { label: "Jobs in Philippines", href: "/jobs?location=philippines" },
      { label: "Jobs in Japan", href: "/jobs?location=japan" },
      { label: "Jobs in South Korea", href: "/jobs?location=south-korea" },
    ]
  },
  { 
    label: "Jobs in Russia & Other Countries", 
    href: "/jobs?category=other-countries",
    subItems: [
      { label: "Jobs in Russia", href: "/jobs?location=russia" },
      { label: "Jobs in Kazakhstan", href: "/jobs?location=kazakhstan" },
      { label: "Jobs in Uzbekistan", href: "/jobs?location=uzbekistan" },
      { label: "Jobs in Azerbaijan", href: "/jobs?location=azerbaijan" },
      { label: "Jobs in Georgia", href: "/jobs?location=georgia" },
      { label: "Jobs in Israel", href: "/jobs?location=israel" },
      { label: "Jobs in Jordan", href: "/jobs?location=jordan" },
      { label: "Jobs in Africa", href: "/jobs?location=africa" },
    ]
  },
  { 
    label: "Jobs in India", 
    href: "/jobs?category=india-jobs",
    subItems: indiaStates
  },
  { label: "Jobs in Europe", href: "/jobs?category=europe-jobs" },
  { label: "Jobs in Australia", href: "/jobs?category=australia" },
  { label: "Jobs in Canada", href: "/jobs?category=canada" },
  { label: "Jobs in New Zealand", href: "/jobs?category=new-zealand" },
];

export const mainNavItems: NavItem[] = [
  { label: "Industry", href: "/jobs", dropdownItems: industryItems },
  { label: "Nearby Jobs", href: "/jobs?type=nearby", dropdownItems: nearbyJobsItems },
  { label: "Jobs Opening", href: "/jobs?type=vacancy", dropdownItems: vacancyItems },
  { label: "Resume Builder", href: "/resume-builder" },
  { label: "Submit Resume", href: "/resume" },
  { label: "Candidates Login", href: "/login" },
];

export const authNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Post Jobs", href: "/post-job" },
];
