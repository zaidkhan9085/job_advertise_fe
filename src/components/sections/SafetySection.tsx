import { ShieldAlert, Info } from "lucide-react";
import Link from "next/link";

export default function SafetySection() {
  return (
    <section className="py-12 bg-white border-t border-border">
      <div className="container-site">
        <div className="flex flex-col md:flex-row items-center gap-6 bg-yellow-50/50 border border-yellow-200/50 rounded-2xl p-6 md:p-8">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-900 mb-1">Safety Disclaimer — Never Pay for a Job</h3>
            <p className="text-sm text-yellow-800/80 leading-relaxed max-w-3xl">
              <strong>The Jobs Advertise does not charge candidates any fees for registration, interviews, or hiring.</strong> Beware of fake offers and scammers asking for money in exchange for employment. We strongly advise you to verify the authenticity of all job offers.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link 
              href="/privacy" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-700 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-4 py-2.5 rounded-lg transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              Read Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
