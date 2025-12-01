import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MousePointerClick, FileText, TrendingUp, Bell } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Mon", visitors: 40, enquiries: 2 },
  { name: "Tue", visitors: 30, enquiries: 1 },
  { name: "Wed", visitors: 55, enquiries: 4 },
  { name: "Thu", visitors: 45, enquiries: 3 },
  { name: "Fri", visitors: 70, enquiries: 6 },
  { name: "Sat", visitors: 25, enquiries: 1 },
  { name: "Sun", visitors: 20, enquiries: 0 },
];

const recentEnquiries = [
  { name: "Hans Mueller", company: "BioOrganic DE", product: "Crude Oil", status: "New", time: "2 hours ago" },
  { name: "Sarah Johnson", company: "Pure Cosmetics UK", product: "Refined Oil", status: "In Review", time: "5 hours ago" },
  { name: "Jean Pierre", company: "La Belle Vie", product: "Extra Virgin", status: "Replied", time: "1 day ago" },
];

export default function Admin() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary">Partner Portal</h1>
            <p className="text-muted-foreground">CRM & Analytics Dashboard</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-white border border-border text-muted-foreground hover:text-primary relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              AD
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Visitors (Week)</span>
                <Users className="text-primary h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">285</div>
              <p className="text-xs text-muted-foreground mt-1"><span className="text-green-600">↑ 12%</span> from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Product Views</span>
                <MousePointerClick className="text-secondary h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">1,420</div>
              <p className="text-xs text-muted-foreground mt-1"><span className="text-green-600">↑ 5%</span> from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">New Enquiries</span>
                <FileText className="text-blue-500 h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">17</div>
              <p className="text-xs text-muted-foreground mt-1">3 unread today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
                <TrendingUp className="text-green-500 h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">5.9%</div>
              <p className="text-xs text-muted-foreground mt-1"><span className="text-green-600">↑ 0.4%</span> average</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Visitor Traffic</CardTitle>
              <CardDescription>Weekly engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(145 63% 28%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(145 63% 28%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(140 20% 90%)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(140 10% 40%)'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="hsl(145 63% 28%)" 
                      fillOpacity={1} 
                      fill="url(#colorVisits)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Enquiries</CardTitle>
              <CardDescription>Latest B2B requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentEnquiries.map((enq, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {enq.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm truncate">{enq.company}</h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{enq.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{enq.name} • {enq.product}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        enq.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        enq.status === 'In Review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {enq.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
