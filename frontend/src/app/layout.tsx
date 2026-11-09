import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StoreProvider from "@/components/StoreProvider";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  metadataBase: new URL("https://redsee.com"),
  title: "Redsee Store | Futuristic Fashion",
  description: "Premium futuristic fashion and streetwear by Redsee Store",
  applicationName: "Redsee Store",
  openGraph: {
    title: "Redsee Store | Futuristic Fashion",
    description: "Premium futuristic streetwear.",
    images: [
      {
        url: "/logo-dark.png",
        width: 500,
        height: 500,
        alt: "Redsee Store Logo",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redsee Store | Futuristic Fashion",
    description: "Premium futuristic streetwear.",
    images: ["/logo-dark.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/favicon.png?v=2", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=2" }
    ]
  }
};

import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#C41E24",
};

import { ThemeProvider } from "@/components/ThemeProvider";

import BottomNav from "@/components/BottomNav";
import RecentlyViewedSync from "@/components/RecentlyViewedSync";
import WishlistSync from "@/components/WishlistSync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-300 pb-16 md:pb-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <AuthGuard>
              <RecentlyViewedSync />
              <WishlistSync />
              <Navbar />
              <main className="min-h-[100dvh]">
                {children}
              </main>
              <Footer />
              <BottomNav />
            </AuthGuard>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
