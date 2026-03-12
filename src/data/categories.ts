export interface Category {
  id: string;
  label: string;
  type: "category" | "location";
}

export const jobCategories: Category[] = [
  { id: "vacancy", label: "Vacancy", type: "category" },
  { id: "asia-jobs", label: "Asia Jobs", type: "category" },
  { id: "bangladesh", label: "Bangladesh", type: "category" },
  { id: "indonesia", label: "Indonesia", type: "category" },
  { id: "malaysia", label: "Malaysia", type: "category" },
  { id: "nepal", label: "Nepal", type: "category" },
  { id: "singapore", label: "Singapore", type: "category" },
  { id: "australia", label: "Australia", type: "category" },
  { id: "canada", label: "Canada", type: "category" },
  { id: "europe-jobs", label: "Europe Jobs", type: "category" },
  { id: "gulf-jobs", label: "Gulf Jobs", type: "category" },
  { id: "bahrain", label: "Bahrain", type: "category" },
  { id: "kuwait", label: "Kuwait", type: "category" },
  { id: "oman", label: "Oman", type: "category" },
  { id: "other-gcc", label: "Other GCC", type: "category" },
  { id: "qatar", label: "Qatar", type: "category" },
  { id: "saudi-arabia", label: "Saudi Arabia", type: "category" },
  { id: "uae", label: "UAE", type: "category" },
  { id: "russia", label: "Russia", type: "category" },
];

export const searchLocations: Category[] = [
  { id: "nearby-jobs", label: "Nearby Jobs", type: "location" },
  { id: "east-india", label: "East India", type: "location" },
  { id: "europe", label: "Europe", type: "location" },
  { id: "gcc", label: "GCC", type: "location" },
  { id: "north-india", label: "North India", type: "location" },
  { id: "south-india", label: "South India", type: "location" },
  { id: "west-india", label: "West India", type: "location" },
];
