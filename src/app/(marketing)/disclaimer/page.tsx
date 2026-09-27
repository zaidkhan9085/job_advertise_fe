import { AlertTriangle, ShieldAlert } from "lucide-react";
import DecorativeBlur from "@/components/common/DecorativeBlur";
import { SUPPORT_EMAIL } from "@/data/socialLinks";

export default function DisclaimerPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/10 -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <ShieldAlert className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Please Read</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Disclaimer
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            What thejobs4u is, what it isn&apos;t, and what to check before you apply.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container-site">
        <div className="max-w-4xl mx-auto prose prose-brand">
          <div className="space-y-12 text-muted-foreground font-medium leading-relaxed">
            <p>
              thejobs4u.com is an online platform designed to connect job seekers with employers and
              recruitment agencies across Gulf, Europe, and Asia. Our role is to share job-related
              information and provide a space where job seekers and employers can interact. While we strive
              to ensure that all job listings are genuine, we strongly advise users to exercise caution and
              due diligence when applying for any job.
            </p>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">Our Role</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li>thejobs4u is an information-sharing platform, not a recruitment agency. We do not engage in hiring, recruitment, or employment processing ourselves.</li>
                <li>We facilitate job connections by letting registered employers and recruitment agencies post job listings.</li>
                <li>Job seekers can contact employers directly through the Call, Apply, Email, or WhatsApp options available on each job posting.</li>
                <li>Our admin team moderates job postings and can approve, reject, or remove listings and employer accounts.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">User Responsibility</h2>
              <p>
                Although we take precautions to minimize fraudulent job postings, thejobs4u does not
                guarantee the accuracy or authenticity of every job listing or employer. Users are
                responsible for conducting their own research before applying for any job.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">Guidelines for Job Seekers</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-foreground">Research before applying:</strong> carefully review the job description and terms, and verify the employer independently through official websites and trusted sources.</li>
                <li><strong className="text-foreground">Verify the employer:</strong> before sharing your details, confirm that the employer or agency is genuine.</li>
                <li><strong className="text-foreground">Avoid advance payments:</strong> do not pay any fees upfront for a job application or offer. Legitimate employers do not ask candidates to pay for a job.</li>
                <li><strong className="text-foreground">Personal responsibility:</strong> any decision to apply for a job or engage with an employer is entirely at your own risk.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">No Liability</h2>
              <p>
                thejobs4u is not responsible for any disputes, financial losses, or employment-related
                issues that may arise between job seekers, employers, or recruitment agencies, including
                fraudulent postings, misrepresented roles or salaries, or changes to job terms after hiring.
                We serve as a neutral platform and do not endorse or guarantee the conduct of any employer
                or job seeker.
              </p>
            </section>

            <section className="p-8 rounded-[32px] border border-brand-blue/15 bg-brand-blue-muted/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
              <p className="text-brand-blue/70 text-sm">
                Come across a fraudulent posting or a suspicious employer? Report it to{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold hover:underline">
                  {SUPPORT_EMAIL}
                </a>{" "}
                and our team will investigate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">Agreement to Terms</h2>
              <p>
                By accessing thejobs4u, you acknowledge and agree to the terms outlined in this Disclaimer.
                Exercise caution and make informed decisions to ensure a safe and successful job search.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
