import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import DecorativeBlur from "@/components/common/DecorativeBlur";
import { SUPPORT_EMAIL } from "@/data/socialLinks";

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/10 -translate-y-1/2 translate-x-1/2" />
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
            <span className="text-sm font-bold text-brand-blue">Last Updated: September 2026</span>
          </div>

          <div className="space-y-12 text-muted-foreground font-medium leading-relaxed">
            <p>
              At thejobs4u, we value the trust you place in us as a platform connecting job seekers with
              verified employers and recruitment agencies across Gulf, Europe, and Asia. This Privacy
              Policy explains how we collect, use, store, and protect your personal information. Our goal
              is to maintain transparency and safeguard your privacy at every step. By using our website,
              you agree to the terms outlined below.
            </p>

            <p>
              <strong className="text-foreground">Job seekers use thejobs4u completely free of charge.</strong>{" "}
              Employers may optionally subscribe to our Pro plan or purchase credits for candidate database
              access. Payments are processed securely by Razorpay — we receive only a transaction reference
              and payment status, and we never store your card, UPI, or banking credentials on our servers.
            </p>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">1. Information We Collect</h2>
              <p className="mb-4">
                We collect data to enhance your experience and facilitate smooth interactions between job
                seekers and employers. The type of information we gather depends on how you use our
                platform.
              </p>

              <h3 className="text-lg font-black text-foreground mb-3 mt-6">For Job Seekers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal details: name, email address, phone number, and location.</li>
                <li>Professional details: job role, work experience, qualifications, and resume (if uploaded).</li>
                <li>Any other details you choose to add to your profile.</li>
              </ul>

              <h3 className="text-lg font-black text-foreground mb-3 mt-6">For Employers</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Company details: name, location, industry, contact number, and email.</li>
                <li>Job listings: company names, job descriptions, and related information.</li>
                <li>Billing details tied to your plan or credit purchases (see below).</li>
              </ul>

              <h3 className="text-lg font-black text-foreground mb-3 mt-6">General Website Use</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Technical data: IP address, browser type, device information, and cookies to improve site performance and user experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">2. How We Use Your Information</h2>
              <p>
                For job seekers, your profile helps employers find and shortlist suitable candidates. If
                you opt in, we may also notify you about new job listings or website updates. For
                employers, your data lets us process your plan or credit purchases, run the platform, and
                communicate important account or billing updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">3. Who Can View Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Candidate profiles:</strong> your full profile
                  details (skills, experience, contact info) are only visible to an employer after they
                  spend credits to unlock your resume or full profile in our ATS search — they are never
                  visible to the public or other candidates.
                </li>
                <li>
                  <strong className="text-foreground">Employer/company profiles:</strong> company details
                  and job listings are publicly visible to ensure transparency for job seekers.
                </li>
                <li>
                  <strong className="text-foreground">Reviews:</strong> any rating or review you submit
                  about a company will be visible to other users.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">4. How We Protect Your Data</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Secure encryption to safeguard data during transfer and storage.</li>
                <li>Admin review of every employer before their job posts go live.</li>
                <li>Regular security updates to prevent unauthorized access, data loss, or misuse.</li>
              </ul>
              <p className="mt-4">
                While we take all reasonable precautions, no online platform is completely risk-free. By
                using thejobs4u, you acknowledge that you share information at your own discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">5. Sharing Your Information</h2>
              <p className="mb-4">We do not sell, trade, or rent your personal information. We may share data in the following cases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">With employers:</strong> a candidate&apos;s profile is shared with an employer once they unlock it, to facilitate hiring.</li>
                <li><strong className="text-foreground">With service providers:</strong> trusted partners (hosting, analytics, payment processing) who assist in operating the platform, bound by confidentiality.</li>
                <li><strong className="text-foreground">When required by law:</strong> to comply with legal obligations or protect the rights and safety of our users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your browsing experience, keep you
                signed in, and understand site performance. You can manage cookie preferences through your
                browser settings, but disabling cookies may affect certain website features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">7. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Update or modify your profile at any time through your account settings.</li>
                <li>
                  Request deletion of your account and data by writing to{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-blue font-bold hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                  . We will action the request and confirm once complete.
                </li>
                <li>Opt out of marketing emails or notifications through account settings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">8. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party sites, such as employer websites. We do not
                control these external sites and recommend reviewing their own privacy policies before
                sharing personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy as needed to reflect changes in our services or legal
                requirements. Any updates will be posted on this page, along with the last updated date.
              </p>
            </section>

            <section className="p-10 rounded-[40px] border border-brand-blue/15 bg-brand-blue-muted/30">
              <h3 className="text-lg font-black text-brand-blue mb-4">Questions?</h3>
              <p className="text-sm mb-4">
                If you have any questions or concerns about this Privacy Policy, please reach out to us. See
                also our{" "}
                <Link href="/refund" className="text-brand-blue font-bold hover:underline">
                  Refund Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-brand-blue font-bold hover:underline">
                  Terms &amp; Conditions
                </Link>
                .
              </p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-blue font-black hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
