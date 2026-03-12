import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, Clock, Building, DollarSign, Calendar, Share2, Heart, MessageCircle, AlertCircle, Phone, ArrowUpRight } from "lucide-react";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  // Using hardcoded mock data for the layout structure as requested for Phase 2
  const mockJob = {
    id: params.id,
    title: "Senior Site Engineer (High-Rise Building)",
    company: "Global Construction Co.",
    location: "Riyadh, Saudi Arabia",
    type: "Contract",
    workplace: "On-site",
    salary: "8,000 - 12,000 SAR / month",
    experience: "5-7 Years",
    postedAt: "3 days ago",
    category: "Construction & Engineering",
    description: "We are urgently looking for a highly skilled Senior Site Engineer to join our team in Riyadh for an upcoming commercial high-rise project. The ideal candidate will have extensive experience managing large-scale operations in the GCC region, ensuring quality and safety standards are exceeded.",
    responsibilities: [
      "Manage and oversee day-to-day site operations and subcontractor activities.",
      "Ensure construction is carried out accurately, following approved plans and specifications.",
      "Maintain strict adherence to safety and quality control policies.",
      "Prepare daily progress reports and resolve on-site technical issues.",
      "Coordinate with the project manager and design team on material approvals."
    ],
    requirements: [
      "B.Sc in Civil Engineering or related field.",
      "Minimum 5 years of proven experience in high-rise building projects.",
      "Strong leadership and communication skills in English (Arabic is a plus).",
      "In-depth knowledge of construction procedures, equipment, and OSH guidelines.",
      "Valid passport and ready to mobilize within 30 days."
    ],
    benefits: [
      "Free fully-furnished accommodation",
      "Annual return flight ticket to home country",
      "Comprehensive medical insurance",
      "Transportation to and from the site",
      "30 days paid annual leave"
    ],
    whatsapp: "https://wa.me/971500000000",
    phone: "+971500000000"
  };

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      
      {/* Top Banner Area */}
      <div className="bg-[oklch(0.12_0.02_260)] text-white pt-8 pb-32">
        <div className="container-site">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex gap-4 sm:gap-6 items-start">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shrink-0 flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
                <Building className="w-8 h-8 text-[oklch(0.12_0.02_260)] opacity-50" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
                  {mockJob.title}
                </h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-sm sm:text-base font-medium text-white/80">
                  <span className="flex items-center gap-1.5"><Building className="w-5 h-5 opacity-70" /> {mockJob.company}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-5 h-5 opacity-70" /> {mockJob.location}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-5 h-5 opacity-70" /> Posted {mockJob.postedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button className="flex-1 flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="flex-1 flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-site relative -mt-20 z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column (Job Details) */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Quick Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Salary", value: mockJob.salary, icon: DollarSign },
                { label: "Job Type", value: mockJob.type, icon: Briefcase },
                { label: "Experience", value: mockJob.experience, icon: Clock },
                { label: "Workplace", value: mockJob.workplace, icon: Building },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-[var(--shadow-card)] border border-border/60">
                  <stat.icon className="w-6 h-6 text-[oklch(0.47_0.20_250)] mb-3" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="font-semibold text-sm text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Description Container */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[var(--shadow-card)] border border-border/60 space-y-8">
              
              <section>
                <h3 className="text-lg font-bold text-foreground mb-4">Job Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {mockJob.description}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-4">Key Responsibilities</h3>
                <ul className="space-y-3">
                  {mockJob.responsibilities.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.68_0.21_45)] mt-2 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-4">Requirements & Qualifications</h3>
                <ul className="space-y-3">
                  {mockJob.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.47_0.20_250)] mt-2 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-4">Benefits & Perks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockJob.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium text-sm">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        ✓
                      </div>
                      {benefit}
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>

          {/* Right Column (Sidebar CTA) */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Action Box */}
            <div className="bg-white p-6 rounded-2xl border border-[oklch(0.68_0.21_45)]/30 shadow-[var(--shadow-card)]">
              <h3 className="font-bold text-lg mb-2">Ready to Apply?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Ensure your resume is updated and targeted towards this role.
              </p>
              
              <div className="space-y-3">
                <Link 
                  href={`/login`}
                  className="w-full flex items-center justify-center gap-2 bg-[oklch(0.68_0.21_45)] text-white hover:bg-[oklch(0.55_0.22_45)] py-3 px-4 rounded-xl font-bold transition-colors shadow-sm"
                >
                  <ArrowUpRight className="w-5 h-5" /> Quick Apply
                </Link>
                
                {mockJob.whatsapp && (
                  <a 
                    href={mockJob.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 py-3 px-4 rounded-xl font-bold transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                  </a>
                )}
                
                {mockJob.phone && (
                  <a 
                    href={`tel:${mockJob.phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-secondary text-foreground hover:bg-border/60 py-3 px-4 rounded-xl font-bold transition-colors"
                  >
                    <Phone className="w-5 h-5" /> Call Agency
                  </a>
                )}
              </div>
            </div>

            {/* Safety Warning */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold block mb-1">Safety First</span>
                Never pay money to an employer for recruitment processing, visa fees, or interviews. Real agencies do not charge candidates.
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
