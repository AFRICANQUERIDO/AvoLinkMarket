import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MousePointerClick,
  LogOut,
  Trash2,
  Plus,
  Loader2,
  ShoppingCart,
  Tractor,
  Package,
  CalendarDays,
  Edit,
  MoreVertical,
} from "lucide-react";
import type { Enquiry, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1543257580-7269da771bf1?q=80&w=800&auto=format&fit=crop";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price range is required"),
  image: z.string().min(1, "Product image is required"),
  desc: z.string().min(1, "Description is required"),
  specs: z.string().optional(),
  category: z.enum(["avocado", "macadamia"]),
});

type ProductFormValues = z.infer<typeof productSchema>;
type ProductApiPayload = Omit<ProductFormValues, "specs"> & {
  slug?: string;
  specs: string[];
};

export default function Admin() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const handleVisitTracked = (event: StorageEvent) => {
      if (event.key === "avolink:visit-tracked") {
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      }
    };

    window.addEventListener("storage", handleVisitTracked);
    return () => window.removeEventListener("storage", handleVisitTracked);
  }, [queryClient]);

  type DailyVisit = { date: string; count: number };
  type AnalyticsStats = {
    totalVisits: number;
    totalEnquiries: number;
    dailyVisits: DailyVisit[];
  };

  // --- QUERIES ---
  const { data: stats, isFetching: isStatsFetching } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics/stats"],
    queryFn: () => fetch("/api/analytics/stats").then((res) => res.json()),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: enquiriesData = [] } = useQuery<Enquiry[]>({
    queryKey: ["enquiries"],
    queryFn: async () => {
      const res = await fetch("/api/enquiries");
      if (!res.ok) throw new Error("Failed to load enquiries");
      return res.json();
    },
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
  });

  // --- MUTATIONS ---
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
    mutationFn: async ({ id }: { id: number }) => await apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteProductId(null);
      setIsDeleteDialogOpen(false);
      toast({ title: "Product Removed 🗑️" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete product",
        description: error?.message || "Please try again or refresh the page.",
        variant: "destructive",
      });
      console.error("Delete product error:", error);
    },
  });

