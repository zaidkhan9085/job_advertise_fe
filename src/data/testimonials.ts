export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    role: "Senior Process Engineer",
    company: "ADNOC",
    quote: "I found my current role in UAE within 3 weeks of uploading my resume. The Jobs Advertise has the best collection of Gulf and Middle East engineering jobs I've seen.",
  },
  {
    id: "2",
    name: "Priya Nair",
    role: "HR Manager",
    company: "L&T Construction",
    quote: "We've been using TJA to post vacancies for 2 years. The quality of candidates—especially for EPC and offshore roles—is consistently excellent.",
  },
  {
    id: "3",
    name: "Mohammed Al-Farsi",
    role: "Electrical Superintendent",
    company: "Petrofac",
    quote: "Fantastic platform. Specific categories for oil & gas and power plant roles made it easy to find candidates with exactly the right industry backgrounds.",
  },
];

export const metrics = [
  { value: "50,000+", label: "Active Job Listings" },
  { value: "2.4M+", label: "Registered Candidates" },
  { value: "12,000+", label: "Hiring Companies" },
  { value: "40+", label: "Countries Covered" },
];
