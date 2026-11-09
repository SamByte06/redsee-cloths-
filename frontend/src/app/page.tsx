"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchHomeData, setHasLoadedOnce } from "@/store/homeSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ChevronLeft, ArrowRight, RefreshCw,
  ShoppingBag, Search, MapPin, Crown, ShieldCheck, Truck, RotateCcw, Heart, User, Sun, Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/axios";
import LoadingScreen from "@/components/LoadingScreen";
import RecentlyViewedShelf from "@/components/RecentlyViewedShelf";
import { optimizeImageUrl } from "@/lib/image";

// Category data for navigation strip
const STYLE_CATEGORIES = [
  { name: "Oversized", slug: "oversized", img: "/overts.png" },
  { name: "Hoodies", slug: "hoodies", img: "/hoodie.png" },
  { name: "Cargo", slug: "cargo", img: "/cargo.png" },
  { name: "Lower", slug: "lower", img: "/lower.png" },
  { name: "Shirts", slug: "shirts", img: "/shirt.png" },
  { name: "Jackets", slug: "jacket", img: "/jacket.png" },
];

// ─── EDITORIAL LOOKBOOK ────────────────────────────────
function LookbookSection() {
  const { lookbook } = useSelector((state: RootState) => state.home);

  const fallbackItems = [
    {
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
      chapter: "01",
      title: "THE VOID",
      span: "col-span-2 row-span-2 md:h-[450px]"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
      chapter: "02",
      title: "EARTH BOUND",
      span: "col-span-1 row-span-1 md:h-[217px]"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
      chapter: "03",
      title: "SHIMMER",
      span: "col-span-1 row-span-1 md:h-[217px]"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      chapter: "04",
      title: "ELECTRIC BLUE",
      span: "col-span-1 row-span-1 md:h-[217px]"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
      chapter: "05",
      title: "WATCHMAN",
      span: "col-span-1 row-span-1 md:h-[217px]"
    }
  ];

  const itemsToRender = lookbook && lookbook.length > 0 ? lookbook : fallbackItems;

  return (
    <section className="bg-background py-20 px-4 md:px-8 border-t border-[#D5D0CA] dark:border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-2">
              Lookbook
            </span>
            <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight">
              Editorial
            </h2>
          </div>
          <p className="text-[#8A8580] dark:text-[#706B66] text-sm font-[family-name:var(--font-body)] max-w-xs leading-relaxed">
            A curated look at this season's standout pieces, styled and photographed in-house.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
          {itemsToRender.map((item, idx) => (
            <div
              key={(item as any)._id || idx}
              className={`relative overflow-hidden bg-[#1A1A1A] group aspect-square md:aspect-auto ${(item as any).span || ''}`}
            >
              <img
                src={optimizeImageUrl(item.imageUrl, 600)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-5 left-5 right-5">
                <span className="text-[10px] font-[family-name:var(--font-heading)] font-medium tracking-[0.3em] text-[#C41E24] block mb-1">
                  {item.chapter}
                </span>
                <span className="text-sm font-[family-name:var(--font-heading)] font-semibold text-white tracking-wider block uppercase">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN HOMEPAGE ─────────────────────────────────────
export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    banners,
    justDropped,
    trendingNow,
    bestSellers,
    limitedDrops,
    offersForYou,
    categories,
    hasLoadedOnce,
    loading
  } = useSelector((state: RootState) => state.home);

  const { cartItems } = useSelector((state: RootState) => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items) || [];
  const wishlistCount = wishlistItems.length;

  // States
  const { resolvedTheme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    if (hasLoadedOnce) {
      setLoaded(true);
    }
  }, [hasLoadedOnce]);

  const currentTheme = resolvedTheme || 'dark';

  const [currentBanner, setCurrentBanner] = useState(0);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [shrunk, setShrunk] = useState(false);

  // Refs for drag-to-scroll
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftState = useRef(0);
  const dragDistance = useRef(0);

  // Dynamic filter states
  const [activeGenderTab, setActiveGenderTab] = useState<"men" | "women" | "accessories">("men");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loadingFiltered, setLoadingFiltered] = useState(false);

  const handleGenderTabChange = useCallback((tab: "men" | "women" | "accessories") => {
    setActiveGenderTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('section', tab);
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section && ['men', 'women', 'accessories'].includes(section.toLowerCase())) {
        setActiveGenderTab(section.toLowerCase() as any);
      }
    }
  }, []);

  const getFilteredProducts = useCallback((productList: any[]) => {
    if (!productList) return [];
    return productList;
  }, []);

  useEffect(() => {
    setCurrentBanner(0);
  }, [activeGenderTab]);

  // Geolocation & Delivery States
  const [deliveryLocation, setDeliveryLocation] = useState("Mumbai 400001");
  const [pincodeInput, setPincodeInput] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLoc = localStorage.getItem("redsee_delivery_location");
      if (savedLoc) {
        setDeliveryLocation(savedLoc);
      }
    }
  }, []);

  const loadData = useCallback(() => {
    setFetchError(false);
    setLoadingTimedOut(false);
    const sectionParam = activeGenderTab.charAt(0).toUpperCase() + activeGenderTab.slice(1);
    dispatch(fetchHomeData(sectionParam))
      .unwrap()
      .catch(() => setFetchError(true));
  }, [dispatch, activeGenderTab]);

  useEffect(() => {
    loadData();
  }, [loadData, retryCount]);

  // Header shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShrunk((prev) => {
        if (prev) {
          return currentScrollY > 40;
        } else {
          return currentScrollY > 140;
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle active filters
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredProducts([]);
      return;
    }

    const fetchFilteredProducts = async () => {
      try {
        setLoadingFiltered(true);
        let queryCategory = activeCategory;
        if (categories && categories.length > 0) {
          const matchedDbCat = categories.find((c: any) => c.slug === activeCategory);
          if (matchedDbCat) {
            queryCategory = matchedDbCat.name;
          }
        } else {
          const matchedFallbackCat = STYLE_CATEGORIES.find((c: any) => c.slug === activeCategory);
          if (matchedFallbackCat) {
            queryCategory = matchedFallbackCat.name;
          }
        }

        let url = `/api/products?`;
        const params: string[] = [];
        params.push(`category=${encodeURIComponent(queryCategory)}`);
        params.push(`section=${encodeURIComponent(activeGenderTab)}`);

        const { data } = await api.get(url + params.join("&"));
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to fetch filtered products:", err);
      } finally {
        setLoadingFiltered(false);
      }
    };

    const debounceFetch = setTimeout(fetchFilteredProducts, 150);
    return () => clearTimeout(debounceFetch);
  }, [activeCategory, activeGenderTab, categories]);

  // Detect location
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data && data.address) {
            const pincode = data.address.postcode || "";
            const cityRaw = data.address.city || data.address.town || data.address.state_district || data.address.village || data.address.county || "";
            const city = cityRaw
              .replace(/\s+district/gi, '')
              .replace(/\s+tahsil/gi, '')
              .replace(/\s+tehsil/gi, '')
              .replace(/\s+taluk[a]?/gi, '')
              .trim();

            let finalLoc = "";
            if (pincode) {
              finalLoc = `${city ? city + " " : ""}${pincode}`;
            } else {
              finalLoc = city || data.display_name?.split(',')[0] || "Detected Location";
            }
            setDeliveryLocation(finalLoc);
            localStorage.setItem("redsee_delivery_location", finalLoc);
          } else {
            const fallbackLoc = "Detected Location (400001)";
            setDeliveryLocation(fallbackLoc);
            localStorage.setItem("redsee_delivery_location", fallbackLoc);
          }
          setShowLocationModal(false);
        } catch (e) {
          console.error("Error reverse geocoding location:", e);
          const fallbackLoc = "Bengaluru 560001";
          setDeliveryLocation(fallbackLoc);
          localStorage.setItem("redsee_delivery_location", fallbackLoc);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        const fallbackLoc = "New Delhi 110001";
        setDeliveryLocation(fallbackLoc);
        localStorage.setItem("redsee_delivery_location", fallbackLoc);
        setDetectingLocation(false);
        setShowLocationModal(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleManualPincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.trim().length >= 4) {
      const manualLoc = `Pincode: ${pincodeInput}`;
      setDeliveryLocation(manualLoc);
      localStorage.setItem("redsee_delivery_location", manualLoc);
      setShowLocationModal(false);
      setPincodeInput("");
    }
  };

  // Loading timeout
  useEffect(() => {
    if (!loading) {
      setLoadingTimedOut(false);
      return;
    }
    const timeout = setTimeout(() => {
      setLoadingTimedOut(true);
    }, 8000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const showLoading = loading && !loadingTimedOut && !fetchError;

  // Filter banners based on active gender
  const filteredBanners = banners.filter((b: any) => {
    const title = (b.title || "").toLowerCase();
    const desc = (b.description || "").toLowerCase();
    if (activeGenderTab === "men") {
      return !title.includes("women") && !desc.includes("women");
    } else {
      return !title.includes("men") && !desc.includes("men") || title.includes("women") || desc.includes("women");
    }
  });

  // Categories
  const displayCategoriesFiltered = categories && categories.length > 0
    ? categories.filter((c: any) => !c.parentCategory && c.section?.toLowerCase() === activeGenderTab.toLowerCase())
    : [];

  const displayCategories = displayCategoriesFiltered.length > 0
    ? displayCategoriesFiltered.map((c: any) => ({
        name: c.name,
        slug: c.slug,
        img: c.imageUrl || '/overts.png'
      }))
    : STYLE_CATEGORIES;

  // Slides
  const slides = filteredBanners.length > 0 ? filteredBanners : [
    {
      title: activeGenderTab === "men" ? "MEN'S COLLECTION" : activeGenderTab === "women" ? "WOMEN'S COLLECTION" : "ACCESSORIES",
      description: "New season. New direction. Same standards.",
      imageUrl: activeGenderTab === "men"
        ? "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=1000"
        : activeGenderTab === "women"
          ? "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000"
          : "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000",
      linkUrl: activeGenderTab === "men" ? "/category/men" : activeGenderTab === "women" ? "/category/women" : "/category/accessories"
    },
    {
      title: "BUY 1 HOODIE GET 1 TEE FREE",
      description: "While stock lasts. No code needed.",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000",
      linkUrl: "/shop"
    },
    {
      title: "20% OFF EVERYTHING",
      description: "Use code REDSEE20 at checkout.",
      imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000",
      linkUrl: "/shop"
    }
  ];

  // Carousel helpers
  const scrollToBanner = (idx: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const children = container.children;
    if (children[idx]) {
      const child = children[idx] as HTMLElement;
      const targetScrollLeft = child.offsetLeft - (container.clientWidth - child.clientWidth) / 2;
      container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      setCurrentBanner(idx);
    }
  };

  const goToBanner = (dir: 'prev' | 'next') => {
    if (!sliderRef.current || slides.length < 2) return;
    const container = sliderRef.current;
    const cardWidth = container.firstElementChild?.clientWidth || container.clientWidth;
    const gap = 4;
    const step = cardWidth + gap;

    let targetScrollLeft = container.scrollLeft;
    if (dir === 'next') {
      targetScrollLeft += step;
      if (targetScrollLeft >= container.scrollWidth - container.clientWidth - 20) {
        targetScrollLeft = 0;
      }
    } else {
      targetScrollLeft -= step;
      if (targetScrollLeft <= 10) {
        targetScrollLeft = container.scrollWidth - container.clientWidth;
      }
    }

    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
  };

  // Carousel auto-rotate
  useEffect(() => {
    if (slides.length > 1 && !carouselPaused) {
      const interval = setInterval(() => goToBanner('next'), 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length, carouselPaused]);

  // Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftState.current = sliderRef.current.scrollLeft;
    dragDistance.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftState.current - walk;
    dragDistance.current = Math.abs(x - startX.current);
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const children = container.children;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== currentBanner) {
      setCurrentBanner(closestIndex);
    }
  };

  const handleCardClick = (link: string) => {
    if (dragDistance.current < 6) {
      router.push(link);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-24 overflow-x-hidden transition-colors duration-300">
      {!hasLoadedOnce && (
        <LoadingScreen
          onComplete={() => {
            setLoaded(true);
            dispatch(setHasLoadedOnce());
          }}
        />
      )}

      <div
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease 0.1s",
          pointerEvents: loaded ? "auto" : "none"
        }}
      >

        {/* ═══════ STICKY HEADER ═══════ */}
        <header className={`sticky top-0 z-40 bg-[#F5F0EB] dark:bg-[#111111] border-b border-[#D5D0CA] dark:border-[#2A2A2A] transition-all duration-300 ${shrunk ? "py-2.5" : "py-4"}`}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img src={currentTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="REDSEE STORE" className={`transition-all duration-300 object-contain ${shrunk ? "h-6 md:h-7" : "h-8 md:h-9"}`} />
            </Link>

            {/* Search Bar */}
            <div
              onClick={() => router.push('/search')}
              className="flex-grow max-w-xl bg-[#EDEAE5] dark:bg-[#1A1A1A] border border-[#D5D0CA] dark:border-[#2A2A2A] rounded-sm px-4 py-2 flex items-center cursor-pointer hover:border-[#C41E24]/40 transition-colors"
            >
              <Search size={15} className="text-[#8A8580] dark:text-[#706B66] mr-3 flex-shrink-0" />
              <span className="font-[family-name:var(--font-body)] text-xs md:text-sm text-[#8A8580] dark:text-[#706B66] truncate select-none">Search products...</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {themeMounted && (
                <button
                  onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                  className="hidden md:flex p-2 rounded-sm bg-[#EDEAE5] dark:bg-[#1A1A1A] text-[#8A8580] dark:text-[#706B66] hover:text-foreground transition-colors"
                  aria-label="Toggle Theme"
                >
                  {currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              )}
              <Link href="/cart" className="hidden md:flex p-2 rounded-sm bg-[#EDEAE5] dark:bg-[#1A1A1A] text-[#8A8580] dark:text-[#706B66] hover:text-foreground transition-colors relative" aria-label="Cart">
                <ShoppingBag size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C41E24] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/profile" className="p-2 rounded-sm bg-[#EDEAE5] dark:bg-[#1A1A1A] text-[#8A8580] dark:text-[#706B66] hover:text-foreground transition-colors" aria-label="Profile">
                <User size={16} />
              </Link>
            </div>
          </div>

          {/* Section Toggle: Men / Women / Accessories */}
          <div className={`transition-all duration-300 overflow-hidden ${shrunk ? "max-h-0 opacity-0 pointer-events-none" : "max-h-16 opacity-100 mt-3 border-t border-[#D5D0CA] dark:border-[#2A2A2A]"}`}>
            <div className="flex justify-center px-4 py-2.5">
              <div className="flex gap-1">
                {(["men", "women", "accessories"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      handleGenderTabChange(tab);
                      setActiveCategory('all');
                    }}
                    className={`px-5 py-1.5 text-xs font-[family-name:var(--font-heading)] font-semibold tracking-[0.15em] uppercase transition-colors duration-200 ${
                      activeGenderTab === tab
                        ? 'bg-[#C41E24] text-white'
                        : 'text-[#8A8580] dark:text-[#706B66] hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Filter Results */}
        {activeCategory !== "all" ? (
          <div className="px-4 py-8 max-w-7xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">Filtered</span>
                <h2 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight">
                  {(() => {
                    if (categories && categories.length > 0) {
                      const found = categories.find((c: any) => c.slug === activeCategory);
                      if (found) return found.name;
                    }
                    const fallback = STYLE_CATEGORIES.find((c: any) => c.slug === activeCategory);
                    if (fallback) return fallback.name;
                    return activeCategory;
                  })()} — {activeGenderTab === "men" ? "Men" : activeGenderTab === "women" ? "Women" : "Accessories"}
                </h2>
              </div>
              <button
                onClick={() => setActiveCategory("all")}
                className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580] hover:text-foreground underline underline-offset-4"
              >
                Clear
              </button>
            </div>

            {loadingFiltered ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-full">
                    <div className="aspect-[3/4] skeleton mb-3" />
                    <div className="h-4 skeleton w-3/4 mb-2" />
                    <div className="h-4 skeleton w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    price={product.pricing?.finalPrice || 0}
                    image={typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '')}
                    hoverImage={typeof product.images?.[1] === 'string' ? product.images[1] : (product.images?.[1]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '')))}
                    category={product.category}
                    rating={5}
                    discount={product.pricing?.discountPercentage || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A]">
                <p className="text-[#8A8580] dark:text-[#706B66] font-[family-name:var(--font-body)] text-sm mb-4">Nothing here yet.</p>
                <button
                  onClick={() => setActiveCategory("all")}
                  className="bg-[#C41E24] text-white text-xs px-5 py-2.5 font-[family-name:var(--font-heading)] font-semibold tracking-wider uppercase hover:bg-[#a01a1f] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ═══════ MAIN HOMEPAGE FLOW ═══════ */
          <div className="animate-fadeIn">

            {/* ─── CATEGORY NAVIGATION STRIP ─── */}
            <div className="border-b border-[#D5D0CA] dark:border-[#2A2A2A] py-4">
              <div className="flex overflow-x-auto no-scrollbar px-4 gap-6 md:gap-10 md:justify-center">
                {displayCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      if (cat.slug === "men" || cat.slug === "women" || cat.slug === "accessories") {
                        handleGenderTabChange(cat.slug as any);
                      } else {
                        router.push(`/category/${cat.slug}`);
                      }
                    }}
                    className="flex flex-col items-center gap-2 min-w-[60px] group cursor-pointer"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden border border-[#D5D0CA] dark:border-[#2A2A2A] group-hover:border-foreground transition-colors duration-200 bg-surface">
                      <img src={optimizeImageUrl(cat.img, 150)} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-[family-name:var(--font-heading)] font-medium text-[#8A8580] dark:text-[#706B66] group-hover:text-foreground transition-colors whitespace-nowrap uppercase tracking-wider">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ─── DELIVERY BAR ─── */}
            <div className="bg-surface border-b border-[#D5D0CA] dark:border-[#2A2A2A] py-2.5 px-4 flex items-center justify-between text-[11px] font-[family-name:var(--font-body)]">
              <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate text-[#8A8580] dark:text-[#706B66]">
                  <MapPin size={13} className="text-[#C41E24] flex-shrink-0" />
                  <span className="truncate">Deliver to <strong className="text-foreground">{deliveryLocation}</strong></span>
                </div>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="text-[#C41E24] font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider text-[10px] hover:text-foreground transition-all ml-2"
                >
                  Change
                </button>
              </div>
            </div>

            {/* ─── HERO EDITORIAL SLIDER ─── */}
            <div className="relative w-full mt-0">
              {showLoading ? (
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                  <div className="w-full h-[28vh] md:h-[50vh] skeleton" />
                </div>
              ) : (
                <div className="relative group w-full">
                  <div
                    ref={sliderRef}
                    onScroll={handleSliderScroll}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    className="flex gap-1 overflow-x-auto py-0 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing select-none scroll-smooth"
                  >
                    {slides.map((item: any, idx: number) => {
                      const imgSrc = item.imageUrl || item.img || '';
                      const title = item.title || '';
                      const desc = item.description || item.sub || '';
                      const link = item._id ? `/offers/${item._id}` : (item.linkUrl || item.link || item.href || '/shop');

                      return (
                        <div
                          key={idx}
                          onClick={() => handleCardClick(link)}
                          className="w-[92vw] md:w-[70vw] lg:w-[60vw] h-[28vh] md:h-[50vh] flex-shrink-0 snap-center overflow-hidden relative transition-transform duration-300"
                        >
                          <img
                            src={optimizeImageUrl(imgSrc, 1200)}
                            alt={title || `Slide ${idx + 1}`}
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                            draggable={false}
                          />

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                          {/* Text */}
                          <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-10 z-10 w-full select-none max-w-xl">
                            <h2 className="text-xl md:text-4xl lg:text-5xl font-[family-name:var(--font-heading)] font-bold text-white tracking-tight leading-none mb-1 md:mb-2">
                              {title}
                            </h2>
                            <p className="text-white/70 text-[11px] md:text-sm font-[family-name:var(--font-body)] line-clamp-1 md:line-clamp-2 mb-3 md:mb-5">
                              {desc}
                            </p>
                            <div className="flex">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCardClick(link); }}
                                className="bg-white text-[#1A1A1A] hover:bg-[#C41E24] hover:text-white px-4 py-2 md:px-6 md:py-2.5 text-[10px] md:text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-[0.15em] transition-colors cursor-pointer"
                              >
                                Shop Now
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Controls */}
                  {slides.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToBanner('prev'); }}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1A1A1A]/90 border border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#C41E24] hover:text-white hover:border-[#C41E24] transition-all z-20 cursor-pointer"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToBanner('next'); }}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1A1A1A]/90 border border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#C41E24] hover:text-white hover:border-[#C41E24] transition-all z-20 cursor-pointer"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}

                  {/* Indicators */}
                  {slides.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {slides.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); scrollToBanner(idx); }}
                          className={`transition-all duration-300 ${
                            idx === currentBanner
                              ? 'w-8 h-[2px] bg-[#C41E24]'
                              : 'w-4 h-[2px] bg-[#D5D0CA] dark:bg-[#2A2A2A] hover:bg-[#8A8580]'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── RECENTLY VIEWED ─── */}
            <RecentlyViewedShelf section={activeGenderTab} />

            {/* ─── NEW THIS WEEK ─── */}
            <ProductShelf
              title="New This Week"
              subtitle="Latest arrivals"
              products={getFilteredProducts(justDropped)}
              loading={showLoading}
              link={activeGenderTab === "men" ? "/category/men" : activeGenderTab === "women" ? "/category/women" : "/category/accessories"}
            />

            {/* ─── TRENDING ─── */}
            <ProductShelf
              title="Trending"
              subtitle="What people are buying"
              products={getFilteredProducts(trendingNow)}
              loading={showLoading}
              link={activeGenderTab === "men" ? "/category/men" : activeGenderTab === "women" ? "/category/women" : "/category/accessories"}
            />

            {/* ─── BEST SELLERS ─── */}
            <ProductShelf
              title="Best Sellers"
              subtitle="Proven favourites"
              products={getFilteredProducts(bestSellers)}
              loading={showLoading}
              link={activeGenderTab === "men" ? "/category/men" : activeGenderTab === "women" ? "/category/women" : "/category/accessories"}
            />

            {/* ─── LOW STOCK ─── */}
            <LimitedDropShelf
              title="Low Stock"
              subtitle="Selling fast"
              products={getFilteredProducts(limitedDrops)}
              loading={showLoading}
            />

            {/* ─── ON SALE ─── */}
            <ProductShelf
              title="On Sale"
              subtitle="Marked down"
              products={getFilteredProducts(offersForYou)}
              loading={showLoading}
              link={activeGenderTab === "men" ? "/category/men" : activeGenderTab === "women" ? "/category/women" : "/category/accessories"}
            />

            {/* ─── LOOKBOOK ─── */}
            <LookbookSection />
          </div>
        )}

        {/* ─── TRUST LINE ─── */}
        <div className="bg-background border-t border-[#D5D0CA] dark:border-[#2A2A2A] py-10 px-4 md:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: "Premium Materials", desc: "Sourced and stitched with intent", icon: Crown },
              { title: "Secure Checkout", desc: "Encrypted end-to-end", icon: ShieldCheck },
              { title: "Fast Delivery", desc: "Express shipping across India", icon: Truck },
              { title: "Easy Returns", desc: "4-day no-questions replacement", icon: RotateCcw },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-start text-left">
                  <Icon size={20} className="text-[#C41E24] mb-3" />
                  <h4 className="text-foreground text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider mb-1">{item.title}</h4>
                  <p className="text-[#8A8580] dark:text-[#706B66] text-[11px] font-[family-name:var(--font-body)] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── PINCODE MODAL ─── */}
        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowLocationModal(false)}
            />
            <div className="relative bg-[#F5F0EB] dark:bg-[#1A1A1A] border border-[#D5D0CA] dark:border-[#2A2A2A] w-full max-w-sm p-6 shadow-xl z-10 animate-fadeIn">
              <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight mb-2">Delivery Location</h3>
              <p className="text-[#8A8580] dark:text-[#706B66] text-xs font-[family-name:var(--font-body)] mb-5">Where should we ship your order?</p>

              <button
                onClick={handleAutoDetectLocation}
                disabled={detectingLocation}
                className="w-full bg-[#C41E24] text-white py-3 font-[family-name:var(--font-heading)] font-semibold tracking-[0.1em] text-[11px] uppercase flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 mb-4 hover:bg-[#a01a1f]"
              >
                <MapPin size={14} />
                <span>{detectingLocation ? "Locating..." : "Use Current Location"}</span>
              </button>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-[#D5D0CA] dark:border-[#2A2A2A]" />
                <span className="px-3 text-[10px] font-[family-name:var(--font-heading)] text-[#8A8580] dark:text-[#706B66] uppercase tracking-widest">Or enter pincode</span>
                <hr className="flex-grow border-[#D5D0CA] dark:border-[#2A2A2A]" />
              </div>

              <form onSubmit={handleManualPincodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 400001"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  className="flex-1 bg-[#EDEAE5] dark:bg-[#111111] border border-[#D5D0CA] dark:border-[#2A2A2A] px-3 py-2.5 text-foreground text-xs font-[family-name:var(--font-body)] outline-none focus:border-[#C41E24] transition-colors"
                />
                <button
                  type="submit"
                  className="bg-foreground text-background hover:bg-[#C41E24] hover:text-white px-4 font-[family-name:var(--font-heading)] font-semibold text-xs uppercase transition-colors"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Error / Retry Banner */}
        {(fetchError || loadingTimedOut) && (
          <div className="mx-4 mt-4 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] px-4 py-3 flex items-center justify-between">
            <p className="text-[#8A8580] text-xs font-[family-name:var(--font-body)]">
              {fetchError ? 'Could not load products.' : 'Taking longer than expected.'}
            </p>
            <button
              onClick={() => setRetryCount(c => c + 1)}
              className="flex items-center gap-1.5 text-[#C41E24] text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── PRODUCT SHELF ─────────────────────────────────────
interface ShelfProps {
  title: string;
  subtitle: string;
  products: any[];
  loading: boolean;
  link: string;
}

function ProductShelf({ title, subtitle, products, loading, link }: ShelfProps) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="px-4 py-12 md:px-8 border-b border-[#D5D0CA] dark:border-[#2A2A2A] bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">
              {subtitle}
            </span>
            <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight">
              {title}
            </h2>
          </div>
          <Link
            href={link}
            className="text-[11px] font-[family-name:var(--font-heading)] font-medium text-[#8A8580] dark:text-[#706B66] uppercase tracking-[0.15em] flex items-center hover:text-foreground transition-colors"
          >
            View All <ChevronRight size={12} className="ml-0.5" />
          </Link>
        </div>

        <div className="flex overflow-x-auto no-scrollbar pb-3 gap-1 snap-x snap-mandatory">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[170px] md:w-[220px] flex-shrink-0">
                <div className="aspect-[3/4] skeleton mb-3" />
                <div className="h-4 skeleton w-3/4 mb-2" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            ))
          ) : (
            products.map((product: any) => (
              <div key={product._id} className="w-[170px] md:w-[220px] flex-shrink-0 snap-start">
                <ProductCard
                  id={product._id}
                  name={product.name}
                  price={product.pricing?.finalPrice || 0}
                  image={typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '')}
                  hoverImage={typeof product.images?.[1] === 'string' ? product.images[1] : (product.images?.[1]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '')))}
                  category={product.category}
                  rating={5}
                  discount={product.pricing?.discountPercentage || 0}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// ─── LIMITED / LOW STOCK SHELF ─────────────────────────
function LimitedDropShelf({ title, subtitle, products, loading }: { title: string; subtitle: string; products: any[]; loading: boolean }) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="px-4 py-12 md:px-8 border-b border-[#D5D0CA] dark:border-[#2A2A2A] bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div>
            <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">
              {subtitle}
            </span>
            <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold text-foreground tracking-tight">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar pb-3 gap-1 snap-x snap-mandatory">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[170px] md:w-[220px] flex-shrink-0">
                <div className="aspect-[3/4] skeleton mb-3" />
                <div className="h-4 skeleton w-3/4 mb-2" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            ))
          ) : (
            products.map((product: any) => {
              const left = product.totalStock !== undefined
                ? product.totalStock
                : (product.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0);
              return (
                <div key={product._id} className="w-[170px] md:w-[220px] flex-shrink-0 snap-start relative">
                  <ProductCard
                    id={product._id}
                    name={product.name}
                    price={product.pricing?.finalPrice || 0}
                    image={typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '')}
                    hoverImage={typeof product.images?.[1] === 'string' ? product.images[1] : (product.images?.[1]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || '')))}
                    category={product.category}
                    rating={5}
                    discount={product.pricing?.discountPercentage || 0}
                  />
                  <div className="absolute bottom-[108px] left-1 bg-foreground text-background px-2 py-0.5 text-[9px] font-[family-name:var(--font-heading)] font-semibold tracking-wider z-10 uppercase">
                    {left} left
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
