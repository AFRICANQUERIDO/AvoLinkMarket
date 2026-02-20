import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MousePointerClick,
  TrendingUp,
  LogOut,
  MoreVertical,
  Trash2,
  Plus,
  Loader2,
  ShoppingCart,
  Tractor,
  List,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Enquiry, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1543257580-7269da771bf1?q=80&w=800&auto=format&fit=crop";
// This is a high-quality, neutral fruit/produce photo

const productSchema = z.object({
  name: z.string().min(3),
  price: z.string().min(1),
  image: z.string().min(1, "Please upload an image"), // Changed from .url()
  desc: z.string().min(10),
  specs: z.string().min(1),
  badge: z.string().optional(),
  category: z.enum(["avocado", "macadamia"]),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [stats, setStats] = useState({ totalVisits: 0, totalEnquiries: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: enquiriesData = [] } = useQuery<Enquiry[]>({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const res = await fetch("/api/enquiries");
      return res.json();
    },
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/api/enquiries/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      toast({ title: "Status updated" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product removed" });
    },
  });

  const deleteEnquiryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/enquiries/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enquiries"] }),
  });

  const addProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const formattedData = {
        ...values,
        slug: values.name
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, ""),
        specs: values.specs.split(",").map((s) => s.trim()),
      };
      return await apiRequest("POST", "/api/products", formattedData);
    },
    onSuccess: () => {
      toast({
        title: "✅ Product Published",
        description: "Market catalogue updated.",
      });
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ProductFormValues>;
    }) => {
      // We format the specs back into an array if it's a string from the input
      const formattedData = {
        ...data,
        specs:
          typeof data.specs === "string"
            ? data.specs.split(",").map((s) => s.trim())
            : data.specs,
      };
      return await apiRequest("PATCH", `/api/products/${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Updated",
        description: "Changes saved to catalogue.",
      });
    },
  });

  const filteredEnquiries = enquiriesData.filter((enq) => {
    const matchesStatus =
      filter === "all" ? enq.status !== "archived" : enq.status === filter;
    const matchesType = typeFilter === "all" ? true : enq.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const buyerCount = enquiriesData.filter((e) => e.type === "buyer").length;
  const sellerCount = enquiriesData.filter((e) => e.type === "seller").length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="container mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              Admin Portal
            </h1>
            <p className="text-muted-foreground text-sm">
              Marketplace Control Center
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>

        {/* ANALYTICS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Visitors"
            value={stats.totalVisits}
            icon={<MousePointerClick className="text-primary" />}
            color="primary"
          />
          <StatCard
            title="Buyer Requests"
            value={buyerCount}
            icon={<ShoppingCart className="text-emerald-500" />}
            color="emerald"
          />
          <StatCard
            title="Seller Requests"
            value={sellerCount}
            icon={<Tractor className="text-indigo-500" />}
            color="indigo"
          />
          <StatCard
            title="Conversion"
            value="4.2%"
            icon={<TrendingUp className="text-orange-500" />}
            color="orange"
          />
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="bg-white border shadow-sm p-1 rounded-lg">
            <TabsTrigger value="leads" className="px-8">
              Leads
            </TabsTrigger>
            <TabsTrigger value="products" className="px-8">
              Catalogue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <div className="flex gap-4 mb-6">
              <div className="flex bg-slate-100 p-1 rounded-md gap-1">
                {["all", "new", "pending", "completed"].map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="h-7 text-[11px] capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
              <div className="flex bg-slate-100 p-1 rounded-md gap-1">
                {["all", "buyer", "seller"].map((t) => (
                  <Button
                    key={t}
                    variant={typeFilter === t ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setTypeFilter(t)}
                    className="h-7 text-[11px] capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <Card className="shadow-sm border-none bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-0 divide-y">
                {filteredEnquiries.map((enq) => {
                  const isBuyer = enq.type === "buyer";
                  return (
                    <div
                      key={enq.id}
                      className="flex items-start gap-4 p-6 hover:bg-slate-50 transition-all border-l-4 border-l-transparent hover:border-l-primary"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border ${isBuyer ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}
                      >
                        {isBuyer ? (
                          <ShoppingCart size={18} />
                        ) : (
                          <Tractor size={18} />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900">
                                {enq.company}
                              </h4>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${isBuyer ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white"}`}
                              >
                                {enq.type}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">
                              {enq.name} • {enq.email}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: enq.id,
                                    status: "pending",
                                  })
                                }
                              >
                                Mark Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: enq.id,
                                    status: "completed",
                                  })
                                }
                              >
                                Complete Deal
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  confirm("Delete?") &&
                                  deleteEnquiryMutation.mutate(enq.id)
                                }
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div
                          className={`mt-3 p-3 rounded-lg border italic text-sm text-slate-600 ${isBuyer ? "bg-white" : "bg-slate-50"}`}
                        >
                          "{enq.message}"
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Storefront Catalogue</h2>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="gap-2"
              >
                {showAddForm ? <List size={16} /> : <Plus size={16} />}
                {showAddForm ? "View Catalogue" : "Add New Item"}
              </Button>
            </div>

            {showAddForm ? (
              <Card className="max-w-2xl mx-auto p-8 shadow-xl border-none rounded-3xl bg-white">
                <ProductAddForm
                  onSubmit={(v) => addProductMutation.mutate(v)}
                  isPending={addProductMutation.isPending}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.map((p) => (
                  <Card
                    key={p.id}
                    className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl"
                  >
                    {/* DELETE BUTTON - Top Right Corner */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete "${p.name}"?`,
                          )
                        ) {
                          deleteProductMutation.mutate(p.id);
                        }
                      }}
                      disabled={deleteProductMutation.isPending}
                    >
                      {deleteProductMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      {p.image ? (
                        <img
                          src={p.image || FALLBACK_IMAGE}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <p className="text-[10px] font-black uppercase tracking-tighter text-primary mb-1">
                        {p.category}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900">
                        {p.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {p.desc}
                      </p>
                      <div className="mt-6 pt-4 border-t flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            Price Range
                          </span>
                          <span className="text-lg font-black text-primary">
                            {p.price}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: any;
  icon: any;
  color: string;
}) {
  const colors: Record<string, string> = {
    primary: "border-l-primary",
    emerald: "border-l-emerald-500",
    indigo: "border-l-indigo-500",
    orange: "border-l-orange-500",
  };
  return (
    <Card className={`border-l-4 ${colors[color]} shadow-sm`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </span>
          {icon}
        </div>
        <div className="text-2xl font-black">{value}</div>
      </CardContent>
    </Card>
  );
}

function ProductAddForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (v: ProductFormValues) => void;
  isPending: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      image: "",
      desc: "",
      specs: "",
      category: "avocado",
    },
  });

  // --- DEBUGGING LOG ---
  const errors = form.formState.errors;
  if (Object.keys(errors).length > 0) {
    console.log("Validation Failed:", errors);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please upload an image under 2MB.");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;

        console.log(
          "Image successfully converted to Base64. Length:",
          base64.length,
        );

        // Update the UI preview
        setPreview(base64);

        // Update the actual form data for the database
        form.setValue("image", base64, {
          shouldValidate: true,
          shouldDirty: true,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* IMAGE UPLOAD */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="font-bold text-slate-900">
                Product Photo
              </FormLabel>
              <FormControl>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all overflow-hidden bg-slate-50 relative"
                >
                  {preview || form.getValues("image") ? (
                    <img
                      src={preview || form.getValues("image") || FALLBACK_IMAGE}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Plus className="text-slate-400 mb-2" size={32} />
                      <p className="text-xs text-slate-500 font-medium">
                        Click to upload from device
                      </p>
                    </>
                  )}
                </div>
              </FormControl>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* NAME */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Extra Virgin Avocado Oil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* PRICE */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Price Range</FormLabel>
                <FormControl>
                  <Input placeholder="Ksh 850 - 1,200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* CATEGORY */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="avocado">Avocado Products</SelectItem>
                    <SelectItem value="macadamia">
                      Macadamia Products
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* THE MISSING SPECS FIELD */}
        <FormField
          control={form.control}
          name="specs"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">
                Technical Specifications
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Cold Pressed, 100% Organic, 500ml"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-[10px]">
                Separate with commas (e.g. Organic, Export Grade)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DESCRIPTION */}
        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Description</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Briefly describe the product qualities..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12 text-lg shadow-lg"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            "Publish to Marketplace"
          )}
        </Button>
      </form>
    </Form>
  );
}
