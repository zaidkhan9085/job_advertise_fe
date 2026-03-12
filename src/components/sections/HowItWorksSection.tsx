import { Search, Upload, Bell, CheckCircle, Users, FileText, Globe } from "lucide-react";

const seekerSteps = [
  {
    icon: Search,
    step: "01",
    title: "Search & Discover",
    description: "Use our smart search to find jobs by industry, location, salary, or company. Filter to your exact criteria.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Upload Your Resume",
    description: "Create a standout profile and upload your CV. Recruiters actively search our database for talent.",
  },
  {
    icon: Bell,
    step: "03",
    title: "Get Job Alerts",
    description: "Set custom alerts and receive instant notifications when matching roles are posted.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Apply & Get Hired",
    description: "Apply directly through the platform. Track your applications and hear back from employers fast.",
  },
];

const recruiterSteps = [
  {
    icon: FileText,
    step: "01",
    title: "Post Your Job",
    description: "Create a detailed job listing in minutes. Choose the right package to maximise visibility.",
  },
  {
    icon: Users,
    step: "02",
    title: "Search Our Talent Pool",
    description: "Access 2.4M+ registered candidates filtered by skill, experience, location, and availability.",
  },
  {
    icon: Globe,
    step: "03",
    title: "Reach the Right Audience",
    description: "Your listings are promoted across our network, job boards, and industry groups for maximum reach.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Hire with Confidence",
    description: "Shortlist, contact, and onboard the right candidates — all supported by our recruitment team.",
  },
];

function StepCard({
  icon: Icon,
  step,
  title,
  description,
  accent,
}: {
  icon: typeof Search;
  step: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: accent }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="w-px flex-1 bg-border/60 mt-3 mb-3 min-h-[24px] last-of-type:hidden" />
      </div>
      <div className="pb-8">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          Step {step}
        </div>
        <h3 className="font-bold text-foreground mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="section-padding bg-[oklch(0.975_0.005_250)]">
      <div className="container-site">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold text-[oklch(0.68_0.21_45)] uppercase tracking-widest mb-2">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Simple. Fast. Effective.</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Whether you&apos;re looking for a job or hiring talent, we&apos;ve made the process as simple as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-20">
          {/* Job Seekers */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[oklch(0.47_0.20_250)]/10 text-[oklch(0.47_0.20_250)] text-sm font-bold px-4 py-2 rounded-full mb-7">
              For Job Seekers
            </div>
            {seekerSteps.map((s) => (
              <StepCard key={s.step} {...s} accent="oklch(0.47 0.20 250)" />
            ))}
          </div>

          {/* Recruiters */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[oklch(0.68_0.21_45)]/10 text-[oklch(0.68_0.21_45)] text-sm font-bold px-4 py-2 rounded-full mb-7">
              For Recruiters
            </div>
            {recruiterSteps.map((s) => (
              <StepCard key={s.step} {...s} accent="oklch(0.68 0.21 45)" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
