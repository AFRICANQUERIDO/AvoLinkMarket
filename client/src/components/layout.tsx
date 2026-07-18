import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Menu, X, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import ChatWidget from "@/components/chat-widget";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"; // 👈 1. Imported toast hook

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useToast(); // 👈 2. Initialized toast method context

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Our Products", path: "/products" },
    { label: "Market News", path: "/market" },
  ];

  // 🔒 Hidden Admin Shortcut: Press Ctrl + Shift + A anywhere on the site to teleport to the login screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setLocation("/login");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setLocation]);

  // 🎯 Unified handler for the Quote request action
  const handleQuoteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location === "/products") {
      e.preventDefault();
      const targetElement = document.getElementById("enquiry-form");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchValue(query);
    const params = new URLSearchParams(window.location.search);
    if (query) params.set("search", query);
    else params.delete("search");

    const newPath = window.location.pathname + "?" + params.toString();
    window.history.replaceState(null, "", newPath);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* Top Ticker */}
      <div className="bg-primary text-primary-foreground py-1 overflow-hidden whitespace-nowrap text-xs font-medium tracking-wider">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="inline-block"
        >
          AVO OIL (CRUDE): $4.25/KG ▲ 1.2% | AVO OIL (EXTRA VIRGIN): $10.15/KG ▲ 0.5% | AVO OIL (REFINED): $5.35/KG ▲ 0.8%
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
                src="/Final_image.jpg"
                alt="AvoLink Logo"
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
                International
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground -mt-1">
                B2B Avocado & Macadamia Marketplace
              </span>
            </div>
          </Link>

          {/* --- GLOBAL SEARCH BAR --- */}
          <div className="hidden lg:flex relative flex-1 max-w-sm mx-8">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Menu size={16} className="rotate-90 opacity-40" />
            </div>
            <Input
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search market, products, or leads..."
              className="pl-10 h-10 bg-muted/50 border-none focus-visible:ring-primary/20 rounded-full"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-secondary ${location === item.path
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
                  }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/products#enquiry-form"
              onClick={handleQuoteClick}
              className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer"
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
                  className={`text-lg font-medium ${location === item.path ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/products#enquiry-form"
                onClick={handleQuoteClick}
                className="bg-primary text-white px-5 py-2.5 rounded-full text-center text-sm font-medium hover:bg-primary/90 transition-all"
              >
                Request Quote
              </Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-20">
        <div className="container mx-auto px-4">
          
          {/* Top Row: Brand Info + Newsletter Grid */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-white/10">
            <div className="max-w-xl space-y-2">
              <div className="flex items-center gap-2">
                <Leaf className="text-secondary shrink-0" />
                <span className="font-heading text-xl font-bold tracking-tight">AvoLink International</span>
              </div>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                Linking premium African avocado and macadamia processors to the global market. 
                Quality, transparency, and sustainable trade.
              </p>
            </div>

            <div className="w-full md:max-w-sm shrink-0">
              <h4 className="font-heading text-sm font-bold tracking-wider uppercase text-secondary mb-2">Subscribe</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formTarget = e.currentTarget as HTMLFormElement;
                  const inputElement = formTarget.elements.namedItem("subscriberEmail") as HTMLInputElement;

                  toast({
                    title: "Newsletter Coming Soon! 🚀",
                    description: "We are finalizing our market intelligence reports. We'll let you know when they go live!",
                  });

                  if (inputElement) inputElement.value = "";
                }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  name="subscriberEmail"
                  required
                  placeholder="Email address for updates..."
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-3 py-2 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <button
                  type="submit"
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-bold hover:bg-white transition-colors flex items-center justify-center min-w-[64px]"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Row: Horizontal Links + Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-sm">
            
            {/* Horizontal Links Navigation */}
            <nav className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-primary-foreground/70">
              <Link
                href="/products"
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  if (window.location.pathname === "/products") {
                    e.preventDefault();
                    window.history.replaceState(null, "", "/products");
                    window.dispatchEvent(new Event("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    window.scrollTo(0, 0);
                  }
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Products
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                About Us
              </Link>
              <Link 
                href="/products#enquiry-form" 
                onClick={handleQuoteClick} 
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="text-xs text-primary-foreground/40 text-center sm:text-right">
              © {new Date().getFullYear()} AvoTrade Global Linkages. All rights reserved.
            </div>
          </div>

        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}