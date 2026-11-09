"use client";
import { useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProducts } from "@/store/productSlice";
import ProductGrid from "@/components/ProductGrid";
import { useSearchParams } from "next/navigation";

function ShopContent() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, loading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ keyword: query }));
  }, [dispatch, query]);

  return (
    <div className="pt-12 min-h-screen bg-background pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-2">
          {query ? "Search Results" : "Catalog"}
        </span>
        <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight mb-3">
          {query ? `Results for "${query}"` : "All Pieces"}
        </h1>
        <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] text-sm md:text-base max-w-xl">
          {query
            ? `Showing items matching "${query}".`
            : "The full roster. Heavyweight cottons, technical cuts, and custom silhouettes."}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-6 h-6 border-2 border-[#C41E24] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ShopContent />
    </Suspense>
  );
}
