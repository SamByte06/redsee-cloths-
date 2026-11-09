"use client";
import Link from "next/link";
import { Trash2, ArrowRight, ArrowLeft, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart, removeFromCart } from "@/store/cartSlice";
import { useRouter } from "next/navigation";
import { optimizeImageUrl } from "@/lib/image";

export default function Cart() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { cartItems } = useSelector((state: RootState) => state.cart);

  const updateQuantity = (item: any, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(addToCart({ ...item, quantity: newQuantity }));
  };

  const removeItem = (product: string, size: string, color: string) => {
    dispatch(removeFromCart({ product, size, color }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal > 0 ? subtotal + shipping : 0;

  return (
    <div className="bg-background min-h-screen pb-32 md:pb-16 text-foreground">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#F5F0EB] dark:bg-[#111111] border-b border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="text-foreground mr-3">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-[family-name:var(--font-heading)] font-bold tracking-wider uppercase">Your Bag</h1>
        </div>
        <span className="text-xs font-[family-name:var(--font-heading)] text-[#8A8580]">{cartItems.length} items</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="mb-10 pb-4 border-b border-[#D5D0CA] dark:border-[#2A2A2A] hidden md:block">
          <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">
            Checkout Process
          </span>
          <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-heading)] font-bold tracking-tight">Shopping Bag</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center border border-[#D5D0CA] dark:border-[#2A2A2A] bg-surface">
            <div className="w-16 h-16 bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-center mb-6">
              <ShoppingBag size={24} className="text-[#8A8580]" />
            </div>
            <h2 className="text-2xl font-[family-name:var(--font-heading)] font-bold mb-2">Your bag is empty</h2>
            <p className="text-xs font-[family-name:var(--font-body)] text-[#8A8580] mb-6 max-w-sm">No items in your bag yet. Browse the latest drops and pick your sizes.</p>
            <Link href="/shop">
              <button className="bg-[#C41E24] text-white px-8 py-3 font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] font-semibold text-xs hover:bg-[#a01a1f] transition-colors cursor-pointer">
                Explore Collection
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12">
            
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-3">
              {/* Free Shipping Alert */}
              {shipping > 0 && (
                <div className="bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] p-4 flex items-center justify-between text-xs font-[family-name:var(--font-body)]">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-[#C41E24]" />
                    <span>Add <strong className="text-foreground">₹{(999 - subtotal).toFixed(2)}</strong> more for free express shipping.</span>
                  </div>
                  <div className="w-24 h-1 bg-[#D5D0CA] dark:bg-[#2A2A2A] overflow-hidden hidden sm:block">
                    <div className="h-full bg-[#C41E24]" style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }}></div>
                  </div>
                </div>
              )}

              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border border-[#D5D0CA] dark:border-[#2A2A2A] bg-background relative">
                  <div className="w-20 h-28 md:w-28 md:h-36 flex-shrink-0 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] overflow-hidden">
                    <img src={optimizeImageUrl(item.image, 180)} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div className="pr-8">
                      <h3 className="text-base md:text-lg font-[family-name:var(--font-heading)] font-semibold tracking-wide leading-tight mb-1">{item.title}</h3>
                      <p className="text-[10px] md:text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580] mb-2">
                        {item.color} / {item.size}
                      </p>
                      <span className="text-sm md:text-base font-[family-name:var(--font-body)] font-bold">₹{item.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex border border-[#D5D0CA] dark:border-[#2A2A2A] h-9">
                        <button onClick={() => updateQuantity(item, item.quantity - 1)} className="px-3 hover:text-[#C41E24]">-</button>
                        <input type="text" value={item.quantity} readOnly className="w-8 bg-transparent text-center font-[family-name:var(--font-body)] text-xs font-bold outline-none" />
                        <button onClick={() => updateQuantity(item, item.quantity + 1)} className="px-3 hover:text-[#C41E24]">+</button>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeItem(item.product, item.size, item.color)} 
                      className="absolute top-4 right-4 text-[#8A8580] hover:text-[#C41E24] transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] p-6 lg:sticky lg:top-24">
                <h3 className="text-lg font-[family-name:var(--font-heading)] font-bold uppercase tracking-wider mb-6">Summary</h3>
                
                <div className="space-y-3 mb-6 font-[family-name:var(--font-body)] text-xs">
                  <div className="flex justify-between text-[#8A8580]">
                    <span>Subtotal</span>
                    <span className="text-foreground font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#8A8580]">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-[#C41E24] font-semibold" : "text-foreground font-semibold"}>
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-[#D5D0CA] dark:border-[#2A2A2A] pt-3 flex justify-between font-bold text-foreground text-sm">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout">
                  <button className="w-full bg-[#C41E24] text-white py-3.5 font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-[#a01a1f] transition-colors cursor-pointer">
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={14} />
                  </button>
                </Link>
                <div className="mt-4 flex items-center justify-center space-x-2 text-[#8A8580] text-[11px] font-[family-name:var(--font-body)]">
                  <ShieldCheck size={14} className="text-[#C41E24]" />
                  <span>Secure SSL Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
