import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MousePointerClick, FileText, TrendingUp, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Enquiry } from "@shared/schema";

export default function Admin() {
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalEnquiries: 0,
    visitsByDay: [] as { date: string; count: number }[],
  });

  const { data: enquiriesData } = useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const res = await fetch('/api/enquiries?limit=10');
      if (!res.ok) throw new Error('Failed to fetch enquiries');
      return res.json() as Promise<{ enquiries: Enquiry[] }>;
    },
  });

  useEffect(() => {
    fetch('/api/analytics/stats?days=7')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const recentEnquiries = enquiriesData?.enquiries || [];
  const unreadCount = recentEnquiries.filter(e => e.status === 'new').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary">Partner Portal</h1>
            <p className="text-muted-foreground">CRM & Analytics Dashboard</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-white border border-border text-muted-foreground hover:text-primary relative" data-testid="button-notifications">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-xs flex items-center justify-center" data-testid="text-notification-count">
                  {unreadCount}
                </span>
              )}
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
              <div className="text-2xl font-bold" data-testid="text-total-visits">{stats.totalVisits}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Product Views</span>
                <MousePointerClick className="text-secondary h-4 w-4" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-product-views">{Math.floor(stats.totalVisits * 0.6)}</div>
              <p className="text-xs text-muted-foreground mt-1">Engagement rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">New Enquiries</span>
                <FileText className="text-blue-500 h-4 w-4" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-total-enquiries">{stats.totalEnquiries}</div>
              <p className="text-xs text-muted-foreground mt-1">{unreadCount} unread today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
                <TrendingUp className="text-green-500 h-4 w-4" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-conversion-rate">
                {stats.totalVisits > 0 ? ((stats.totalEnquiries / stats.totalVisits) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Enquiries / Visits</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Enquiries</CardTitle>
              <CardDescription>Latest B2B requests from potential buyers</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEnquiries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-20" />
                  <p>No enquiries yet. They'll appear here when buyers submit requests.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentEnquiries.map((enq) => (
                    <div key={enq.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors border border-border" data-testid={`card-enquiry-${enq.id}`}>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {enq.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm" data-testid={`text-company-${enq.id}`}>{enq.company}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              enq.type === 'seller' 
                                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {enq.type?.toUpperCase() || 'BUYER'}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(enq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2" data-testid={`text-contact-${enq.id}`}>
                          {enq.name} • {enq.email}
                        </p>
                        <p className="text-sm mb-2">
                          {enq.type === 'seller' ? (
                            <span className="font-semibold text-amber-700">Processor Enquiry</span>
                          ) : (
                            <><span className="font-semibold">{enq.product}</span> • {enq.quantity}</>
                          )}
                        </p>
                        {enq.message && (
                          <p className="text-xs text-muted-foreground italic mb-2">"{enq.message}"</p>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          enq.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          enq.status === 'in-review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`} data-testid={`badge-status-${enq.id}`}>
                          {enq.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
