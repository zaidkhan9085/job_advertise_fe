import { BadgeDollarSign, TrendingUp, BarChart3, Search, ChevronRight, Briefcase } from "lucide-react";
import Link from "next/link";

const guides = [
  { region: "Gulf Regions", growth: "+12.4%", avg: "$45k - $120k", tag: "Hot Market" },
  { region: "European Union", growth: "+8.2%", avg: "€40k - €95k", tag: "Steady" },
  { region: "Southeast Asia", growth: "+15.6%", avg: "$30k - $75k", tag: "Emerging" },
  { region: "North America", growth: "+5.1%", avg: "$60k - $150k", tag: "Stable" },
];

export default function SalaryGuidePage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue-light/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <BadgeDollarSign className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Market Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Global <span className="text-brand-blue-light italic">Salary Guide</span> 2026
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Make data-driven career decisions with our comprehensive analysis of international compensation trends.
          </p>
        </div>
      </section>

      {/* Featured Analysis */}
      <section className="py-24 container-site">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-black text-brand-blue leading-tight mb-8">
              Regional Market Trends
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {guides.map((item) => (
                <div key={item.region} className="p-8 rounded-[32px] border border-brand-blue/15 bg-white shadow-sm hover:border-brand-blue/40 hover:shadow-xl hover:bg-brand-blue-muted/5 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-brand-blue/5 rounded-full text-[10px] font-black text-brand-blue uppercase tracking-widest">{item.tag}</span>
                    <TrendingUp className="w-5 h-5 text-brand-blue-light opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-xl font-black text-brand-blue mb-2">{item.region}</h3>
                  <div className="text-2xl font-black text-brand-blue-medium mb-1">{item.avg}</div>
                  <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                    Avg. Yearly Bonus: <span className="text-brand-blue">{item.growth}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-10 rounded-[40px] bg-brand-blue text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-2xl font-black mb-4 relative z-10">Premium Market Report</h3>
                <p className="text-white/70 mb-8 max-w-md relative z-10">
                  Get deeper insights into specialized sectors like AI, Renewables, and FinTech with our 100-page deep dive.
                </p>
                <button className="flex items-center gap-2 px-8 py-4 bg-white text-brand-blue rounded-xl font-black text-sm group-hover:bg-brand-blue-light group-hover:text-white transition-all relative z-10">
                  Download Full PDF <ChevronRight className="w-4 h-4" />
                </button>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="p-8 rounded-[32px] border border-brand-blue/10 bg-brand-blue-muted/30">
              <h4 className="font-black text-brand-blue mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Recent Searches
              </h4>
              <div className="space-y-4">
                {["Software Engineer - Dubai", "Project Manager - Saudi", "Nurse - UK", "Chef - Qatar"].map(s => (
                  <button key={s} className="w-full text-left p-4 rounded-xl bg-white border border-brand-blue/5 text-sm font-bold text-muted-foreground hover:text-brand-blue hover:border-brand-blue/20 transition-all flex items-center justify-between group">
                    {s} <Search className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[32px] border border-brand-blue/15 shadow-2xl shadow-brand-blue/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-blue-muted/50 flex items-center justify-center text-brand-blue mb-6">
                    <Briefcase className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-brand-blue mb-2">Ready for a move?</h4>
                <p className="text-sm text-muted-foreground mb-6 font-medium">Use our data to negotiate your next package with confidence.</p>
                <Link href="/jobs" className="w-full py-4 bg-brand-blue text-white rounded-xl font-black text-sm hover:bg-brand-blue-medium shadow-lg shadow-brand-blue/20 transition-all">
                    Browse Vacancies
                </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