const slugify = (value: string) => {
  if (!value || typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const normalizeProductValues = (values: ProductFormValues): ProductApiPayload => {
  const generatedSlug = slugify(values.name);
  return {
    ...values,
    // Only pass the slug if we actually generated one from a valid name
    slug: generatedSlug || undefined, 
    specs: values.specs ? values.specs.split(",").map((spec) => spec.trim()).filter(Boolean) : [],
  };
};
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductApiPayload) => await apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product published 🎉" });
      setShowAddForm(false);
    },
    onError: () => {
      toast({
        title: "Failed to publish product",
        description: "Check the product details and try again.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductApiPayload }) =>
      await apiRequest("PATCH", `/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully" });
      setShowAddForm(false);
    },
    onError: () => {
      toast({
        title: "Failed to update product",
        description: "Please verify the fields and try again.",
        variant: "destructive",
      });
    },
  });

  const handleProductSubmit = (values: ProductFormValues) => {
    const data = normalizeProductValues(values);

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
      return;
    }

    createProductMutation.mutate(data);
  };

  const filteredEnquiries = filter === "all" ? enquiriesData : enquiriesData.filter((e) => e.status === filter);
  const buyerCount = enquiriesData.filter((e) => e.type === "buyer").length;
  const sellerCount = enquiriesData.filter((e) => e.type === "seller").length;
  const totalProductCount = products.length;
  const avocadoProductCount = products.filter((product) => product.category === "avocado").length;
  const macadamiaProductCount = products.filter((product) => product.category === "macadamia").length;

  const dailyVisits: DailyVisit[] = stats?.dailyVisits ?? [];
  const todayVisitCount = dailyVisits.length ? dailyVisits[dailyVisits.length - 1].count : 0;
  const dailyAverage = dailyVisits.length
    ? Math.round(dailyVisits.reduce((sum: number, day: DailyVisit) => sum + day.count, 0) / dailyVisits.length)
    : 0;
  const dailySummaryText = dailyVisits
    .map((day: DailyVisit) => {
      const date = new Date(day.date);
      return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${day.count}`;
    })
    .join(" · ");

  const mutationsPending = createProductMutation.isPending || updateProductMutation.isPending;

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Safety correction if items are cleared
  useEffect(() => {
    if (currentPage > 1 && paginatedProducts.length === 0) {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  }, [paginatedProducts, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="container mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground text-sm">Marketplace Control Center</p>
          </div>
          <Button variant="ghost" onClick={() => (window.location.href = "/")} className="hover:text-destructive">
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Visitors"
            value={
              <div className="flex items-center justify-between">
                {stats?.totalVisits || 0}
                <button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] })}
                  className="hover:text-primary transition-colors"
                >
                  <Loader2 size={16} className={isStatsFetching ? "animate-spin" : ""} />
                </button>
              </div>
            }
            icon={<MousePointerClick className="text-primary" />}
            color="primary"
          />
          <StatCard
            title="Daily Visitors"
            value={
              <div className="space-y-1">
                <div>{todayVisitCount}</div>
                <div className="text-xs font-normal text-slate-400">Today · 7-day avg {dailyAverage}</div>
                <div className="text-xs text-slate-400 break-words">{dailySummaryText}</div>
              </div>
            }
            icon={<CalendarDays className="text-sky-500" />}
            color="sky"
          />
          <StatCard title="Buyer Requests" value={buyerCount} icon={<ShoppingCart className="text-emerald-500" />} color="emerald" />
          <StatCard title="Seller Requests" value={sellerCount} icon={<Tractor className="text-indigo-500" />} color="indigo" />
          <StatCard 
            title="Products" 
            value={
              <div className="space-y-0.5">
                <div>{totalProductCount}</div>
                <div className="text-xs font-normal text-slate-400 flex gap-2">
                  <span>Avo: {avocadoProductCount}</span>
                  <span>Mac: {macadamiaProductCount}</span>
                </div>
              </div>
            } 
            icon={<Package className="text-orange-500" />} 
            color="orange" 
          />
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger value="leads" className="px-8">Leads</TabsTrigger>
            <TabsTrigger value="products" className="px-8">Catalogue</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <div className="flex gap-2 mb-6">
              {["all", "new", "pending", "completed"].map((f) => (
                <Button 
                  key={f} 
                  variant={filter === f ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setFilter(f)} 
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>

            <div className="bg-white rounded-xl border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">
                        <div>{enquiry.name}</div>
                        <div className="text-xs text-muted-foreground">{enquiry.email}</div>
                      </TableCell>
                      <TableCell className="capitalize">{enquiry.type}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{enquiry.message}</TableCell>
                      <TableCell>
                        <Badge variant={enquiry.status === "new" ? "default" : "secondary"}>
                          {enquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {["new", "pending", "completed"].map((status) => (
                              <DropdownMenuItem 
                                key={status} 
                                onClick={() => updateStatusMutation.mutate({ id: enquiry.id, status })}
                              >
                                Mark as {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Product Catalogue</h2>
                <p className="text-muted-foreground text-sm">Create, edit and remove marketplace products.</p>
              </div>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setShowAddForm(true);
                }}
              >
                <Plus size={16} className="mr-2" /> Add Product
              </Button>
            </div>
            
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Specs</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                        No products found. Add a product to populate the catalogue.
                      </td>
                    </tr>
                  ) : (
                    // --- MAPPED PAGINATED PRODUCTS ---
                    paginatedProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image || FALLBACK_IMAGE}
                              alt={product.name}
                              className="h-12 w-16 rounded-lg object-cover border border-slate-200"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = FALLBACK_IMAGE;
                              }}
                            />
                            <div>
                              <div className="font-medium text-slate-900">{product.name}</div>
                              <div className="text-xs text-slate-500">{product.desc}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-700 capitalize">{product.category}</td>
                        <td className="px-4 py-4 align-top text-slate-700">{product.price}</td>
                        <td className="px-4 py-4 align-top text-slate-700">
                          {Array.isArray(product.specs) ? product.specs.join(", ") : product.specs || ""}
                        </td>
                        <td className="px-4 py-4 align-top text-slate-700">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product);
                                setShowAddForm(true);
                              }}
                            >
                              <Edit size={16} className="mr-2" /> Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                              onClick={() => {
                                setDeleteProductId(product.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 size={16} className="mr-2" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* --- PAGINATION INTERFACE BAR --- */}
              {products.length > itemsPerPage && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t sm:px-6">
                  <div className="flex justify-between flex-1 sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(endIndex, products.length)}
                        </span>{" "}
                        of <span className="font-medium">{products.length}</span> results
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          className="w-9 h-9 p-0"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --- FIX: ADDED THE ANIMATION TIMEOUT TO PREVENT LAYOUT SNAP ON MODAL CLOSING --- */}
            <Dialog 
              open={showAddForm} 
              onOpenChange={(open) => {
                setShowAddForm(open);
                if (!open) {
                  setTimeout(() => setEditingProduct(null), 300);
                }
              }}
            >
              <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-3xl sm:p-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                  <DialogDescription>
                    {editingProduct
                      ? "Update the product details below and save to refresh the catalogue."
                      : "Enter a new catalogue product and publish it to the marketplace."}
                  </DialogDescription>
                </DialogHeader>
                <ProductAddForm
                  onSubmit={handleProductSubmit}
                  isPending={mutationsPending}
                  initialData={editingProduct ?? undefined}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
              if (!open) setDeleteProductId(null);
              setIsDeleteDialogOpen(open);
            }}>
              <AlertDialogContent className="max-w-[28rem]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete product?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the product from your catalogue and the public product listing.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto bg-red-600 border-red-600 text-white hover:bg-red-700"
                      onClick={() => {
                        if (deleteProductId !== null) {
                          deleteProductMutation.mutate({ id: deleteProductId });
                        }
                      }}
                      disabled={deleteProductMutation.isPending}
                    >
                      {deleteProductMutation.isPending ? "Deleting..." : "Delete product"}
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: any; icon: any; color: string }) {
  const colors: Record<string, string> = {
    primary: "border-l-primary",
    emerald: "border-l-emerald-500",
    indigo: "border-l-indigo-500",
    orange: "border-l-orange-500",
    sky: "border-l-sky-500",
  };
  return (
    <Card className={`border-l-4 ${colors[color]} shadow-sm`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
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
  initialData,
}: {
  onSubmit: (v: ProductFormValues) => void;
  isPending: boolean;
  initialData?: Product;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

 useEffect(() => {
  if (initialData) {
    // 1. Safe extraction and normalization of category string
    const rawCategory = initialData.category?.toLowerCase()?.trim();
    const sanitizedCategory = (rawCategory === "macadamia" || rawCategory === "avocado") 
      ? rawCategory 
      : "avocado"; // strict fallback if it's completely missing or wrong

    form.reset({
      name: initialData.name || "",
      price: initialData.price || "",
      image: initialData.image || "",
      desc: initialData.desc || "",
      specs: Array.isArray(initialData.specs)
        ? initialData.specs.join(", ")
        : (initialData.specs as any) || "",
      category: sanitizedCategory, // 2. Use the clean, verified string here
    });
    setPreview(initialData.image || null);
  } else {
    form.reset({
      name: "",
      price: "",
      image: "",
      desc: "",
      specs: "",
      category: "avocado",
    });
    setPreview(null);
  }
}, [initialData, form]);

  const handleInternalSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        form.setValue("image", base64, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleInternalSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel className="font-bold">Product Photo</FormLabel>
              <FormControl>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${form.formState.errors.image ? "border-destructive bg-destructive/5" : "hover:bg-slate-50"}`}
                >
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <Plus className="mx-auto text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500">Click to upload image</p>
                    </div>
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Grade A Macadamia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Range</FormLabel>
                <FormControl>
                  <Input placeholder="Ksh 500 - 1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="avocado">Avocado</SelectItem>
                    <SelectItem value="macadamia">Macadamia</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specs (Comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="Organic, Export Grade, 500g" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" /> Publishing...
            </>
          ) : initialData ? (
            "Update Product"
          ) : (
            "Publish to Marketplace"
          )}
        </Button>
      </form>
    </Form>
  );
}