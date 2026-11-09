'use client';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RecentlyViewedShelf({ section }: { section?: string }) {
  const { items, loading } = useSelector((state: RootState) => state.recentlyViewed);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  // Filter items by active section
  const filteredItems = section
    ? items.filter((item: any) => {
        if (!item.section) return true; // Fallback: show item if section is unknown
        return item.section.toLowerCase() === section.toLowerCase();
      })
    : items;

  // If there are no items and we aren't loading, don't show the shelf at all
  if (!loading && filteredItems.length === 0) return null;

  const handleScroll = () => {
    if (containerRef.current) {
      setShowLeftArrow(containerRef.current.scrollLeft > 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.75;
      containerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="px-4 py-12 md:px-8 border-b border-[#D5D0CA] dark:border-[#2A2A2A] bg-background relative overflow-hidden group transition-colors duration-300">
      <div className="max-w-7xl mx-auto relative">
        {/* Shelf Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">
              Recent Views
            </span>
            <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight">
              Continue Browsing
            </h2>
          </div>
        </div>

        {/* Navigation Arrows */}
        {filteredItems.length > 2 && (
          <>
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-9 h-9 bg-white dark:bg-[#1A1A1A] border border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-center text-foreground hover:bg-[#C41E24] hover:border-[#C41E24] hover:text-white transition-colors z-20 cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 w-9 h-9 bg-white dark:bg-[#1A1A1A] border border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-center text-foreground hover:bg-[#C41E24] hover:border-[#C41E24] hover:text-white transition-colors z-20 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Swipeable Snap Row */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto no-scrollbar pb-3 gap-1 snap-x snap-mandatory scroll-smooth"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[170px] md:w-[220px] flex-shrink-0">
                <div className="aspect-[3/4] skeleton mb-3" />
                <div className="h-4 skeleton w-3/4 mb-2" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            ))
          ) : (
            filteredItems.map((product: any) => {
              const image = typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '');
              const hoverImage = typeof product.images?.[1] === 'string' ? product.images[1] : (product.images?.[1]?.url || image);
              const finalPrice = product.pricing?.finalPrice || product.pricing?.basePrice || 0;
              const discount = product.pricing?.discountPercentage || product.pricing?.discount || 0;

              return (
                <div key={product._id} className="w-[170px] md:w-[220px] flex-shrink-0 snap-start">
                  <ProductCard
                    id={product._id}
                    name={product.name}
                    price={finalPrice}
                    image={image}
                    hoverImage={hoverImage}
                    category={product.category}
                    rating={product.rating || 5}
                    discount={discount}
                    section={product.section}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
