import Link from "next/link";
import { Scale } from "lucide-react";
import DecorativeBlur from "@/components/common/DecorativeBlur";

export default function LegalNoticePage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/10 -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <Scale className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Legal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Legal Notice
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container-site">
        <div className="max-w-4xl mx-auto prose prose-brand">
          <div className="space-y-12 text-muted-foreground font-medium leading-relaxed">
            <section className="space-y-2">
              <p><strong className="text-foreground">Website:</strong> www.thejobs4u.com</p>
              <p><strong className="text-foreground">Owner:</strong> thejobs4u</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">1. Ownership and Operation</h2>
              <p>
                This website is owned and operated by thejobs4u (&quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;). By accessing and using this website, you agree to the terms set forth in
                this Legal Notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">2. Intellectual Property</h2>
              <p>
                All content on this website, including but not limited to logos, graphics, text, images,
                job listings, and software, is the intellectual property of thejobs4u or its licensors.
                Unauthorized use, reproduction, or distribution is strictly prohibited and may result in
                legal action.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">3. Website Use</h2>
              <p>
                This website is intended for users seeking job opportunities and employers posting job
                advertisements. We reserve the right to suspend or terminate user access if we detect any
                misuse or violation of our terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">4. No Guarantee of Employment</h2>
              <p>
                thejobs4u is a platform to connect job seekers with employers. We do not guarantee job
                placement, interview calls, or employment. Users are responsible for verifying the
                legitimacy of job listings and employers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">5. External Links</h2>
              <p>
                Our website may contain links to third-party websites. These are provided for convenience
                only. We do not endorse or accept responsibility for the content or security of external
                sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">6. Limitation of Liability</h2>
              <p>
                We strive to keep all information accurate and updated, but we make no warranties regarding
                the completeness, reliability, or accuracy of any content. thejobs4u shall not be held
                liable for any damages arising from the use or inability to use this website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">7. Privacy</h2>
              <p>
                Please refer to our{" "}
                <Link href="/privacy" className="text-brand-blue font-bold hover:underline">
                  Privacy Policy
                </Link>{" "}
                for details on how we collect, use, and protect your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-brand-blue mb-6">8. Changes to This Notice</h2>
              <p>
                We reserve the right to update this Legal Notice at any time. It is your responsibility to
                check this page periodically for updates.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
