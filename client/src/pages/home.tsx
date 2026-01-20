import { motion } from "framer-motion";
import { ArrowRight, Droplets, Globe, TrendingUp, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import oilImage from "@assets/generated_images/premium_avocado_oil_pouring.png";
import factoryImage from "@assets/generated_images/modern_avocado_processing_facility.png";
import logisticsImage from "@assets/generated_images/global_trade_logistics_map.png";

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-primary overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={oilImage} 
            alt="Premium Avocado Oil" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent mix-blend-multiply"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
              <Globe size={12} /> B2B Global Marketplace
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight">
              Premium Avocado Oil <span className="text-secondary italic">Market Linkages</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed">
              Connecting European buyers directly with verified African processors. 
              Source bulk Crude, Virgin, and Refined Avocado Oil with complete transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/products#avocado-section">
                <a className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-white transition-colors">
                  Avocado Products <ArrowRight size={20} />
                </a>
              </Link>
              <Link href="/products#macadamia-section">
                <a className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors backdrop-blur-sm">
                  Macadamia Products <ArrowRight size={20} />
                </a>
              </Link>
            </div>
          </motion.div>
          
          {/* Floating Stats Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block justify-self-end"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl text-white max-w-xs shadow-2xl transform rotate-3">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-secondary rounded-full text-secondary-foreground">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-70">Weekly Demand</p>
                  <p className="text-2xl font-bold">+24% Growth</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                  <span>Crude Oil</span>
                  <span className="font-bold text-secondary">€3.85/kg</span>
                </div>
                <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                  <span>Extra Virgin</span>
                  <span className="font-bold text-secondary">€9.20/kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Refined</span>
                  <span className="font-bold text-secondary">€5.10/kg</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4">Streamlined Market Linkages</h2>
            <p className="text-muted-foreground text-lg">
              We bridge the gap between local processors and the international market, ensuring fair trade and quality assurance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:border-secondary/50 transition-colors group">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">Verified Processors</h3>
              <p className="text-muted-foreground">Every processor on our platform is vetted for quality standards, certifications (HACCP, ISO), and production capacity.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:border-secondary/50 transition-colors group">
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-700 mb-6 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                <Droplets size={28} />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">Quality Assurance</h3>
              <p className="text-muted-foreground">Detailed product specs for every batch. FFA content, Peroxide value, and organoleptic profiles available upfront.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:border-secondary/50 transition-colors group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Globe size={28} />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">Logistics Support</h3>
              <p className="text-muted-foreground">We facilitate the connection including sample shipping, documentation, and bulk freight coordination.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Split Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src={factoryImage} alt="Processing Factory" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-8">
            <h2 className="font-heading text-4xl font-bold text-primary">Direct from Source to Shelf</h2>
            <p className="text-lg text-muted-foreground">
              By cutting out multiple middlemen, we offer better prices for buyers and higher margins for processors. Our platform provides visibility into the supply chain that was previously impossible.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-lg">Browse Catalogue</h4>
                  <p className="text-sm text-muted-foreground">Access real-time availability of crude and refined oils.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-lg">Request Samples</h4>
                  <p className="text-sm text-muted-foreground">Order samples directly from multiple processors to test quality.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-lg">Secure Contracts</h4>
                  <p className="text-sm text-muted-foreground">Finalize long-term supply contracts with vetted partners.</p>
                </div>
              </div>
            </div>

            <Link href="/products">
              <a className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
                Start Sourcing
              </a>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
