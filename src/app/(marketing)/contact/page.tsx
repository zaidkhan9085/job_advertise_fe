import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import DecorativeBlur from "@/components/common/DecorativeBlur";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-hero-gradient text-white py-24 relative overflow-hidden">
        <DecorativeBlur size="2xl" blur="strong" className="top-0 right-0 bg-brand-blue-light/10 -translate-y-1/2 translate-x-1/2" />
        <div className="container-site relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 border border-white/10">
            <MessageSquare className="w-4 h-4 text-brand-blue-light" />
            <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Contact Support</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            How Can We <span className="text-brand-blue-light italic">Help You?</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            Whether you're a recruiter looking for talent or a candidate seeking a dream job, our team is here for you.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 container-site">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-brand-blue mb-8">Get In Touch</h2>
            
            <div className="flex gap-5 p-6 rounded-3xl border border-brand-blue/5 bg-brand-blue-muted/30 group hover:border-brand-blue/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-brand-blue/5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-brand-blue/40 uppercase tracking-widest mb-1">Email Us</div>
                <div className="font-bold text-brand-blue">support@thejobsadvertise.com</div>
              </div>
            </div>

            <div className="flex gap-5 p-6 rounded-3xl border border-brand-blue/5 bg-brand-blue-muted/30 group hover:border-brand-blue/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-brand-blue/5">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-brand-blue/40 uppercase tracking-widest mb-1">Call Us</div>
                <div className="font-bold text-brand-blue">+91 (800) 123-4567</div>
              </div>
            </div>

            <div className="flex gap-5 p-6 rounded-3xl border border-brand-blue/5 bg-brand-blue-muted/30 group hover:border-brand-blue/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-brand-blue/5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-brand-blue/40 uppercase tracking-widest mb-1">Our Office</div>
                <div className="font-bold text-brand-blue">Knowledge Village, Dubai, UAE</div>
              </div>
            </div>

            <div className="flex gap-5 p-6 rounded-3xl border border-brand-blue/5 bg-brand-blue-muted/30 group hover:border-brand-blue/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-brand-blue shadow-sm border border-brand-blue/5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-brand-blue/40 uppercase tracking-widest mb-1">Working Hours</div>
                <div className="font-bold text-brand-blue">Mon - Fri: 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 p-10 rounded-[40px] border border-brand-blue/15 bg-white shadow-2xl shadow-brand-blue/5">
            <h2 className="text-2xl font-black text-brand-blue mb-8 leading-tight">Send us a Message</h2>
            <form className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-brand-blue uppercase tracking-widest">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-5 py-4 rounded-xl bg-brand-blue-muted/30 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all outline-none font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-brand-blue uppercase tracking-widest">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-5 py-4 rounded-xl bg-brand-blue-muted/30 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all outline-none font-medium" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-black text-brand-blue uppercase tracking-widest">Subject</label>
                <select className="w-full px-5 py-4 rounded-xl bg-brand-blue-muted/30 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all outline-none font-medium appearance-none">
                  <option>Job Seeker Inquiry</option>
                  <option>Recruiter Partnership</option>
                  <option>Bug Report</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-black text-brand-blue uppercase tracking-widest">Your Message</label>
                <textarea rows={5} placeholder="Tell us how we can help..." className="w-full px-5 py-4 rounded-xl bg-brand-blue-muted/30 border-transparent focus:border-brand-blue/20 focus:bg-white transition-all outline-none font-medium resize-none"></textarea>
              </div>
              <div className="sm:col-span-2 pt-4">
                <button className="flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-5 bg-brand-blue text-white rounded-xl font-black text-sm hover:bg-brand-blue-medium shadow-lg shadow-brand-blue/20 transition-all uppercase tracking-widest">
                  Send Message <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
