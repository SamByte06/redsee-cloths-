"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchProducts } from "@/store/productSlice";
import ProductGrid from "@/components/ProductGrid";
import api from "@/lib/axios";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = React.use(params);
  const slug = unwrappedParams.slug;
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector((state: RootState) => state.products);

  const [categoryName, setCategoryName] = useState(
    slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
  );

  useEffect(() => {
    const resolveCategory = async () => {
      try {
        const { data } = await api.get('/api/categories');
        const matched = data.find((c: any) => c.slug === slug);
        if (matched) {
          setCategoryName(matched.name);
          dispatch(fetchProducts({ category: matched.name, section: matched.section }));
        } else {
          const fallbackName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
          setCategoryName(fallbackName);
          let fallbackSection = undefined;
          let queryName = fallbackName;
          if (slug.endsWith('-men')) {
            fallbackSection = 'Men';
            queryName = fallbackName.replace(/\bMen\b/gi, '').trim();
          } else if (slug.endsWith('-women')) {
            fallbackSection = 'Women';
            queryName = fallbackName.replace(/\bWomen\b/gi, '').trim();
          } else if (slug.endsWith('-accessories')) {
            fallbackSection = 'Accessories';
            queryName = fallbackName.replace(/\bAccessories\b/gi, '').trim();
          }
          dispatch(fetchProducts({ category: queryName, section: fallbackSection }));
        }
      } catch (err) {
        console.error("Failed to resolve category name from DB:", err);
        const fallbackName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
        setCategoryName(fallbackName);
        let fallbackSection = undefined;
        let queryName = fallbackName;
        if (slug.endsWith('-men')) {
          fallbackSection = 'Men';
          queryName = fallbackName.replace(/\bMen\b/gi, '').trim();
        } else if (slug.endsWith('-women')) {
          fallbackSection = 'Women';
          queryName = fallbackName.replace(/\bWomen\b/gi, '').trim();
        } else if (slug.endsWith('-accessories')) {
          fallbackSection = 'Accessories';
          queryName = fallbackName.replace(/\bAccessories\b/gi, '').trim();
        }
        dispatch(fetchProducts({ category: queryName, section: fallbackSection }));
      }
    };
    resolveCategory();
  }, [dispatch, slug]);

  return (
    <div className="pt-12 min-h-screen bg-background pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
        <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-2">
          Category
        </span>
        <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight mb-3">
          {categoryName}
        </h1>
        <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] text-sm md:text-base max-w-xl">
          Carefully constructed {categoryName.toLowerCase()} pieces designed for everyday wear and lasting structure.
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
