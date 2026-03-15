"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { jobCategories, searchLocations } from "@/data/categories";

const stats = [
  { value: "50,000+", label: "Live Jobs" },
  { value: "2.4M+", label: "Candidates" },
  { value: "12,000+", label: "Companies" },
  { value: "40+", label: "Countries" },
];

export default function HeroSection() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[640px] flex items-center">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[oklch(0.47_0.20_250)]/20 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-[oklch(0.68_0.21_45)]/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />
      </div>

      <div className="container-site relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 mx-auto">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Trusted Overseas Recruitment for Gulf & Europe</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-5 text-balance mx-auto">
            World's #1 Global <span className="text-brand-blue-light italic">Opportunities</span> Portal 
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
            Artwork Posting – Gulf & Europe Country. Explore verified job vacancies in UAE, Saudi Arabia, Qatar, Oman, Bahrain, Kuwait, and Europe.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="/jobs" className="flex items-center justify-center gap-2 bg-[oklch(0.68_0.21_45)] hover:bg-[oklch(0.55_0.22_45)] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg">
              <Search className="w-4 h-4 ml-[-4px]" /> Browse Jobs
            </Link>
            <Link href="/resume" className="flex items-center justify-center gap-2 bg-white text-[oklch(0.47_0.20_250)] hover:bg-white/90 font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg">
              Post Resume
            </Link>
            <Link href="/post-job" className="hidden sm:flex items-center justify-center gap-2 bg-white text-brand-blue hover:bg-brand-blue-muted font-black px-6 py-3.5 rounded-xl transition-all shadow-lg active:scale-95 border border-brand-blue/10">
              Post Jobs
            </Link>
            <a href="https://chat.whatsapp.com/E73OloAiRjv8ZZYQBNqEt5?mode=ac_t" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BE5A] text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg">
              Join WhatsApp Group
            </a>
          </div>

          {/* Real Search bar using dynamic categories */}
          <div className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/20 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3 relative group">
              <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <select className="flex-1 text-sm text-foreground bg-transparent py-2.5 outline-none cursor-pointer appearance-none pr-8">
                <option value="">Select Category...</option>
                {jobCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 pointer-events-none opacity-50" />
            </div>
            <div className="hidden sm:block w-px h-8 bg-border self-center" />
            <div className="flex items-center gap-2 flex-1 px-3 relative group">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <select className="flex-1 text-sm text-foreground bg-transparent py-2.5 outline-none cursor-pointer appearance-none pr-8">
                <option value="">Select Location...</option>
                {searchLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 pointer-events-none opacity-50" />
            </div>
            <button className="flex items-center justify-center gap-2 bg-[oklch(0.47_0.20_250)] hover:bg-[oklch(0.35_0.20_250)] text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm whitespace-nowrap">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 text-center">
              <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-sm font-medium text-white/70 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
