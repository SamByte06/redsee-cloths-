'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, Sun, Moon, ClipboardList } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems) || [];
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || 'dark';

  // Do not show bottom nav on admin routes, auth, or checkout pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth') || pathname?.startsWith('/checkout')) {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Category', path: '/categories', icon: LayoutGrid },
    { name: 'Orders', path: '/profile/orders', icon: ClipboardList },
    { 
      name: 'Theme', 
      isAction: true,
      onClick: () => setTheme(currentTheme === 'dark' ? 'light' : 'dark'), 
      icon: currentTheme === 'dark' ? Sun : Moon 
    },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: cartItemCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F5F0EB]/95 dark:bg-[#111111]/95 border-t border-[#D5D0CA] dark:border-[#2A2A2A] pb-safe text-foreground">
      <nav className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => {
          const isActive = !item.isAction && item.path && (pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path)));
          const Icon = item.icon;

          const content = (
            <>
              <div className="relative flex flex-col items-center">
                <Icon 
                  size={22} 
                  className={`transition-colors duration-200 ${isActive ? 'text-[#C41E24]' : 'text-[#8A8580] dark:text-[#706B66]'}`} 
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-[#C41E24] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-1 font-[family-name:var(--font-heading)] tracking-wider transition-colors duration-200 ${isActive ? 'text-foreground' : 'text-[#8A8580] dark:text-[#706B66]'}`}>
                {item.name}
              </span>
              {isActive && (
                <span className="block w-[3px] h-[3px] rounded-full bg-[#C41E24] mt-0.5" />
              )}
            </>
          );

          if (item.isAction) {
            if (!mounted) return <div key={item.name} className="w-20 h-12"></div>;
            return (
              <button 
                key={item.name} 
                onClick={item.onClick} 
                className="relative flex flex-col items-center justify-center w-full h-12 text-[#8A8580] dark:text-[#706B66] active:scale-95 transition-transform"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={item.name} href={item.path || ''} className="relative flex flex-col items-center justify-center w-full h-12">
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
