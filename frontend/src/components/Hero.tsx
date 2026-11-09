"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative h-[90vh] w-full flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-start justify-center">
        <div className="max-w-2xl">
          <span className="text-[#C41E24] font-[family-name:var(--font-heading)] tracking-[0.2em] uppercase text-sm font-semibold mb-4 block">
            New Collection 2026
          </span>
          <h1 className="text-6xl md:text-8xl font-[family-name:var(--font-heading)] font-bold text-foreground leading-[0.9] mb-6 tracking-tight">
            DEFINE YOUR <br />
            <span className="text-[#C41E24]">IDENTITY.</span>
          </h1>
          <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] text-lg mb-10 max-w-xl leading-relaxed">
            Streetwear built with conviction. Limited runs, premium materials, no compromises.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/shop">
              <button className="bg-[#C41E24] hover:bg-foreground hover:text-background transition-all duration-300 text-white px-8 py-4 font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] font-semibold text-sm flex items-center justify-center group w-full sm:w-auto">
                Shop Now
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/categories">
              <button className="bg-transparent border border-foreground/30 hover:border-foreground transition-all duration-300 text-foreground px-8 py-4 font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] font-semibold text-sm flex items-center justify-center w-full sm:w-auto">
                Browse Categories
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
