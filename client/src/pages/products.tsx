import { useState } from "react";
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
import { Loader2, CheckCircle } from "lucide-react";

const products = [
  {
    id: "crude",
    name: "Crude Avocado Oil",
    price: "Ksh .3.80 - Ksh 4.20 / kg",
    desc: "Unrefined, cold-pressed oil retaining all natural nutrients and characteristic emerald green color.",
    specs: ["FFA: < 1.0%", "Peroxide: < 10 meq/kg", "Origin: Kenya/Tanzania"],
    badge: "Best Seller"
  },
  {
    id: "virgin",
    name: "Extra Virgin Avocado Oil",
    price: "Ksh 8.50 - Ksh 9.50 / kg",
    desc: "Premium food-grade oil produced from high-quality Hass avocados. Perfect for culinary applications.",
    specs: ["FFA: < 0.5%", "Cold Pressed", "Emerald Green"],
    badge: "Premium"
  },
  {
    id: "refined",
    name: "Refined Avocado Oil",
    price: "Ksh 4.90 - Ksh 5.50 / kg",
    desc: "Bleached and deodorized oil suitable for cosmetics and high-heat cooking. Neutral color and scent.",
    specs: ["FFA: < 0.1%", "Odorless", "Pale Yellow"],
    badge: "Versatile"
  },
  {
    id: "macadamia_crude",
    name: "Crude Macadamia Oil",
    price: "Inquire for Pricing",
    desc: "Cold-pressed macadamia oil, rich in palmitoleic acid. Excellent for premium cosmetic formulations.",
    specs: ["Cold Pressed", "High Palmitoleic Acid", "Origin: Kenya/South Africa"],
    badge: "New"
  },
  {
    id: "macadamia_refined",
    name: "Refined Macadamia Oil",
    price: "Inquire for Pricing",
    desc: "Refined macadamia oil with high smoke point and neutral profile. Ideal for culinary and beauty products.",
    specs: ["Neutral Scent", "High Stability", "Food & Cosmetic Grade"],
    badge: "Premium"
  },
  {
    id: "fresh",
    name: "Fresh Avocado Exports",
    price: "Market Price (Inquire for Daily Rates)",
    desc: "Premium quality fresh avocados (Hass & Fuerte) sourced from verified growers across East Africa. Global GAP certified.",
    specs: ["Origin: Kenya, Tanzania, Uganda", "Size: 12 - 24 count", "Global GAP Certified"],
    badge: "Fresh"
  }
];

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
  message: z.string().min(10, "Please provide some details about your production capacity"),
});

const formSchema = z.discriminatedUnion("type", [buyerSchema, sellerSchema]);

