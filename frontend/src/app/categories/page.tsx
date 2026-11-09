"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { ArrowRight, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Category {
  _id: string;
  name: string;
  slug: string;
  section?: "Men" | "Women" | "Accessories";
  parentCategory?: string | { _id: string; name: string } | null;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  navbarCategory: string;
  section: "Men" | "Women" | "Accessories";
  pricing: {
    basePrice: number;
    finalPrice: number;
    discountPercentage: number;
  };
  images: any[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"Men" | "Women" | "Accessories">("Men");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get("/api/categories"),
          api.get("/api/products")
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error("Failed to load category data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 text-[#C41E24] animate-spin" />
        <p className="font-[family-name:var(--font-heading)] text-xs tracking-widest uppercase text-[#8A8580]">Loading Directory...</p>
      </div>
    );
  }

  const navbarCategories = categories.filter(
    (c) => !c.parentCategory && c.section === activeSection
  );

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#D5D0CA] dark:border-[#2A2A2A]">
          <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">
            Taxonomy
          </span>
          <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold tracking-tight">
            Categories Directory
          </h1>
          <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] text-xs md:text-sm mt-2 max-w-lg">
            Structured breakdown of current silhouettes, fabric weights, and cuts.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 mb-12 border-b border-[#D5D0CA] dark:border-[#2A2A2A] pb-4">
          {(["Men", "Women", "Accessories"] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-5 py-2 font-[family-name:var(--font-heading)] text-xs tracking-[0.15em] uppercase font-semibold transition-colors cursor-pointer ${
                activeSection === sec
                  ? "bg-[#C41E24] text-white"
                  : "bg-surface text-[#8A8580] hover:text-foreground"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Collections */}
        <div className="space-y-12">
          {navbarCategories.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A]">
              <p className="text-[#8A8580] font-[family-name:var(--font-body)] text-xs">
                No categories in this section yet.
              </p>
            </div>
          ) : (
            navbarCategories.map((navCat) => {
              const subcats = categories.filter((c) => {
                const parentId = typeof c.parentCategory === "object" && c.parentCategory !== null
                  ? c.parentCategory._id
                  : c.parentCategory;
                return parentId === navCat._id;
              });

              const navCatProducts = products.filter(
                (p) => p.section === activeSection && p.navbarCategory === navCat.name
              );

              return (
                <div key={navCat._id} className="border border-[#D5D0CA] dark:border-[#2A2A2A] bg-background p-6 md:p-8">
                  {/* Category Title */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#D5D0CA] dark:border-[#2A2A2A] pb-4 mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold tracking-tight text-foreground">
                        {navCat.name}
                      </h2>
                      {subcats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {subcats.map((sub) => (
                            <Link
                              key={sub._id}
                              href={`/category/${sub.slug}`}
                              className="text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-wider bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] text-[#8A8580] hover:text-foreground hover:border-foreground px-2 py-0.5 transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/category/${navCat.slug}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-[family-name:var(--font-heading)] font-semibold tracking-[0.15em] uppercase text-[#C41E24] hover:underline underline-offset-4"
                    >
                      <span>View All</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {/* Product Grid */}
                  {navCatProducts.length === 0 ? (
                    <div className="text-center py-8 text-[#8A8580] font-[family-name:var(--font-body)] text-xs">
                      No active drops in this category yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                      {navCatProducts.slice(0, 4).map((product) => {
                        const image = typeof product.images?.[0] === "string" 
                          ? product.images[0] 
                          : (product.images?.[0]?.url || "");
                        const hoverImage = typeof product.images?.[1] === "string"
                          ? product.images[1]
                          : (product.images?.[1]?.url || image);
                          
                        return (
                          <ProductCard
                            key={product._id}
                            id={product._id}
                            name={product.name}
                            price={product.pricing?.finalPrice || product.pricing?.basePrice || 0}
                            image={image}
                            hoverImage={hoverImage}
                            category={product.category}
                            discount={product.pricing?.discountPercentage || 0}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
