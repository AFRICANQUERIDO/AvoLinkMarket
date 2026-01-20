import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Calendar, Globe } from "lucide-react";
import logisticsImage from "@assets/generated_images/global_trade_logistics_map.png";

export default function Market() {
  const news = [
    {
      date: "Nov 28, 2024",
      tag: "Market Alert",
      title: "European Demand for Crude Avocado Oil Spikes",
      excerpt: "Cosmetic manufacturers in France and Germany are increasing procurement orders ahead of Q1 2025. Prices expected to rise by 5-8%."
    },
    {
      date: "Nov 24, 2024",
      tag: "Harvest Update",
      title: "Kenyan Hass Season Outlook Positive",
      excerpt: "Early indicators show a bumper harvest for the upcoming Hass season in the Mt. Kenya region, promising stable supply for processors."
    },
    {
      date: "Nov 15, 2024",
      tag: "Regulation",
      title: "New EU Sustainability Directives for Imported Oils",
      excerpt: "Importers must now provide enhanced traceability data. AvoTrade processors are already compliant with the new digital tracking requirements."
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">Market News</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Weekly updates on East Africa market trends, pricing fluctuations, and supply chain insights for the avocado oil industry.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Chart/Visual Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl overflow-hidden">
              <div className="h-80 relative">
                <img src={logisticsImage} className="w-full h-full object-cover" alt="Market Trends" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                  <div>
                    <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary mb-2">Weekly Highlight</Badge>
                    <h2 className="text-3xl font-bold text-white font-heading">Global Supply Chain Resilience Report Q4</h2>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex gap-8 mb-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar size={16} /> Dec 1, 2024</span>
                  <span className="flex items-center gap-1"><Globe size={16} /> Rotterdam / Mombasa</span>
                </div>
                <p className="text-lg leading-relaxed text-foreground/80 mb-6">
                  Despite global shipping challenges, the avocado oil corridor between East Africa and Europe remains robust. 
                  Container availability has improved in Mombasa, reducing lead times by an average of 4 days compared to last month.
                  Buyers looking for spot contracts should act now as freight rates are predicted to adjust upwards in January.
                </p>
                <h3 className="font-bold text-xl mb-3 text-primary">Key Takeaways:</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Freight rates stable for December bookings.</li>
                  <li>Bulk flexitank availability is high.</li>
                  <li>Refined oil demand outpacing crude in Southern Europe.</li>
                </ul>
              </CardContent>
            </Card>

            <h3 className="font-heading text-2xl font-bold text-primary mt-12 mb-6">Recent Updates</h3>
            <div className="space-y-4">
              {news.map((item, i) => (
                <Card key={i} className="hover:border-secondary transition-colors cursor-pointer">
                  <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                    <div className="bg-primary/5 rounded-lg p-4 min-w-[100px] text-center">
                      <span className="block text-sm text-muted-foreground mb-1">{item.date.split(' ')[0]}</span>
                      <span className="block text-2xl font-bold text-primary">{item.date.split(' ')[1].replace(',', '')}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs text-primary border-primary/20">{item.tag}</Badge>
                      </div>
                      <h4 className="font-bold text-lg mb-2 group-hover:text-secondary transition-colors">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.excerpt}</p>
                    </div>
                    <div className="ml-auto self-center hidden sm:block text-muted-foreground">
                      <ArrowUpRight />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8 mt-10 lg:mt-0">
            <Card className="bg-primary text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-secondary" /> Price Watch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1 opacity-80">
                    <span>Crude Oil (FOB Mombasa)</span>
                    <span className="text-secondary font-bold">+1.2%</span>
                  </div>
                  <div className="text-2xl font-bold">€3.85 <span className="text-sm font-normal opacity-60">/ kg</span></div>
                  <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[70%]"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1 opacity-80">
                    <span>Extra Virgin (CIF Rotterdam)</span>
                    <span className="text-secondary font-bold">+0.5%</span>
                  </div>
                  <div className="text-2xl font-bold">€9.20 <span className="text-sm font-normal opacity-60">/ kg</span></div>
                  <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[85%]"></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs opacity-60 text-center">Updated: 2 hours ago. Indicative prices only.</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-secondary/10 rounded-2xl p-6 border border-secondary/20">
              <h4 className="font-bold text-primary mb-4">Subscribe to Full Reports</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get detailed weekly PDF reports including analysis of competitor origins (Mexico, Peru) and deep-dive pricing structures.
              </p>
              <button className="w-full bg-primary text-white py-2 rounded font-bold text-sm hover:bg-primary/90">
                Subscribe - Free
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
