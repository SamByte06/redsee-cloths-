"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Heart, User, Menu, X, LogOut, Settings, Sun, Moon, Shirt, Footprints, Crown, Sparkles, Layers, Gem, Flame } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import api from "@/lib/axios";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";

const CATEGORIES = [
  { name: "Men", href: "/category/men", icon: Shirt },
  { name: "Women", href: "/category/women", icon: Crown },
  { name: "Accessories", href: "/category/accessories", icon: Gem },
  { name: "Oversized", href: "/category/oversized", icon: Layers },
  { name: "Hoodies", href: "/category/hoodies", icon: Sparkles },
  { name: "Cargo", href: "/category/cargo", icon: Layers },
  { name: "Lower", href: "/category/lower", icon: Flame },
  { name: "Shirts", href: "/category/shirts", icon: Shirt },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useDispatch();
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items) || [];
  const wishlistCount = wishlistItems.length;
  const cartCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownOpen) setDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch (err) { console.error('Logout error:', err); }
    dispatch(logout());
    setDropdownOpen(false);
  };

  const currentTheme = resolvedTheme || 'dark';

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav
        className={`sticky w-full top-0 z-50 transition-all duration-300 bg-[#F5F0EB] dark:bg-[#111111] ${
          isScrolled ? "py-2 shadow-md" : "py-3"
        } border-b border-[#D5D0CA] dark:border-[#2A2A2A] ${pathname === '/' ? 'hidden' : ''}`}
      >
        <div className="container mx-auto px-4 md:px-6">
          {/* Main row: Logo + Search + Icons */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              {mounted ? (
                <img src={currentTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="REDSEE STORE" className="h-8 md:h-10 cursor-pointer object-contain" />
              ) : (
                <div className="h-10 w-28 bg-transparent"></div>
              )}
            </Link>

            {/* Search Bar */}
            <div
              onClick={() => router.push('/search')}
              className="flex-1 max-w-xl mx-auto bg-[#EDEAE5] dark:bg-[#1A1A1A] border border-[#D5D0CA] dark:border-[#2A2A2A] rounded-lg px-4 py-2 flex items-center cursor-pointer transition-colors"
            >
              <Search size={16} className="text-[#8A8580] dark:text-[#706B66] mr-3 flex-shrink-0" />
              <span className="font-[family-name:var(--font-body)] text-sm text-[#8A8580] dark:text-[#706B66] truncate">Search for t-shirts, hoodies, sneakers...</span>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
              {mounted && (
                <button 
                  onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')} 
                  className="hidden md:flex text-[#8A8580] dark:text-[#706B66] hover:text-[#C41E24] transition-colors p-2"
                  aria-label="Toggle Theme"
                >
                  {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
              <Link href="/cart" className="hidden md:flex text-[#8A8580] dark:text-[#706B66] hover:text-[#C41E24] transition-colors p-2 relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#C41E24] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Account dropdown */}
              <div className="relative hidden md:block">
                {user ? (
                  <button onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }} className="text-[#8A8580] dark:text-[#706B66] hover:text-[#C41E24] transition-colors p-2 flex items-center gap-1">
                    <User size={18} />
                    <span className="text-xs font-[family-name:var(--font-body)] font-medium hidden lg:block">{user.name?.split(' ')[0]}</span>
                  </button>
                ) : (
                  <Link href="/auth">
                    <button className="bg-[#C41E24] hover:bg-[#A3181D] text-white px-4 py-1.5 text-xs font-[family-name:var(--font-heading)] font-bold uppercase tracking-wider transition-colors rounded">
                      Login
                    </button>
                  </Link>
                )}

                {dropdownOpen && user && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#F5F0EB] dark:bg-[#1A1A1A] border border-[#D5D0CA] dark:border-[#2A2A2A] rounded-lg shadow-lg py-1 z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-2.5 border-b border-[#D5D0CA] dark:border-[#2A2A2A]">
                      <p className="text-sm text-black dark:text-white font-[family-name:var(--font-body)] font-medium">{user.name}</p>
                      <p className="text-[10px] text-[#8A8580] dark:text-[#706B66] capitalize font-[family-name:var(--font-heading)] tracking-wider">{user.role}</p>
                    </div>
                    <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                      <span className="flex items-center px-4 py-2.5 text-sm text-[#8A8580] dark:text-[#706B66] hover:bg-[#EDEAE5] dark:hover:bg-[#111111] hover:text-black dark:hover:text-white cursor-pointer transition-colors">
                        <User size={14} className="mr-2" /> My Profile
                      </span>
                    </Link>
                    {(user.role === 'admin' || user.role === 'coadmin') && (
                      <Link href="/admin" onClick={() => setDropdownOpen(false)}>
                        <span className="flex items-center px-4 py-2.5 text-sm text-[#8A8580] dark:text-[#706B66] hover:bg-[#EDEAE5] dark:hover:bg-[#111111] hover:text-black dark:hover:text-white cursor-pointer transition-colors">
                          <Settings size={14} className="mr-2" /> {user.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
                        </span>
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2.5 text-sm text-[#8A8580] dark:text-[#706B66] hover:bg-[#C41E24]/10 hover:text-[#C41E24] cursor-pointer transition-colors border-t border-[#D5D0CA] dark:border-[#2A2A2A]">
                      <LogOut size={14} className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#8A8580] dark:text-[#706B66] hover:text-black dark:hover:text-white transition-colors p-2">
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />

        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 w-[280px] h-full bg-[#F5F0EB] dark:bg-[#111111] border-r border-[#D5D0CA] dark:border-[#2A2A2A] flex flex-col p-6 overflow-y-auto transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              {mounted && <img src={currentTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="REDSEE STORE" className="h-8 object-contain" />}
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="text-[#8A8580] dark:text-[#706B66] hover:text-black dark:hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* User section */}
          {user ? (
            <div className="mb-6 pb-4 border-b border-[#D5D0CA] dark:border-[#2A2A2A]">
              <p className="text-black dark:text-white font-[family-name:var(--font-body)] font-medium text-sm">{user.name}</p>
              <p className="text-[10px] text-[#8A8580] dark:text-[#706B66] capitalize font-[family-name:var(--font-heading)] tracking-wider mt-0.5">{user.role}</p>
            </div>
          ) : (
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="mb-6 pb-4 border-b border-[#D5D0CA] dark:border-[#2A2A2A] block">
              <button className="w-full bg-[#C41E24] hover:bg-[#A3181D] text-white py-2.5 text-xs font-[family-name:var(--font-heading)] font-bold uppercase tracking-wider rounded transition-colors">Login / Register</button>
            </Link>
          )}

          {/* Categories */}
          <p className="text-[10px] text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-heading)] uppercase tracking-[0.2em] mb-3">Shop by Category</p>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.name} href={cat.href} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 border-b border-[#D5D0CA]/50 dark:border-[#2A2A2A] text-[#8A8580] dark:text-[#706B66] hover:text-black dark:hover:text-white transition-colors">
                <Icon size={16} />
                <span className="text-sm font-[family-name:var(--font-body)]">{cat.name}</span>
              </Link>
            );
          })}

          {/* Quick links */}
          <div className="mt-6 space-y-3">
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] hover:text-black dark:hover:text-white transition-colors">
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && (
                <span className="ml-auto bg-[#C41E24] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            {user && (
              <>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] hover:text-black dark:hover:text-white transition-colors">My Profile</Link>
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] hover:text-black dark:hover:text-white transition-colors">Wishlist</Link>
                {(user.role === 'admin' || user.role === 'coadmin') && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] hover:text-black dark:hover:text-white transition-colors">
                    {user.role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Theme + Logout at bottom */}
          <div className="mt-auto pt-6 border-t border-[#D5D0CA] dark:border-[#2A2A2A] space-y-3">
            {mounted && (
              <button onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-2 text-sm text-[#8A8580] dark:text-[#706B66] hover:text-black dark:hover:text-white transition-colors">
                {currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            )}
            {user && (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-sm text-[#C41E24]">
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
