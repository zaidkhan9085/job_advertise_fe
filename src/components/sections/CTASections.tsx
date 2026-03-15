import Link from "next/link";
import { Upload, FileText, ArrowRight } from "lucide-react";

export default function CTASections() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Seekers CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 sm:p-12 text-white">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Upload Your Resume</h2>
              <p className="text-white/80 mb-8 max-w-sm text-balance">
                Let top employers find you. Create a profile and upload your CV to 
                be discovered by thousands of hiring managers.
              </p>
              <Link 
                href="/resume" 
                className="inline-flex items-center gap-2 bg-white text-[oklch(0.47_0.20_250)] font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-sm"
              >
                Upload Resume <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recruiters CTA */}
          <div className="relative overflow-hidden rounded-3xl bg-hero-gradient p-8 sm:p-12 text-white">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Post Your Jobs</h2>
              <p className="text-white/80 mb-8 max-w-sm text-balance">
                Reach over 2.4 million qualified candidates locally and globally. 
                Start hiring the best talent for your organization today.
              </p>
              <Link 
                href="/post-job" 
                className="inline-flex items-center gap-2 bg-white text-brand-blue font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-sm"
              >
                Post a Job <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
