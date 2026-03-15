import { ShieldCheck, FileText, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <Lock className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Data Protection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Privacy <span className="text-brand-blue-light italic">Policy</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Your trust is our most valuable asset. Learn how we protect and manage your professional data.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container-site">
        <div className="max-w-4xl mx-auto prose prose-brand">
          <div className="flex items-center gap-3 p-6 rounded-2xl bg-brand-blue-muted/30 border border-brand-blue/10 mb-12">
            <ShieldCheck className="w-6 h-6 text-brand-blue" />
            <span className="text-sm font-bold text-brand-blue">Last Updated: March 15, 2026</span>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-blue/5 text-brand-blue flex items-center justify-center text-sm">01</span>
                Information We Collect
              </h2>
              <div className="text-muted-foreground font-medium leading-relaxed space-y-4">
                <p>We collect information that you provide directly to us when you create an account, build a professional profile, or apply for jobs. This include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full name, email address, and contact details.</li>
                  <li>Professional experience, skills, and academic history.</li>
                  <li>Resume/CV files and portfolios.</li>
                  <li>Account preferences and communication settings.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-blue/5 text-brand-blue flex items-center justify-center text-sm">02</span>
                How We Use Your Data
              </h2>
              <div className="text-muted-foreground font-medium leading-relaxed space-y-4">
                <p>The primary purpose of collecting your data is to provide you with a world-class job-seeking and recruitment experience. We use your data to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Match candidates with relevant job opportunities.</li>
                  <li>Allow recruiters to discover and contact potential hires.</li>
                  <li>Communicate important updates regarding applications.</li>
                  <li>Improve our platform's algorithms and user experience.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-blue/5 text-brand-blue flex items-center justify-center text-sm">03</span>
                Cookies and Tracking
              </h2>
              <div className="text-muted-foreground font-medium leading-relaxed space-y-4">
                <p>We use cookies and similar technologies to remember your preferences and provide a personalized experience. You can control cookie settings through your browser at any time.</p>
              </div>
            </section>

            <section className="p-10 rounded-[40px] border border-brand-blue/15 bg-brand-blue-muted/30">
               <h3 className="text-lg font-black text-brand-blue mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-blue/40" /> Questions?
               </h3>
               <p className="text-muted-foreground font-medium text-sm mb-6">
                 If you have any questions about how your data is handled, please don't hesitate to reach out to our privacy officer.
               </p>
               <a href="mailto:privacy@thejobsadvertise.com" className="text-brand-blue font-black hover:underline">
                 privacy@thejobsadvertise.com
               </a>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
