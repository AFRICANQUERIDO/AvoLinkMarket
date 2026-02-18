import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Calendar, Globe, Search } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import logisticsImage from "@assets/generated_images/global_trade_logistics_map.png";

export default function Market() {
  const [tempSearch, setTempSearch] = useState("");
  const { handleSearch } = useSearch();

  const news = [
    {
      date: "Feb 16, 2026",
      tag: "Supply Chain",
      title: "Red Sea Disruptions Shift Export Rankings",
      excerpt: "Morocco has temporarily surpassed Kenya in EU avocado exports as shipping delays around the Cape of Good Hope impact East African transit times."
    },
    {
      date: "Jan 23, 2026",
      tag: "Market Growth",
      title: "Global Avocado Oil Market Hits $747M",
      excerpt: "New 2026 forecasts show a 5.9% CAGR driven by European 'Clean Label' trends and rising demand for Refined oil in industrial food service."
    },
    {
      date: "Jan 10, 2026",
      tag: "Regulation",
      title: "AFA Updates 2026 Export Maturity Standards",
      excerpt: "The Agriculture and Food Authority has released new inspection guidelines for the March season to ensure high oil-content levels for Hass varieties."
    }
  ];

  // Filter news based on the search input
  const filteredNews = useMemo(() => {
    return news.filter((item) =>
      item.title.toLowerCase().includes(tempSearch.toLowerCase()) ||
      item.tag.toLowerCase().includes(tempSearch.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(tempSearch.toLowerCase())
    );
  }, [tempSearch, news]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSearch.trim()) handleSearch(tempSearch);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Integrated Search */}
      <div className="bg-primary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="font-heading text-4xl md:text-6xl font-bold">Market Intelligence</h1>
              <p className="text-xl text-white/80 max-w-xl">
                Real-time 2026 insights into the East African avocado oil corridor and global pricing trends.
              </p>
            </div>
            
            <form onSubmit={onSearchSubmit} className="relative w-full md:w-96 group">
              <input 
                type="text"
                placeholder="Search products or news..."
                className="w-full h-12 pl-5 pr-12 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/50 outline-none focus:bg-white focus:text-primary transition-all"
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2.5 text-white/50 group-focus-within:text-primary">
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Main Visual Area */}
            <Card className="border-none shadow-xl overflow-hidden">
              <div className="h-80 relative">
                <img src={logisticsImage} className="w-full h-full object-cover" alt="Market Trends" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-8">
                  <div>
                    <Badge className="bg-secondary text-secondary-foreground mb-2">2026 Logistics Outlook</Badge>
                    <h2 className="text-3xl font-bold text-white font-heading">The Mombasa-Rotterdam Corridor</h2>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex gap-8 mb-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar size={16} /> Feb 18, 2026</span>
                  <span className="flex items-center gap-1"><Globe size={16} /> Port of Mombasa</span>
                </div>
                <p className="text-lg leading-relaxed text-foreground/80 mb-6">
                  As of February 2026, processors are utilizing <strong>Flexitanks</strong> for bulk crude oil shipments to maximize volume during the extended transit around the Cape.
                </p>
              </CardContent>
            </Card>

            <h3 className="font-heading text-2xl font-bold text-primary mt-12 mb-6">
              {tempSearch ? `Results for "${tempSearch}"` : "Recent Updates"}
            </h3>
            
            <div className="space-y-4">
              {filteredNews.length > 0 ? (
                filteredNews.map((item, i) => (
                  <Card key={i} className="group hover:border-secondary transition-all cursor-pointer hover:shadow-md">
                    <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                      <div className="bg-primary/5 rounded-lg p-4 min-w-[110px] text-center group-hover:bg-secondary/10 transition-colors">
                        <span className="block text-sm text-muted-foreground mb-1">{item.date.split(',')[0]}</span>
                        <span className="block text-xl font-bold text-primary">{item.date.split(',')[1].trim()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-primary border-primary/20">{item.tag}</Badge>
                        </div>
                        <h4 className="font-bold text-lg mb-2 group-hover:text-secondary transition-colors">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.excerpt}</p>
                      </div>
                      <div className="ml-auto self-center hidden sm:block text-muted-foreground group-hover:text-secondary transform group-hover:translate-x-1 transition-all">
                        <ArrowUpRight />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground italic">No updates found matching your search.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 mt-10 lg:mt-0">
            <Card className="bg-primary text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-secondary" /> 2026 Price Index
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1 opacity-80">
                    <span>Crude (FOB Mombasa)</span>
                    <span className="text-secondary font-bold">Stable</span>
                  </div>
                  <div className="text-2xl font-bold">€3.85 <span className="text-sm font-normal opacity-60">/ kg</span></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 opacity-80">
                    <span>Extra Virgin (CIF Rotterdam)</span>
                    <span className="text-red-400 font-bold">+2.1%</span>
                  </div>
                  <div className="text-2xl font-bold">€9.45 <span className="text-sm font-normal opacity-60">/ kg</span></div>
                </div>
                <p className="text-[10px] opacity-50 text-center italic">Updated: Feb 18, 2026</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}