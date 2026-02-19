import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, CheckCircle, ArrowLeft, SearchX, PackageOpen } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { useQuery } from "@tanstack/react-query";

// --- Form Schemas ---
const buyerSchema = z.object({
  type: z.literal("buyer"),
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  product: z.string().min(1, "Please select a product"),
  quantity: z.string().min(1, "Estimated quantity is required"),
  message: z.string().optional(),
});

const sellerSchema = z.object({
  type: z.literal("seller"),
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Please provide details about your production capacity"),
});

const formSchema = z.discriminatedUnion("type", [buyerSchema, sellerSchema]);

export default function Products() {
  const { query } = useSearch(); 
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [, setLocation] = useLocation();

  // 1. Fetching data from MSSQL via our API
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });
  
  const queryParams = new URLSearchParams(window.location.search);
  const categoryFilter = queryParams.get("category");

  // 2. Optimized Filtering Logic
  const filteredProducts = products.filter((p) => {
    const searchLower = query.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) ||
      p.desc.toLowerCase().includes(searchLower) ||
      (p.specs && p.specs.some((spec: string) => spec.toLowerCase().includes(searchLower)));
    
    return matchesSearch;
  });

  const avocadoProducts = filteredProducts.filter(p => p.category === 'avocado');
  const macadamiaProducts = filteredProducts.filter(p => p.category === 'macadamia');

  useEffect(() => {
    if (categoryFilter) {
      const element = document.getElementById(`${categoryFilter}-section`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [categoryFilter]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "buyer",
      name: "",
      company: "",
      email: "",
      product: "",
      quantity: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to submit');
      toast({ title: "Enquiry Sent Successfully! ✅" });
      form.reset({ type: activeTab, name: "", company: "", email: "", product: "", quantity: "", message: "" });
    } catch (error) {
      toast({ title: "Submission Failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background py-16 min-h-screen">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-4">
            {categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Catalogue` : "Our Product Catalogue"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sourced directly from verified processors. All products undergo rigorous quality testing.
          </p>
          {(categoryFilter || query) && (
            <Button 
              variant="ghost" 
              className="mt-4 text-primary" 
              onClick={() => setLocation("/products")}
            >
              <ArrowLeft size={16} className="mr-2" /> Reset View
            </Button>
          )}
        </div>

        {/* --- Loading State --- */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary/30 mb-4" />
            <p className="text-muted-foreground animate-pulse">Loading latest market products...</p>
          </div>
        )}

        {/* --- No Results State --- */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl mb-10 bg-muted/10">
            <SearchX size={48} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No products found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              We couldn't find anything matching "{query}". Try a different term like "Oil" or "Hass".
            </p>
          </div>
        )}

        {/* Avocado Section */}
        {(!categoryFilter || categoryFilter === 'avocado') && avocadoProducts.length > 0 && (
          <div id="avocado-section" className="mb-20 scroll-mt-24 transition-opacity">
            <h2 className="font-heading text-3xl font-bold text-primary mb-8 border-l-4 border-secondary pl-4">Avocado Products</h2>
            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {avocadoProducts.map((product) => (
                <ProductCard key={product.id} product={product} form={form} />
              ))}
            </div>
          </div>
        )}

        {/* Macadamia Section */}
        {(!categoryFilter || categoryFilter === 'macadamia') && macadamiaProducts.length > 0 && (
          <div id="macadamia-section" className="mb-20 scroll-mt-24 transition-opacity">
            <h2 className="font-heading text-3xl font-bold text-primary mb-8 border-l-4 border-amber-500 pl-4">Macadamia Products</h2>
            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {macadamiaProducts.map((product) => (
                <ProductCard key={product.id} product={product} form={form} />
              ))}
            </div>
          </div>
        )}

        {/* Enquiry Form */}
        <div id="enquiry-form" className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-border mt-20 scroll-mt-24">
          <div className="grid md:grid-cols-2">
            <div className="bg-primary p-10 text-white flex flex-col justify-center">
              <h3 className="font-heading text-3xl font-bold mb-4">Get a Custom Quote</h3>
              <p className="text-white/80 mb-8">Tell us your requirements and we'll connect you with the best processor.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">✓ Response within 24 hours</li>
                <li className="flex items-center gap-3">✓ Competitive market rates</li>
              </ul>
            </div>

            <div className="p-10">
              <Tabs value={activeTab} onValueChange={(v) => {
                const type = v as "buyer" | "seller";
                setActiveTab(type);
                form.setValue("type", type);
              }} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buyer">I am a Buyer</TabsTrigger>
                  <TabsTrigger value="seller">I am a Seller</TabsTrigger>
                </TabsList>
              </Tabs>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john@company.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Company Ltd" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  {activeTab === "buyer" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="product" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Interest</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger></FormControl>
                            <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="quantity" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Est. Quantity</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select quantity" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Sample (< 5kg)">Sample (&lt; 5kg)</SelectItem>
                              <SelectItem value="Small (100kg - 1 Ton)">Small (100kg - 1 Ton)</SelectItem>
                              <SelectItem value="Large (10 Tons+)">Large (10 Tons+)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  )}
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{activeTab === "buyer" ? "Additional Details" : "Production Capacity"}</FormLabel>
                      <FormControl><Textarea className="resize-none h-24" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full bg-primary h-12" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Enquiry"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---
function ProductCard({ product, form }: { product: any, form: any }) {
  const isMacadamia = product.category === 'macadamia';
  const isFresh = product.name.toLowerCase().includes('fresh');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col group h-full">
      <div className="bg-muted/30 p-8 flex items-center justify-center h-48 relative overflow-hidden">
        {product.badge && (
          <span className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase z-10">
            {product.badge}
          </span>
        )}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner transition-transform group-hover:scale-110 
          ${isMacadamia ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
          {isFresh ? '🥑' : '🫗'}
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="font-heading text-xl font-bold text-primary mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-lg font-bold text-secondary mb-4">{product.price}</p>
        <p className="text-muted-foreground text-sm mb-6 flex-grow line-clamp-3">{product.desc}</p>
        
        <div className="space-y-2 mb-6">
          {product.specs?.map((spec: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <CheckCircle size={14} className="text-primary shrink-0" /> <span className="truncate">{spec}</span>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary hover:text-white"
          onClick={() => {
            form.setValue('product', product.name);
            document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Request Quote
        </Button>
      </div>
    </div>
  );
}