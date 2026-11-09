import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center container mx-auto px-6 text-center text-foreground">
      <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-2">
        Error 404
      </span>
      <h1 className="text-7xl md:text-9xl font-[family-name:var(--font-heading)] font-bold tracking-tight mb-4 text-foreground">
        404
      </h1>
      <h2 className="text-xl md:text-2xl font-[family-name:var(--font-heading)] font-semibold tracking-wide mb-3">
        Page Not Located
      </h2>
      <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] max-w-sm mx-auto mb-8 text-xs md:text-sm">
        This route does not exist or has been retired from the collection index.
      </p>
      <Link href="/">
        <button className="bg-[#C41E24] text-white px-7 py-3 font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-[#a01a1f] transition-colors cursor-pointer">
          <span>Return Home</span>
          <ArrowRight size={14} />
        </button>
      </Link>
    </div>
  );
}
