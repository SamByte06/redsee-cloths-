"use client";
import ProductGrid from "@/components/ProductGrid";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  return (
    <div className="pt-12 min-h-screen bg-background pb-24 text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-2">
          Saved Pieces
        </span>
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold tracking-tight mb-2">
          Wishlist
        </h1>
        <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] text-sm mb-10">
          Curate pieces for your next order.
        </p>

        {wishlistItems && wishlistItems.length > 0 ? (
          <ProductGrid products={wishlistItems} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-[#D5D0CA] dark:border-[#2A2A2A] bg-surface p-8 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-center mb-4">
              <Heart size={22} className="text-[#8A8580]" />
            </div>
            <h3 className="font-[family-name:var(--font-heading)] font-bold text-lg mb-2">Your wishlist is empty</h3>
            <p className="text-[#8A8580] font-[family-name:var(--font-body)] text-xs max-w-sm mb-6">Tap the heart on any drop to pin it to your personal shortlist.</p>
            <Link href="/shop" className="bg-[#C41E24] text-white px-6 py-2.5 font-[family-name:var(--font-heading)] font-semibold text-xs tracking-[0.15em] uppercase hover:bg-[#a01a1f] transition-colors">
              Explore Drops
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
