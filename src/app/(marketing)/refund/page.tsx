import { Wallet, ReceiptText, AlertCircle } from "lucide-react";
import DecorativeBlur from "@/components/common/DecorativeBlur";
import { SUPPORT_EMAIL } from "@/data/socialLinks";

export default function RefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/10 -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <Wallet className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Billing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Refund &amp; <span className="text-brand-blue-light italic">Cancellation</span> Policy
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            How refunds work for employer plans and credit purchases on thejobs4u.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container-site">
        <div className="max-w-4xl mx-auto prose prose-brand">
          <div className="flex items-center gap-3 p-6 rounded-2xl bg-brand-blue-muted/30 border border-brand-blue/10 mb-12">
            <ReceiptText className="w-6 h-6 text-brand-blue" />
            <span className="text-sm font-bold text-brand-blue">Last Updated: September 2026</span>
          </div>

          <div className="space-y-12 text-muted-foreground font-medium leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">1. Job Seekers</h2>
              <p>
                thejobs4u is and remains completely free for candidates. We never charge job seekers for
                browsing jobs, applying, building a resume, or contacting an employer, so no refund
                situation can ever arise on the candidate side.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">2. Employer Plans &amp; Credits</h2>
              <p>
                Employers can stay on the Free plan at no cost, or purchase the Pro plan (a monthly
                subscription with higher Featured/General/Story limits) and separate credit packs (used to
                unlock candidate resumes and full profiles in the ATS search). All prices and what each
                purchase includes are shown before checkout, and payments are processed securely via
                Razorpay.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">3. Refund Eligibility</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong className="text-foreground">Duplicate or failed payment:</strong> if you were
                  charged twice, or the amount was debited but the Pro plan or credits were never applied
                  to your account, the full amount is refunded to the original payment method.
                </li>
                <li>
                  <strong className="text-foreground">Unused Pro plan within 7 days:</strong> if you
                  haven&apos;t posted any Featured or General job or Story under the new plan, you may
                  request a full refund within 7 days of purchase.
                </li>
                <li>
                  <strong className="text-foreground">Unused credits within 7 days:</strong> if none of the
                  purchased credits have been spent unlocking a resume or profile, you may request a full
                  refund within 7 days of purchase.
                </li>
                <li>
                  <strong className="text-foreground">Partially used purchase:</strong> once a job/Story has
                  been posted under the Pro plan, or any credits from a pack have been spent, that purchase
                  is treated as consumed and is non-refundable, since the entitlement was allocated
                  immediately.
                </li>
                <li>
                  <strong className="text-foreground">Account suspension:</strong> plans or credits tied to
                  an account suspended for fraudulent, misleading, or policy-violating posts are not
                  eligible for a refund.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">4. How to Request a Refund</h2>
              <p>
                Email{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-blue font-bold hover:underline">
                  {SUPPORT_EMAIL}
                </a>{" "}
                from your registered email address with your payment reference and the reason for the
                request. We acknowledge every request within 2 business days and complete the review
                within 7 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">5. Refund Timelines</h2>
              <p>
                Approved refunds are initiated within 3 business days of approval and credited by your bank
                or card issuer, typically within 5–10 business days. Amounts are refunded in Indian Rupees
                (INR) to the original payment method only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">6. Cancellation</h2>
              <p>
                The Pro plan does not auto-renew — it is a manual monthly purchase with a fixed validity, so
                there is nothing to cancel. Credits never expire by date; they are simply spent down as you
                use them. You may stop using either at any time.
              </p>
            </section>

            <section className="p-8 rounded-[32px] border border-brand-blue/15 bg-brand-blue-muted/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
              <p className="text-brand-blue/70 text-sm">
                Questions about a specific purchase? Reach us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold hover:underline">
                  {SUPPORT_EMAIL}
                </a>{" "}
                and we&apos;ll help sort it out.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
