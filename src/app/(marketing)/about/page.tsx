import { ArrowRight, CheckCircle2, Target, Users, Award, Globe2 } from "lucide-react";
import Link from "next/link";
import DecorativeBlur from "@/components/common/DecorativeBlur";

const stats = [
  { label: "Active Users", value: "2.4M+", icon: Users },
  { label: "Partner Companies", value: "15,000+", icon: Target },
  { label: "Job Placements", value: "850k+", icon: CheckCircle2 },
  { label: "Global Offices", value: "12", icon: Globe2 },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/10 -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <Award className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Our Story</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Connecting Ambition with <span className="text-brand-blue-light italic">Global Opportunity</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Gulf Jobs Advertise is the premier bridge between world-class talent and the world's most innovative organizations.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-brand-blue-muted/30 border-b border-brand-blue/10">
        <div className="container-site">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 border border-brand-blue/5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-brand-blue mb-1">{stat.value}</div>
                  <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-blue mb-6 leading-tight">
                Our Mission: Empowering the <span className="text-brand-blue-medium">Global Workforce</span>
              </h2>
              <div className="space-y-6 text-muted-foreground font-medium leading-relaxed">
                <p>
                  Founded with a vision to streamline international recruitment, Gulf Jobs Advertise has evolved into a global ecosystem where career aspirations meet market demands. We believe that location should never be a barrier to excellence.
                </p>
                <p>
                  We leverage cutting-edge matching technology and deep regional expertise to ensure that every placement we facilitate is not just a job, but a strategic career move.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/jobs" className="px-8 py-4 bg-brand-blue text-white rounded-xl font-black text-sm hover:bg-brand-blue-medium transition-all shadow-lg shadow-brand-blue/20">
                  Explore Careers
                </Link>
                <Link href="/contact" className="px-8 py-4 bg-brand-blue/5 text-brand-blue rounded-xl font-black text-sm hover:bg-brand-blue/10 transition-all">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[40px] bg-gradient-to-br from-brand-blue-muted to-white border border-brand-blue/10 flex items-center justify-center overflow-hidden p-12">
                <Globe2 className="w-full h-full text-brand-blue/5 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center text-8xl font-black text-brand-blue/10 select-none">
                  GJA
                </div>
              </div>
              {/* Decor */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-blue-light/20 rounded-full blur-3xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
