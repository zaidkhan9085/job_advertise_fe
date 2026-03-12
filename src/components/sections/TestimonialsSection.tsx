import { Star, Quote } from "lucide-react";
import { testimonials, metrics } from "@/data/testimonials";

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-background overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[oklch(0.47_0.20_250)]/5 -skew-x-12 origin-top-right transform-gpu pointer-events-none" />
      
      <div className="container-site relative z-10">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 items-center">
          
          {/* Left info & metrics */}
          <div className="lg:pr-8">
            <div className="text-xs font-semibold text-[oklch(0.47_0.20_250)] uppercase tracking-widest mb-2">Success Stories</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">Trusted by Thousands Worldwide</h2>
            <p className="text-muted-foreground mb-10 max-w-md">
              Hear from professionals who found their dream roles, and companies that hired their best talent through The Jobs Advertise.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="text-2xl font-extrabold text-[oklch(0.47_0.20_250)]">{m.value}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 relative">
            {testimonials.map((t, idx) => (
              <div 
                key={t.id} 
                className={`bg-white rounded-2xl p-7 border border-border/60 shadow-[var(--shadow-card)] relative z-10 ${idx === 1 ? 'sm:translate-y-8' : ''}`}
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-secondary" />
                
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[oklch(0.70_0.25_80)] text-[oklch(0.70_0.25_80)]" />
                  ))}
                </div>
                
                <p className="text-sm font-medium leading-relaxed text-foreground/80 mb-6 italic">
                  &quot;{t.quote}&quot;
                </p>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
