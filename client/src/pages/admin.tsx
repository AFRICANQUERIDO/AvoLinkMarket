import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, MousePointerClick, FileText, TrendingUp, Bell, LogOut, MoreVertical, CheckCircle2, Clock, Inbox, Archive, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Enquiry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Admin() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [stats, setStats] = useState({ totalVisits: 0, totalEnquiries: 0 });

  // 1. Fetch Enquiries
  const { data: enquiriesData } = useQuery({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const res = await fetch('/api/enquiries');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json() as Promise<Enquiry[]>; 
    },
  });

  // 2. Status Update Mutation (Cleaned up single declaration)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return await apiRequest("PATCH", `/api/enquiries/${id}`, { status });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      console.log(`Enquiry ${variables.id} updated to ${variables.status}`);
    },
    onError: () => {
      alert("Failed to update status. Please try again.");
    }
  });
const deleteMutation = useMutation({
  mutationFn: async (id: number) => {
    await apiRequest("DELETE", `/api/enquiries/${id}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['enquiries'] });
  },
  onError: () => {
    alert("Could not delete the enquiry.");
  }
});

// NEW: State to hold the search query
const [searchQuery, setSearchQuery] = useState("");

// NEW: Listener for the Layout's search bar
useEffect(() => {
  const syncSearch = () => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get("search") || "");
  };

  window.addEventListener("popstate", syncSearch);
  syncSearch(); // Run on initial load
  
  return () => window.removeEventListener("popstate", syncSearch);
}, []);

// Helper function for the confirmation
const confirmDelete = (id: number) => {
  if (window.confirm("Are you sure? This lead will be permanently removed.")) {
    deleteMutation.mutate(id);
  }
};
  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/";
  };

  useEffect(() => {
    fetch('/api/analytics/stats?days=7')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const allEnquiries = enquiriesData || [];
  
  // 3. Filtering Logic
const filteredEnquiries = allEnquiries.filter(enq => {
  // First, apply the status filter (All Active vs New vs Pending...)
  const matchesStatus = filter === "all" ? enq.status !== 'archived' : enq.status === filter;
  
  // Second, apply the search text filter
  const searchLower = searchQuery.toLowerCase();
  const matchesSearch = 
    (enq.company?.toLowerCase() || "").includes(searchLower) ||
    (enq.name?.toLowerCase() || "").includes(searchLower) ||
    (enq.email?.toLowerCase() || "").includes(searchLower) ||
    (enq.product?.toLowerCase() || "").includes(searchLower) ||
    (enq.message?.toLowerCase() || "").includes(searchLower);

  return matchesStatus && matchesSearch;
});
  const unreadCount = allEnquiries.filter(e => e.status === 'new').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-border shadow-sm">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary">Admin Portal</h1>
            <p className="text-muted-foreground text-sm">Lead Management & Analytics</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-background border border-border text-muted-foreground hover:text-primary relative transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 pr-4 border-r border-border">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-inner">AP</div>
              <span className="text-sm font-medium hidden md:block">Administrator</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-destructive flex gap-2">
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* --- ANALYTICS CARDS --- */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Visitors</span>
                <Users className="text-primary h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{stats.totalVisits || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-secondary shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Product Views</span>
                <MousePointerClick className="text-secondary h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{Math.floor((stats.totalVisits || 0) * 0.6)}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Enquiries</span>
                <FileText className="text-blue-500 h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{allEnquiries.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Conversion</span>
                <TrendingUp className="text-green-500 h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">
                {stats.totalVisits > 0 ? ((allEnquiries.length / stats.totalVisits) * 100).toFixed(1) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- FILTER BAR --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border shadow-sm">
            <Button variant={filter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('all')}>All Active</Button>
            <Button variant={filter === 'new' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('new')}>New</Button>
            <Button variant={filter === 'pending' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('pending')}>Pending</Button>
            <Button variant={filter === 'completed' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('completed')}>Completed</Button>
          </div>
          <p className="text-xs text-muted-foreground font-medium italic">
            Showing {filteredEnquiries.length} {filter === 'all' ? 'leads' : filter + ' items'}
          </p>
        </div>

        {/* --- ENQUIRIES LIST --- */}
        <Card className="shadow-sm border-border overflow-hidden">
          <CardContent className="p-0">
            {filteredEnquiries.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Inbox className="mx-auto h-12 w-12 mb-4 opacity-10" />
                <p>No leads found in this view.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredEnquiries.map((enq) => (
                  <div key={enq.id} className="flex items-start gap-4 p-6 hover:bg-slate-50 transition-all border-l-4 border-l-transparent hover:border-l-primary">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 border border-primary/20 shadow-sm text-sm">
                      {enq.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg leading-tight">{enq.company}</h4>
                          <p className="text-sm text-slate-500">{enq.name} • <span className="text-primary/70">{enq.email}</span></p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Quick Action Button for New leads */}
                          {enq.status === 'new' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hidden sm:flex h-8 gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => updateStatusMutation.mutate({id: enq.id, status: 'pending'})}
                            >
                              <Clock size={14} /> Pending
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({id: enq.id, status: 'new'})}>
    <Inbox className="mr-2 h-4 w-4" /> Reset to New
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({id: enq.id, status: 'pending'})}>
    <Clock className="mr-2 h-4 w-4 text-amber-500" /> Mark Pending
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({id: enq.id, status: 'completed'})}>
    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Complete Deal
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => updateStatusMutation.mutate({id: enq.id, status: 'archived'})}>
    <Archive className="mr-2 h-4 w-4 text-slate-500" /> Archive Lead
  </DropdownMenuItem>

  {/* Visual separator before the permanent action */}
  <DropdownMenuSeparator /> 

  <DropdownMenuItem 
    onClick={() => confirmDelete(enq.id)} 
    className="text-destructive focus:text-destructive focus:bg-destructive/10 font-medium"
  >
    <Trash2 className="mr-2 h-4 w-4" /> Permanently Delete
  </DropdownMenuItem>
</DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
                        <p className="text-sm font-semibold text-slate-800">
                          {enq.type === 'seller' ? '🥑 Processor Inquiry' : `📦 ${enq.product} (${enq.quantity})`}
                        </p>
                        {enq.message && (
                          <p className="text-sm text-slate-600 mt-2 italic pl-1">"{enq.message}"</p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                          enq.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          enq.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {enq.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(enq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}