import { FileCheck, BookOpen, AlertCircle } from "lucide-react";
import DecorativeBlur from "@/components/common/DecorativeBlur";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/10 -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <BookOpen className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Legal Framework</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Terms of <span className="text-brand-blue-light italic">Service</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Please read these terms carefully before using the Gulf Jobs Advertise platform.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container-site">
        <div className="max-w-4xl mx-auto prose prose-brand">
          <div className="flex items-center gap-3 p-6 rounded-2xl bg-brand-blue-muted/30 border border-brand-blue/10 mb-12">
            <FileCheck className="w-6 h-6 text-brand-blue" />
            <span className="text-sm font-bold text-brand-blue">Effective Date: March 15, 2026</span>
          </div>

          <div className="space-y-12 text-muted-foreground font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">1. Acceptance of Terms</h2>
              <p>By accessing or using the Gulf Jobs Advertise website and services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">2. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-4">
                <li>You must provide accurate and complete information during registration.</li>
                <li>You are responsible for maintaining the security of your account credentials.</li>
                <li>You agree not to use the platform for any illegal or unauthorized purpose.</li>
                <li>Job postings must represent legitimate, existing opportunities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">3. Platform Fees and Payments</h2>
              <p>Certain services auf the platform are paid. All fees are clearly stated at the time of purchase. Payments are processed securely and are generally non-refundable unless specified otherwise.</p>
            </section>

            <section className="p-8 rounded-[32px] border border-brand-blue/15 bg-brand-blue-muted/30">
               <h3 className="text-lg font-black text-brand-blue mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Important Notice
               </h3>
               <p className="text-brand-blue/70 text-sm">
                 Gulf Jobs Advertise acts as a platform for connection. We do not guarantee employment or the accuracy of job postings by third parties. Users should perform their own due diligence before accepting offers.
               </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
