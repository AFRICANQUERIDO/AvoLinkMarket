import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import ChatWidget from "@/components/chat-widget";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Our Products", path: "/products" },
    { label: "Market News", path: "/market" },
    { label: "Admin Portal (CRM)", path: "/admin" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Top Ticker */}
      <div className="bg-primary text-primary-foreground py-1 overflow-hidden whitespace-nowrap text-xs font-medium tracking-wider">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="inline-block"
        >
          AVO OIL (CRUDE): €3.85/KG ▲ 1.2% | AVO OIL (EXTRA VIRGIN): €9.20/KG ▲
          0.5% | AVO OIL (REFINED): €5.10/KG ▼ 0.1% | EUROPEAN DEMAND: HIGH |
          NEXT SHIPMENT: ROTTERDAM 12/12
        </motion.div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 group cursor-pointer py-2"
          >
            <div className="relative">
              <img
                src="/Avolink_logo.png"
                alt="AvoLink Logo"
                /* h-10 makes it much bigger; multiply-mix removes white backgrounds */
                className="h-20 w-auto object-contain transition-all duration-300 group-hover:scale-110 mix-blend-multiply"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="flex flex-col">
              <span className="font-heading text-3xl font-black leading-none tracking-tighter text-primary uppercase">
                AvoLink
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground -mt-1">
                Global Linkages
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-secondary ${
                  location === item.path
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/products"
              className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Request Quote
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="flex flex-col p-4 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium ${
                    location === item.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Leaf className="text-secondary" />
                <span className="font-heading text-2xl font-bold">AvoLink</span>
              </div>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                Linking premium African avocado processors to the global market.
                Quality, transparency, and sustainable trade.
              </p>
            </div>

            <div>
              <h4 className="font-heading text-lg mb-4 text-secondary">
                Products
              </h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <Link href="/products" className="hover:text-white">
                    Crude Avocado Oil
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">
                    Extra Virgin Oil
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">
                    Refined Oil
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">
                    Organic Cosmetics Base
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-lg mb-4 text-secondary">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <Link href="/" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/market" className="hover:text-white">
                    Processors
                  </Link>
                </li>
                <li>
                  <Link href="/market" className="hover:text-white">
                    Market Reports
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-lg mb-4 text-secondary">
                Subscribe
              </h4>
              <p className="text-xs text-primary-foreground/60 mb-4">
                Get weekly market updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 px-3 py-2 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-bold hover:bg-white transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-xs text-primary-foreground/40">
            © 2025 AvoTrade Global Linkages. All rights reserved.
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
