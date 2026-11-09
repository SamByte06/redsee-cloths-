"use client";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useState, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { RootState } from "@/store/store";
import { addRecentlyViewedLocal, addRecentlyViewedBackend } from "@/store/recentlyViewedSlice";
import { toggleWishlistLocal, toggleWishlistBackend } from "@/store/wishlistSlice";
import { optimizeImageUrl } from "@/lib/image";

interface ProductProps {
  id: string;
  name: string;
  price: number;
  image: any;
  hoverImage: any;
  category: string;
  rating?: number;
  discount?: number;
  section?: string;
}

const ProductCard = memo(({ id, name, price, image, hoverImage, category, rating = 5, discount, section }: ProductProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item: any) => item._id === id);

  const getImageUrl = (img: any): string => {
    if (!img) return "";
    if (typeof img === "string") return img;
    return img.url || "";
  };

  const imgUrl = optimizeImageUrl(getImageUrl(image), 600);
  const hoverImgUrl = hoverImage ? optimizeImageUrl(getImageUrl(hoverImage), 600) : imgUrl;

  const getProductObj = () => {
    return {
      _id: id,
      name,
      images: [imgUrl, hoverImgUrl],
      pricing: {
        finalPrice: price,
        basePrice: price,
        discountPercentage: discount || 0
      },
      category,
      rating,
      section
    };
  };

  const handleCardClick = () => {
    const productObj = getProductObj();

    if (isAuthenticated) {
      dispatch(addRecentlyViewedBackend(id) as any);
    } else {
      dispatch(addRecentlyViewedLocal(productObj));
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(addToCart({
      product: id,
      title: name,
      image: imgUrl,
      price: price,
      quantity: 1,
      size: "M",
      color: "Black"
    }));

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div 
      className="product-card group relative flex flex-col bg-white dark:bg-[#111111] border border-[#D5D0CA] dark:border-[#2A2A2A] hover:border-[#1A1A1A] dark:hover:border-[#E8E4DF] transition-colors duration-300 rounded-none overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1.5 pointer-events-none">
        {discount && discount > 0 ? (
          <span className="bg-[#C41E24] text-white text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">
            -{discount}% OFF
          </span>
        ) : null}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const productObj = getProductObj();
          dispatch(toggleWishlistLocal(productObj));
          if (isAuthenticated) {
            dispatch(toggleWishlistBackend(id) as any);
          }
        }}
        className="absolute top-3 right-3 z-20 bg-white dark:bg-[#1A1A1A] p-2 rounded-full border border-[#D5D0CA] dark:border-[#2A2A2A] text-[#8A8580] hover:text-[#C41E24] active:scale-90 transition-colors"
        aria-label="Add to wishlist"
      >
        <Heart size={15} className={isWishlisted ? "fill-[#C41E24] text-[#C41E24]" : ""} />
      </button>

      {/* Image Container */}
      <Link 
        href={`/product/${id}`} 
        onClick={handleCardClick}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#EDEAE5] dark:bg-[#1A1A1A] block"
      >
        <img 
          src={isHovered ? hoverImgUrl : imgUrl} 
          alt={name}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </Link>

      {/* Details */}
      <div className="p-3.5 flex flex-col flex-grow bg-white dark:bg-[#111111]">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[#8A8580] dark:text-[#706B66] uppercase tracking-widest font-[family-name:var(--font-heading)] font-medium truncate max-w-[70%]">
            {category}
          </span>
          <span className="text-[10px] text-[#C41E24] font-[family-name:var(--font-body)] font-bold">
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Product Title */}
        <Link href={`/product/${id}`} onClick={handleCardClick}>
          <h3 className="font-[family-name:var(--font-heading)] font-semibold text-sm uppercase tracking-wide text-[#1A1A1A] dark:text-white mb-2 hover:text-[#C41E24] dark:hover:text-[#C41E24] transition-colors line-clamp-1 leading-tight">
            {name}
          </h3>
        </Link>
        
        {/* Pricing & Add to Cart */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex flex-col">
            {discount && discount > 0 ? (
              <span className="text-[10px] text-[#8A8580] line-through font-[family-name:var(--font-body)] mb-0.5">
                ₹{(price / (1 - discount / 100)).toFixed(2)}
              </span>
            ) : null}
            <span className="text-sm md:text-base font-bold font-[family-name:var(--font-body)] text-[#1A1A1A] dark:text-white leading-none">₹{price}</span>
          </div>

          <button 
            onClick={handleQuickAdd}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full border flex items-center justify-center transition-colors active:scale-90 ${
              addedToCart 
                ? "bg-green-600 border-green-600 text-white" 
                : "bg-[#EDEAE5] dark:bg-[#1A1A1A] border-[#D5D0CA] dark:border-[#2A2A2A] text-[#1A1A1A] dark:text-white hover:bg-[#C41E24] hover:border-[#C41E24] hover:text-white"
            }`}
            title="Quick add to cart"
          >
            {addedToCart ? <Check size={14} /> : <ShoppingBag size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
