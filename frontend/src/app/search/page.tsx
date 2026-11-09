'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, ArrowLeft, TrendingUp, X, Mic, MicOff } from 'lucide-react';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [instantResults, setInstantResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setQuery(transcript);
            triggerSearch(transcript);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    const saved = localStorage.getItem('redsee_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setInstantResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoadingResults(true);
        const { data } = await api.get(`/api/products?keyword=${encodeURIComponent(query)}`);
        setInstantResults(data);
      } catch (err) {
        console.error('Failed to fetch instant results:', err);
      } finally {
        setLoadingResults(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const triggerSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const newRecents = [searchQuery, ...recentSearches.filter(q => q !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecents);
    localStorage.setItem('redsee_recent_searches', JSON.stringify(newRecents));

    router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(query);
  };

  const trendingSearches = [
    "Oversized Tees",
    "Heavyweight Hoodies",
    "Cargo Trousers",
    "Workwear Jackets",
    "Boxy Shirts"
  ];

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground transition-colors duration-300">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-[#F5F0EB] dark:bg-[#111111] px-4 py-3 border-b border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center space-x-3">
        <button onClick={() => router.back()} className="text-foreground p-1 -ml-1">
          <ArrowLeft size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
          <SearchIcon size={15} className="absolute left-3.5 text-[#8A8580]" />
          <input
            type="text"
            autoFocus
            placeholder="Search drops, silhouettes, colors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] pl-10 pr-20 py-2 text-foreground text-xs md:text-sm font-[family-name:var(--font-body)] outline-none"
          />
          <div className="absolute right-3 flex items-center space-x-2">
            {query && (
              <button 
                type="button" 
                onClick={() => setQuery('')}
                className="text-[#8A8580] hover:text-foreground"
              >
                <X size={15} />
              </button>
            )}
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`p-1 transition-all ${
                  isListening ? 'text-[#C41E24]' : 'text-[#8A8580] hover:text-foreground'
                }`}
                title="Voice search"
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="px-4 mt-8 max-w-5xl mx-auto">
        {/* Voice indicator */}
        {isListening && (
          <div className="mb-6 bg-surface border border-[#C41E24] p-4 flex flex-col items-center justify-center">
            <Mic size={24} className="text-[#C41E24] mb-2 animate-pulse" />
            <p className="text-foreground font-[family-name:var(--font-heading)] font-semibold text-xs tracking-wider uppercase">Listening</p>
            <p className="text-[#8A8580] text-xs font-[family-name:var(--font-body)] mt-1">Speak piece name or style</p>
          </div>
        )}

        {/* Live suggestions */}
        {query.trim() && (
          <div>
            <h3 className="text-[11px] font-[family-name:var(--font-heading)] uppercase tracking-[0.2em] text-[#C41E24] font-medium mb-4">
              Matches
            </h3>

            {loadingResults ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] skeleton mb-2"></div>
                    <div className="h-3 skeleton w-3/4 mb-1.5"></div>
                    <div className="h-3 skeleton w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : instantResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {instantResults.map((product) => (
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
            ) : (
              <div className="text-center py-16 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A]">
                <p className="text-[#8A8580] font-[family-name:var(--font-body)] text-xs">No items matched "{query}".</p>
              </div>
            )}
          </div>
        )}

        {/* Default content */}
        {!query.trim() && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#D5D0CA] dark:border-[#2A2A2A]">
                  <h3 className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580]">Recent</h3>
                  <button 
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('redsee_recent_searches');
                    }}
                    className="text-[10px] text-[#C41E24] font-[family-name:var(--font-heading)] uppercase tracking-wider hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setQuery(term);
                        triggerSearch(term);
                      }}
                      className="px-3 py-1.5 border border-[#D5D0CA] dark:border-[#2A2A2A] bg-surface text-xs font-[family-name:var(--font-body)] text-foreground hover:border-foreground transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-4 pb-2 border-b border-[#D5D0CA] dark:border-[#2A2A2A] flex items-center justify-between">
                <h3 className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580] flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-[#C41E24]" />
                  Trending Searches
                </h3>
              </div>
              <div className="space-y-1">
                {trendingSearches.map((term, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setQuery(term);
                      triggerSearch(term);
                    }}
                    className="flex items-center space-x-3 py-2.5 px-3 bg-surface hover:bg-background border border-transparent hover:border-[#D5D0CA] dark:hover:border-[#2A2A2A] transition-colors cursor-pointer group"
                  >
                    <SearchIcon size={13} className="text-[#8A8580] group-hover:text-[#C41E24] transition-colors" />
                    <span className="text-xs font-[family-name:var(--font-body)] text-foreground">{term}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
