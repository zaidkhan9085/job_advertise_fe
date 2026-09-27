import Link from "next/link";
import { FileCheck, BookOpen, AlertCircle } from "lucide-react";
import DecorativeBlur from "@/components/common/DecorativeBlur";
import { SUPPORT_EMAIL } from "@/data/socialLinks";

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
            Terms &amp; <span className="text-brand-blue-light italic">Conditions</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Please read these terms carefully before using the thejobs4u platform.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container-site">
        <div className="max-w-4xl mx-auto prose prose-brand">
          <div className="flex items-center gap-3 p-6 rounded-2xl bg-brand-blue-muted/30 border border-brand-blue/10 mb-12">
            <FileCheck className="w-6 h-6 text-brand-blue" />
            <span className="text-sm font-bold text-brand-blue">Last Updated: September 2026</span>
          </div>

          <div className="space-y-12 text-muted-foreground font-medium leading-relaxed">
            <p>
              These Terms &amp; Conditions (&quot;Terms&quot;) form a legally binding agreement between you
              (&quot;User&quot;, &quot;you&quot;) and thejobs4u (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
              governing your access to and use of our website and related services (collectively, the
              &quot;Service&quot;). By creating an account, browsing as a guest, or otherwise using the
              Service, you agree to these Terms. If you do not agree, do not use the Service.
            </p>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">1. About the Service</h2>
              <p>
                thejobs4u is an online platform that connects employers with job seekers across Gulf,
                Europe, Asia, and India. We are an information and listing platform only. We are not a
                recruitment agency, employer, or manpower consultant, and we are not a party to any
                employment offer, contract, or arrangement between employers and candidates. Job seekers
                use the Service free of charge; employers may optionally subscribe to our Pro plan for
                higher posting limits and additional hiring tools, or purchase credits for candidate
                database access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">2. Eligibility</h2>
              <p>
                You must be at least 18 years old to create an account. By using the Service you represent
                that the information you provide is true, accurate, and complete, and that your use of the
                Service does not violate any law applicable to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">3. Accounts and Security</h2>
              <p>
                You may browse public job listings as a guest, without creating an account. Applying for
                jobs, posting jobs, saving posts, following companies, using the resume builder, or any
                other logged-in feature requires a free account. You are responsible for maintaining the
                confidentiality of your credentials and for all activity under your account. Notify us
                immediately at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-blue font-bold hover:underline">
                  {SUPPORT_EMAIL}
                </a>{" "}
                if you suspect unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">4. Fees, Employer Plans &amp; Refunds</h2>
              <p className="mb-4">
                <strong className="text-foreground">For job seekers the Service is and remains completely
                free.</strong> We will never charge a candidate for browsing, applying, saving jobs, using
                the resume builder, or contacting an employer.
              </p>
              <p className="mb-4">
                <strong className="text-foreground">Employers</strong> can stay on the Free plan at no
                cost, or subscribe to the Pro plan (a monthly subscription with higher Featured/General/
                Story limits) and separately purchase credit packs, used to unlock candidate resumes and
                full profiles in our ATS search. Plan prices, limits, and credit pack prices are shown on
                the Pricing page and may be revised at any time by us; a revision never changes what an
                employer who already purchased is entitled to for that purchase.
              </p>
              <p>
                Payments are processed securely by Razorpay in Indian Rupees (INR); we do not store your
                card or banking details. The Pro plan does not auto-renew — it is a manual monthly purchase
                with a fixed validity. Credits never expire by date; they are only spent down as you use
                them. Unless required by applicable law, purchases are non-refundable once a job/Story has
                been posted under the Pro plan or credits have been spent, as described in our{" "}
                <Link href="/refund" className="text-brand-blue font-bold hover:underline">
                  Refund &amp; Cancellation Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">5. User Generated Content &amp; Acceptable Use</h2>
              <p className="mb-4">
                You are solely responsible for any content you post, upload, or transmit through the
                Service, including job posts, stories, poster images, resumes, comments, and reviews
                (&quot;User Content&quot;). You grant us a non-exclusive, worldwide, royalty-free license to
                host, store, reproduce, display, and distribute your User Content solely for the purpose of
                operating and promoting the Service.
              </p>
              <p className="mb-2">You agree <strong className="text-foreground">not</strong> to post or transmit content that is:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>unlawful, fraudulent, misleading, defamatory, obscene, hateful, harassing, or threatening;</li>
                <li>designed to solicit money, fees, or personal documents from candidates before an offer is legitimately processed;</li>
                <li>infringing on any intellectual property, privacy, or other right of a third party;</li>
                <li>containing viruses, malware, or other harmful code;</li>
                <li>impersonating any person or entity or misrepresenting your affiliation.</li>
              </ul>
              <p className="mt-4">
                <strong className="text-foreground">Zero-tolerance policy:</strong> we do not tolerate
                objectionable content or abusive users. Job posts and companies can be reported for review.
                Content found to violate these Terms is removed, and the offending account may be
                suspended or permanently terminated without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">6. For Job Seekers</h2>
              <p className="mb-4">
                We review employer accounts before their job posts go live, but we cannot guarantee the
                authenticity of every listing. You are responsible for verifying employers independently
                before sharing personal documents, traveling, or paying any money.
              </p>
              <p>
                <strong className="text-foreground">
                  Never pay any money, fee, or deposit to an employer before your offer or visa is
                  legitimately processed.
                </strong>{" "}
                Report suspicious listings to us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">7. For Employers &amp; Recruiters</h2>
              <p>
                You must provide accurate business details. Every job post must include honest details of
                a genuine, current opening. Using the platform solely to harvest resumes, posting duplicate
                or misleading vacancies, or engaging in fraudulent recruitment practices is prohibited and
                will result in account termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">8. Account Deletion</h2>
              <p>
                You can request deletion of your account and all associated personal data at any time by
                writing to{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-blue font-bold hover:underline">
                  {SUPPORT_EMAIL}
                </a>
                . We will action the request and confirm once complete.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">9. Intellectual Property</h2>
              <p>
                All rights, title, and interest in the Service (excluding User Content) — including
                software, design, logos, text, and graphics — are owned by us or our licensors and are
                protected by applicable intellectual property laws. You may not copy, modify, distribute,
                sell, or reverse-engineer any part of the Service without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">10. Third-Party Services</h2>
              <p>
                The Service integrates with third-party services (for example, Razorpay for payments and
                WhatsApp for candidate contact). Your use of those services is governed by their own terms
                and privacy policies; we are not responsible for third-party content or practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">11. Disclaimers</h2>
              <p>
                The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
                warranties of any kind, express or implied. We do not warrant that listings are accurate,
                that the Service will be uninterrupted or error-free, or that any particular job, hire, or
                outcome will result from using the Service. See our{" "}
                <Link href="/disclaimer" className="text-brand-blue font-bold hover:underline">
                  Disclaimer
                </Link>{" "}
                for more detail.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">12. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, thejobs4u, its founders, employees, and partners
                shall not be liable for any indirect, incidental, special, consequential, or punitive
                damages, or any loss of profits, data, employment opportunity, money paid to third
                parties, or goodwill arising out of or in connection with your use of the Service. Our
                total aggregate liability for any claim relating to the Service is limited to the amount
                you actually paid to us in the 3 months preceding the claim, or INR 1,000, whichever is
                higher.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">13. Indemnity</h2>
              <p>
                You agree to indemnify and hold harmless thejobs4u and its team from any claim, demand,
                loss, or damage (including reasonable legal fees) arising out of your User Content, your
                use of the Service, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">14. Termination</h2>
              <p>
                We may suspend or terminate your access to the Service at any time, with or without
                notice, if we reasonably believe you have violated these Terms or applicable law. You may
                stop using the Service and request account deletion at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">15. Governing Law &amp; Jurisdiction</h2>
              <p>
                These Terms are governed by the laws of India. Any dispute arising out of or in connection
                with the Service shall be subject to the exclusive jurisdiction of the courts of Mumbai,
                Maharashtra.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">16. Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. Material changes will be highlighted on this
                page with a new &quot;Last updated&quot; date. Continued use of the Service after changes
                take effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="p-8 rounded-[32px] border border-brand-blue/15 bg-brand-blue-muted/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
              <p className="text-brand-blue/70 text-sm">
                Questions, complaints, or requests relating to these Terms? Contact us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold hover:underline">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