export default function Products() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");

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
      
      if (!response.ok) throw new Error('Failed to submit enquiry');
      
      toast({
        title: "Enquiry Sent Successfully! ✅",
        description: "We've received your request and our team has been notified. You'll hear back within 24 hours.",
      });
      form.reset({
        type: activeTab,
        name: "",
        company: "",
        email: "",
        product: "",
        quantity: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background py-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-4">Our Product Catalogue</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sourced directly from verified processors. All products undergo rigorous quality testing before shipment.
          </p>
        </div>

        <div id="avocado-section" className="mb-20">
          <h2 className="font-heading text-3xl font-bold text-primary mb-8 border-l-4 border-secondary pl-4">Avocado Products</h2>
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {products.filter(p => !p.id.startsWith('macadamia')).map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="bg-muted/30 p-8 flex items-center justify-center h-48 relative">
                  {product.badge && (
                    <span className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {product.badge}
                    </span>
                  )}
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-heading font-bold shadow-inner ${
                    product.id === 'crude' ? 'bg-green-800 text-green-900' : 
                    product.id === 'virgin' ? 'bg-green-600 text-green-800' : 
                    product.id === 'fresh' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                     {product.id === 'fresh' ? '🥑' : 'Oil'}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-heading text-2xl font-bold text-primary mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-secondary mb-4">{product.price}</p>
                  <p className="text-muted-foreground text-sm mb-6 flex-grow">{product.desc}</p>
                  
                  <div className="space-y-2 mb-6">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-foreground/70 font-medium">
                        <CheckCircle size={14} className="text-primary" /> {spec}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => {
                      form.setValue('product', product.name);
                      document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    data-testid={`button-request-quote-${product.id}`}
                  >
                    Request Quote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="macadamia-section" className="mb-20">
          <h2 className="font-heading text-3xl font-bold text-primary mb-8 border-l-4 border-amber-500 pl-4">Macadamia Products</h2>
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {products.filter(p => p.id.startsWith('macadamia')).map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="bg-muted/30 p-8 flex items-center justify-center h-48 relative">
                  {product.badge && (
                    <span className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {product.badge}
                    </span>
                  )}
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-heading font-bold shadow-inner bg-amber-100 text-amber-700">
                     Oil
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-heading text-2xl font-bold text-primary mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-secondary mb-4">{product.price}</p>
                  <p className="text-muted-foreground text-sm mb-6 flex-grow">{product.desc}</p>
                  
                  <div className="space-y-2 mb-6">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-foreground/70 font-medium">
                        <CheckCircle size={14} className="text-primary" /> {spec}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => {
                      form.setValue('product', product.name);
                      document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    data-testid={`button-request-quote-${product.id}`}
                  >
                    Request Quote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enquiry Form Section */}
        <div id="enquiry-form" className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-border">
          <div className="grid md:grid-cols-2">
            <div className="bg-primary p-10 text-white flex flex-col justify-center">
              <h3 className="font-heading text-3xl font-bold mb-4">Get a Custom Quote</h3>
              <p className="text-white/80 mb-8">
                Tell us your requirements and we'll connect you with the best processor for your needs. We handle the logistics, quality checks, and paperwork.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">✓</div>
                  <span>Response within 24 hours</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">✓</div>
                  <span>Competitive market rates</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">✓</div>
                  <span>Sample shipping available</span>
                </li>
              </ul>
            </div>

            <div className="p-10">
              <Tabs 
                defaultValue="buyer" 
                value={activeTab} 
                onValueChange={(v) => {
                  const type = v as "buyer" | "seller";
                  setActiveTab(type);
                  form.setValue("type", type);
                }}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buyer">I am a Buyer</TabsTrigger>
                  <TabsTrigger value="seller">I am a Seller</TabsTrigger>
                </TabsList>
              </Tabs>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@company.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Ltd" {...field} data-testid="input-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {activeTab === "buyer" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="product"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Interest</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-product">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Crude Avocado Oil">Crude Avocado Oil</SelectItem>
                                <SelectItem value="Extra Virgin Avocado Oil">Extra Virgin Avocado Oil</SelectItem>
                                <SelectItem value="Refined Avocado Oil">Refined Avocado Oil</SelectItem>
                                <SelectItem value="Crude Macadamia Oil">Crude Macadamia Oil</SelectItem>
                                <SelectItem value="Refined Macadamia Oil">Refined Macadamia Oil</SelectItem>
                                <SelectItem value="Fresh Avocado Exports">Fresh Avocado Exports</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Est. Quantity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-quantity">
                                  <SelectValue placeholder="Select quantity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sample (< 5kg)">Sample (&lt; 5kg)</SelectItem>
                                <SelectItem value="Small (100kg - 1 Ton)">Small (100kg - 1 Ton)</SelectItem>
                                <SelectItem value="Medium (1 Ton - 10 Tons)">Medium (1 Ton - 10 Tons)</SelectItem>
                                <SelectItem value="Large (10 Tons+)">Large (10 Tons+)</SelectItem>
                                <SelectItem value="Container (20ft)">20ft Container (approx 20 Tons)</SelectItem>
                                <SelectItem value="Container (40ft)">40ft Container (approx 40 Tons)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{activeTab === "buyer" ? "Additional Details" : "Production Capacity & Origin"}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={activeTab === "buyer" ? "Specific requirements, destination port, packaging needs..." : "Tell us about your processing capacity, location, and certification status..."}
                            className="resize-none h-24" 
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-lg h-12" 
                    disabled={isSubmitting}
                    data-testid="button-submit-enquiry"
                  >
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Send Enquiry"}
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
