"use client";
import Link from "next/link";
import { Globe, Mail, Phone, ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const currentTheme = resolvedTheme || 'dark';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-[#EDEAE5] dark:bg-[#111111] border-t border-[#D5D0CA] dark:border-[#2A2A2A] pt-12 pb-6 mt-12 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              {mounted ? (
                <img src={currentTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="REDSEE STORE" className="w-28 md:w-36 object-contain mb-3" />
              ) : (
                <div className="w-28 h-12 bg-transparent"></div>
              )}
            </Link>
            <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] text-xs leading-relaxed mb-4 max-w-[240px]">
              Premium streetwear for the bold generation.
            </p>
            <div className="flex items-center gap-3 text-[#8A8580] dark:text-[#706B66]">
              <a href="mailto:sudhanshupatel517@gmail.com" className="hover:text-[#C41E24] transition-colors"><Mail size={16} /></a>
              <a href="tel:+918889715939" className="hover:text-[#C41E24] transition-colors"><Phone size={16} /></a>
              <a href="#" className="hover:text-[#C41E24] transition-colors"><Globe size={16} /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-[family-name:var(--font-heading)] uppercase tracking-widest mb-4 text-black dark:text-white">Shop</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Men", href: "/category/men" },
                { label: "Women", href: "/category/women" },
                { label: "Oversized", href: "/category/oversized" },
                { label: "Hoodies", href: "/category/hoodies" },
                { label: "Sneakers", href: "/category/sneakers" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[#8A8580] dark:text-[#706B66] hover:text-[#C41E24] transition-colors text-xs font-[family-name:var(--font-body)]">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-[family-name:var(--font-heading)] uppercase tracking-widest mb-4 text-black dark:text-white">Support</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "FAQs", href: "/faq" },
                { label: "Shipping Info", href: "/shipping" },
                { label: "Returns & Refunds", href: "/returns" },
                { label: "Size Guide", href: "/size-guide" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[#8A8580] dark:text-[#706B66] hover:text-[#C41E24] transition-colors text-xs font-[family-name:var(--font-body)]">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-sm font-[family-name:var(--font-heading)] uppercase tracking-widest mb-4 text-black dark:text-white">Company</h3>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Careers", href: "/careers" },
                { label: "Blog", href: "/blog" },
                { label: "Press", href: "/press" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[#8A8580] dark:text-[#706B66] hover:text-[#C41E24] transition-colors text-xs font-[family-name:var(--font-body)]">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-[family-name:var(--font-heading)] uppercase tracking-widest mb-4 text-black dark:text-white">Newsletter</h3>
            <p className="text-[#8A8580] dark:text-[#706B66] text-xs mb-3 font-[family-name:var(--font-body)]">Get early access to drops, offers & exclusive deals.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-[#EDEAE5] dark:bg-[#1A1A1A] border border-[#D5D0CA] dark:border-[#2A2A2A] px-3 py-2 text-xs w-full focus:outline-none focus:border-[#C41E24]/50 text-black dark:text-white rounded-l font-[family-name:var(--font-body)] transition-colors"
              />
              <button type="button" className="bg-[#C41E24] text-white px-3 py-2 text-xs font-bold tracking-wider hover:bg-[#A01920] transition-colors rounded-r font-[family-name:var(--font-heading)] whitespace-nowrap">
                JOIN
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#D5D0CA] dark:border-[#2A2A2A] pt-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[#8A8580] dark:text-[#706B66] text-[10px] font-[family-name:var(--font-body)]">© 2026 REDSEE STORE. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[#8A8580] dark:text-[#706B66] hover:text-black dark:hover:text-white text-[10px] transition-colors font-[family-name:var(--font-body)]">Privacy Policy</Link>
            <Link href="/terms" className="text-[#8A8580] dark:text-[#706B66] hover:text-black dark:hover:text-white text-[10px] transition-colors font-[family-name:var(--font-body)]">Terms of Service</Link>
            <button onClick={scrollToTop} className="w-7 h-7 rounded-full border border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-center text-[#8A8580] dark:text-[#706B66] hover:text-[#C41E24] hover:border-[#C41E24]/40 transition-all ml-2">
              <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
