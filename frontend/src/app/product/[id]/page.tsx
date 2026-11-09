"use client";
import { useState, useEffect, use, useRef } from "react";
import { Star, Heart, Share2, ShoppingBag, Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { fetchProductDetails, clearProductDetails } from "@/store/productSlice";
import { AppDispatch, RootState } from "@/store/store";
import { addRecentlyViewedLocal, addRecentlyViewedBackend } from "@/store/recentlyViewedSlice";
import { toggleWishlistLocal, toggleWishlistBackend } from "@/store/wishlistSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { optimizeImageUrl } from "@/lib/image";
import ProductReviews from "@/components/ProductReviews";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { productDetails: product, loading, error } = useSelector((state: RootState) => state.products);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });

  const scrollToReviews = () => {
    const element = document.getElementById("reviews-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const mobileGalleryRef = useRef<HTMLDivElement>(null);

  const imagesList = product?.images?.map((img: any) => typeof img === 'string' ? img : (img?.url || '')) || [];

  const handleMobileScroll = () => {
    if (mobileGalleryRef.current) {
      const { scrollLeft, clientWidth } = mobileGalleryRef.current;
      if (clientWidth > 0) {
        const index = Math.round(scrollLeft / clientWidth);
        if (imagesList[index] && imagesList[index] !== activeImage) {
          setActiveImage(imagesList[index]);
        }
      }
    }
  };

  const handleBack = () => {
    const activeIndex = imagesList.indexOf(activeImage);
    if (activeIndex > 0) {
      const prevImage = imagesList[activeIndex - 1];
      setActiveImage(prevImage);
      if (mobileGalleryRef.current) {
        mobileGalleryRef.current.scrollTo({
          left: (activeIndex - 1) * mobileGalleryRef.current.clientWidth,
          behavior: 'smooth'
        });
      }
    } else {
      router.back();
    }
  };

  const handleThumbnailClick = (img: string) => {
    setActiveImage(img);
    const index = imagesList.indexOf(img);
    if (index !== -1 && mobileGalleryRef.current) {
      mobileGalleryRef.current.scrollTo({
        left: index * mobileGalleryRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = product ? wishlistItems.some((item: any) => item._id === product._id) : false;

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      if (isAuthenticated) {
        dispatch(addRecentlyViewedBackend(product._id) as any);
      } else {
        dispatch(addRecentlyViewedLocal(product));
      }
    }
  }, [product, dispatch, isAuthenticated]);

  const handleWishlistToggle = () => {
    if (!product) return;
    dispatch(toggleWishlistLocal(product));
    if (isAuthenticated) {
      dispatch(toggleWishlistBackend(product._id) as any);
    }
  };

  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        const firstImg = product.images[0];
        setActiveImage(typeof firstImg === 'string' ? firstImg : (firstImg?.url || ''));
      }
      if (product.variants && product.variants.length > 0) {
        setSelectedSize(product.variants[0].size);
        setSelectedColor(product.variants[0].color);
      }
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    const firstImg = product.images?.[0];
    const itemImage = typeof firstImg === 'string' ? firstImg : (firstImg?.url || '');
    const itemPrice = product.pricing?.finalPrice || product.pricing?.basePrice || product.price || 0;

    dispatch(addToCart({
      product: product._id,
      title: product.name,
      image: itemImage,
      price: itemPrice,
      quantity,
      size: selectedSize,
      color: selectedColor
    }));
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-[#C41E24] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-background min-h-screen flex flex-col justify-center items-center text-foreground px-4">
        <h2 className="text-3xl font-[family-name:var(--font-heading)] font-bold mb-3">Product Not Found</h2>
        <button onClick={() => router.back()} className="text-[#C41E24] underline underline-offset-4 font-[family-name:var(--font-body)] text-sm">
          Go Back
        </button>
      </div>
    );
  }

  const images = product.images?.map((img: any) => typeof img === 'string' ? img : (img?.url || '')) || [];
  const displayPrice = product.pricing?.finalPrice || product.pricing?.basePrice || product.price || 0;
  const originalPrice = product.pricing?.originalPrice || 0;
  const displayDiscount = product.pricing?.discountPercentage || product.pricing?.discount || 0;

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-16 text-foreground">
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#F5F0EB] dark:bg-[#111111] border-b border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-between px-4 py-3">
        <button onClick={handleBack} className="text-foreground p-1 -ml-1">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-[family-name:var(--font-heading)] font-semibold text-sm truncate px-4">{product.name}</h2>
        <button onClick={handleWishlistToggle} className="text-foreground p-1 -mr-1">
          <Heart size={20} className={isWishlisted ? "fill-[#C41E24] text-[#C41E24]" : ""} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
        {/* Breadcrumb */}
        <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-[#D5D0CA] dark:border-[#2A2A2A]">
          <div className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] text-[#8A8580] dark:text-[#706B66] space-x-2">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-foreground">{product.category}</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] text-[#8A8580] hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14">
          {/* Gallery */}
          <div className="md:col-span-7 relative w-full">
            {/* Mobile swipe */}
            <div
              ref={mobileGalleryRef}
              onScroll={handleMobileScroll}
              className="md:hidden flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full aspect-[3/4] bg-surface"
            >
              {images.map((img: string, i: number) => (
                <div key={i} className="min-w-full h-full snap-center relative">
                  <img src={optimizeImageUrl(img, 800)} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Desktop stack */}
            <div className="hidden md:block space-y-3">
              <div className="aspect-[3/4] bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] relative overflow-hidden">
                <img
                  src={optimizeImageUrl(activeImage, 1200)}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleThumbnailClick(img)}
                    className={`aspect-[3/4] bg-surface border ${
                      activeImage === img
                        ? 'border-[#C41E24]'
                        : 'border-[#D5D0CA] dark:border-[#2A2A2A] hover:border-foreground'
                    } transition-colors overflow-hidden cursor-pointer`}
                  >
                    <img src={optimizeImageUrl(img, 300)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-5 flex flex-col pt-2 md:pt-0">
            <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-2">
              {product.category}
            </span>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-5xl font-[family-name:var(--font-heading)] font-bold tracking-tight text-foreground leading-[0.95]">
                {product.name}
              </h1>
            </div>

            <button
              onClick={scrollToReviews}
              className="flex items-center space-x-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0 outline-none"
            >
              <div className="flex text-[#C41E24]">
                {[...Array(5)].map((_, i) => {
                  const rating = reviewStats.averageRating || 5;
                  const isFilled = i < Math.round(rating);
                  return (
                    <Star
                      key={i}
                      size={13}
                      className={isFilled ? "fill-[#C41E24] text-[#C41E24]" : "text-[#D5D0CA] dark:text-[#2A2A2A]"}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-[family-name:var(--font-body)] text-[#8A8580] dark:text-[#706B66]">
                {reviewStats.totalReviews === 0
                  ? "No reviews yet"
                  : `${reviewStats.totalReviews} ${reviewStats.totalReviews === 1 ? 'review' : 'reviews'}`}
              </span>
            </button>

            {/* Price */}
            <div className="flex items-baseline space-x-3 mb-6 pb-6 border-b border-[#D5D0CA] dark:border-[#2A2A2A]">
              <span className="text-3xl md:text-4xl font-[family-name:var(--font-body)] font-bold text-foreground">
                ₹{displayPrice}
              </span>
              {displayDiscount > 0 && originalPrice > 0 && (
                <span className="text-base text-[#8A8580] line-through">
                  ₹{originalPrice}
                </span>
              )}
              {displayDiscount > 0 && (
                <span className="bg-[#C41E24] text-white text-[10px] px-2 py-0.5 font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider">
                  -{displayDiscount}%
                </span>
              )}
            </div>

            <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] text-sm leading-relaxed mb-8">
              Constructed from premium heavyweight fabric with reinforced seams. Cut for a clean drape that holds its shape wash after wash.
            </p>

            {/* Color */}
            <div className="mb-6">
              <span className="text-xs font-[family-name:var(--font-heading)] uppercase font-semibold tracking-wider text-[#8A8580] block mb-2">
                Color: <strong className="text-foreground">{selectedColor || "Standard"}</strong>
              </span>
              <div className="flex space-x-2">
                {Array.from(new Set(product.variants?.map((v: any) => v.color) || [])).map((color: any) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-xs font-[family-name:var(--font-heading)] border transition-all ${
                      selectedColor === color
                        ? 'border-foreground bg-foreground text-background font-semibold'
                        : 'border-[#D5D0CA] dark:border-[#2A2A2A] text-foreground hover:border-foreground'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-[family-name:var(--font-heading)] uppercase font-semibold tracking-wider text-[#8A8580]">
                  Size: <strong className="text-foreground">{selectedSize || "M"}</strong>
                </span>
                <Link href="/size-guide" className="text-xs font-[family-name:var(--font-heading)] text-[#8A8580] underline hover:text-foreground">
                  Size Guide
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(product.variants?.map((v: any) => v.size) || [])).map((size: any) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] py-2 px-3 border text-xs font-[family-name:var(--font-heading)] font-medium transition-all ${
                      selectedSize === size
                        ? 'border-[#C41E24] bg-[#C41E24] text-white font-semibold'
                        : 'border-[#D5D0CA] dark:border-[#2A2A2A] text-foreground hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex items-center justify-between border border-[#D5D0CA] dark:border-[#2A2A2A] h-12 px-3 w-28">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-foreground px-1 hover:text-[#C41E24]">-</button>
                <span className="font-[family-name:var(--font-body)] text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-foreground px-1 hover:text-[#C41E24]">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] text-foreground hover:border-foreground transition-colors font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={15} />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 h-12 bg-[#C41E24] text-white hover:bg-[#a01a1f] transition-colors font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] font-semibold text-xs flex items-center justify-center cursor-pointer"
              >
                Buy Now
              </button>

              <button
                onClick={handleWishlistToggle}
                className="w-12 h-12 border border-[#D5D0CA] dark:border-[#2A2A2A] text-foreground hover:border-foreground flex items-center justify-center cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart size={18} className={isWishlisted ? "fill-[#C41E24] text-[#C41E24]" : ""} />
              </button>
            </div>

            {/* Trust Info */}
            <div className="border-t border-[#D5D0CA] dark:border-[#2A2A2A] pt-6 space-y-3">
              <div className="flex items-center space-x-3 text-xs text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)]">
                <Truck size={16} className="text-[#C41E24]" />
                <span>Express delivery in 2-4 business days across India.</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)]">
                <ShieldCheck size={16} className="text-[#C41E24]" />
                <span>4-day hassle-free replacement on unworn pieces.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews-section">
          <ProductReviews productId={product._id} onStatsChange={setReviewStats} />
        </div>
      </div>
    </div>
  );
}
