import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Calendar, Globe, Search } from "lucide-react";

interface MarketReport {
  id: number;
  date: string;
  tag: "Supply Chain" | "Market Growth" | "Regulation" | "Trade Flows";
  title: string;
  excerpt: string;
}

const staticNews: MarketReport[] = [
  {
    id: 1,
    date: "Jun 28, 2026",
    tag: "Supply Chain",
    title: "Flexitank Adaptations Surge for Mombasa Crude Shipments",
    excerpt: "To combat the 14-day transit delay around the Cape of Good Hope, East African processors are transitioning from steel drums to 24,000-liter multi-layer Flexitanks, optimizing freight utilization by 18% per container."
  },
  {
    id: 2,
    date: "May 15, 2026",
    tag: "Regulation",
    title: "AFA Reinstates Raw In-Shell Macadamia Export Ban",
    excerpt: "The Agriculture and Food Authority has strictly enforced the raw nut export ban to drive domestic value-addition, forcing a market shift toward fully processed Style 0 and Style 1 kernels for international buyers."
  },
  {
    id: 3,
    date: "May 01, 2026",
    tag: "Trade Flows",
    title: "Zero-Tariff China-Kenya Macadamia Window Opens",
    excerpt: "The historic 0% bilateral tariff agreement on processed Kenyan nuts takes effect today. Industry analysts project an immediate 14.4% year-on-year volume pull toward East Asian logistics hubs."
  },
  {
    id: 4,
    date: "Apr 12, 2026",
    tag: "Market Growth",
    title: "European Clean-Label Trends Boost Cold-Pressed Demand",
    excerpt: "Industrial food service buyers across northern Europe are expanding orders for Extra Virgin Avocado oil to replace traditional seed oils, driving a 5.9% regional CAGR ahead of the Q3 harvest spike."
  }
];

export default function Market() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNews = useMemo(() => {
    return staticNews.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-background pb-20">

      {/* 🟢 Flattened Horizontal Header Bar */}
      <div className="bg-primary text-white border-b border-primary-foreground/10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="font-heading text-xl font-bold tracking-tight">
              Market Intelligence
            </h1>
            <p className="text-xs text-white/70">
              Real-time 2026 insights into the East African oil corridor and pricing trends.
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <input
              type="text"
              placeholder="Filter updates..."
              className="w-full h-9 pl-4 pr-10 rounded-md bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white focus:text-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-white/40 pointer-events-none">
              <Search size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content Container */}
      <div className="container mx-auto px-4 mt-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Spotlight Feature + Feed */}
          <div className="lg:col-span-2 space-y-6">

            {/* Structural Spotlight Card */}
            <Card className="border-none shadow-md overflow-hidden bg-card">
              <div className="grid md:grid-cols-5 gap-0">

                {/* Text Content Area */}
                <div className="p-6 md:col-span-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px] px-2 py-0">
                        2026 Logistics Outlook
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold font-heading text-foreground mb-3">
                      The Mombasa-Rotterdam Trade Route
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-4">
                      East African avocado processors are increasingly adopting 24,000-liter multi-layer **Flexitanks** for bulk shipping. This setup reduces container handling overheads by up to **18%** compared to traditional steel drum arrays on long voyages around the Cape of Good Hope.
                    </p>
                  </div>

                  <div className="flex gap-4 text-[11px] text-muted-foreground border-t pt-3">
                    <span className="flex items-center gap-1"><Calendar size={12} /> July 2026</span>
                    <span className="flex items-center gap-1"><Globe size={12} /> East Africa Trade Corridor</span>
                  </div>
                </div>

                {/* Right Image Segment - Displaying the global linking network design */}
                {/* Right Image Segment - Displaying the global linking network design */}
<div className="relative min-h-[180px] md:min-h-full md:col-span-2 bg-slate-950">
  <img 
    src="https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcTtK_lO7Cl4ClI4k1Q6tGRhwVtD7BkOxCuE5F99b2NL5Sh2dKiFOMiRnIS9ThPW3mGM7lJ1IyPCPc7Ur1I" 
    alt="Digital world map illustration showing lines connecting international trade lanes and shipping nodes"
    className="absolute inset-0 w-full h-full object-cover"
  />
  {/* Soft gradient mask blending seamlessly into the dark slate tone */}
  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-card via-transparent to-transparent opacity-85 pointer-events-none" />
</div>

              </div>
            </Card>

            <h3 className="font-heading text-lg font-bold text-primary mt-8 mb-4">
              {searchTerm ? `Results for "${searchTerm}"` : "Latest Market Updates"}
            </h3>

            {/* News Feed Stream */}
            <div className="space-y-3">
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <Card key={item.id} className="group hover:border-secondary transition-all hover:shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start">
                      <div className="bg-primary/5 rounded p-2.5 min-w-[90px] text-center group-hover:bg-secondary/10 transition-colors shrink-0">
                        <span className="block text-xs text-muted-foreground">{item.date.split(",")[0]}</span>
                        <span className="block text-base font-bold text-primary">{item.date.split(",")[1]?.trim()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-primary border-primary/10 bg-primary/5 px-1.5 py-0">
                            {item.tag}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-base mb-1 group-hover:text-secondary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-muted-foreground text-xs leading-relaxed">{item.excerpt}</p>
                      </div>
                      <div className="ml-auto self-center hidden sm:block text-muted-foreground group-hover:text-secondary transform group-hover:translate-x-0.5 transition-all">
                        <ArrowUpRight size={16} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-xs italic py-2">No updates match your search.</p>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar Indices */}
          <div className="space-y-6">
            <Card className="bg-primary text-white border-none shadow-md sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-heading">
                  <TrendingUp size={18} className="text-secondary" /> B2B Commodity Index
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="border-b border-white/10 pb-3">
                  <div className="flex justify-between text-xs mb-0.5 opacity-70">
                    <span>Crude Avocado Oil (FOB Mombasa)</span>
                    <span className="text-secondary font-bold">Stable</span>
                  </div>
                  <div className="text-xl font-bold">€3.50 - €5.00 <span className="text-xs font-normal opacity-50">/ L</span></div>
                </div>

                <div className="border-b border-white/10 pb-3">
                  <div className="flex justify-between text-xs mb-0.5 opacity-70">
                    <span>Extra Virgin Cold-Pressed (CIF Rotterdam)</span>
                    <span className="text-emerald-400 font-bold">▲ +2.1%</span>
                  </div>
                  <div className="text-xl font-bold">€8.50 - €11.50 <span className="text-xs font-normal opacity-50">/ kg</span></div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-0.5 opacity-70">
                    <span>Macadamia Kernels Style 1 (FOB Mombasa)</span>
                    <span className="text-secondary font-bold">Firm</span>
                  </div>
                  <div className="text-xl font-bold">$14.00 - $18.00 <span className="text-xs font-normal opacity-50">/ kg</span></div>
                </div>

                <p className="text-[9px] opacity-40 text-center italic border-t border-white/10 pt-3">
                  Data reflects verified commercial bulk spot values.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}