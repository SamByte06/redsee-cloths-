import ProductCard from "./ProductCard";
import Link from "next/link";

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  products: any[];
}

const ProductGrid = ({ title, subtitle, products }: ProductGridProps) => {
  return (
    <section className="py-16 px-4 md:px-8 container mx-auto">
      {title && (
        <div className="flex items-end justify-between mb-8 border-b border-[#D5D0CA] dark:border-[#2A2A2A] pb-4">
          <div>
            {subtitle && (
              <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">
                {subtitle}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-heading)] font-bold tracking-tight text-foreground">
              {title}
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-[family-name:var(--font-heading)] font-medium uppercase tracking-[0.15em] text-[#8A8580] dark:text-[#706B66] hover:text-foreground transition-colors"
          >
            View All
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            id={product._id}
            name={product.name}
            price={product.pricing?.finalPrice || product.pricing?.basePrice || product.price || 0}
            image={typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '')}
            hoverImage={typeof product.images?.[1] === 'string' ? product.images[1] : (product.images?.[1]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '')))}
            category={product.category}
            rating={5}
            discount={product.pricing?.discountPercentage || product.pricing?.discount || 0}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] py-12 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A]">
          No products found.
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
