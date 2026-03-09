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
  Edit,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Enquiry, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { toast, useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1543257580-7269da771bf1?q=80&w=800&auto=format&fit=crop";

const productSchema = z.object({
  name: z.string().min(3),
  price: z.string().min(1),
  image: z.string().min(1, "Please upload an image"),
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
  const [showAddForm, setShowAddForm] = useState(false);

  // --- QUERIES ---
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
      toast({ title: "✅ Product Published" });
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
      data: ProductFormValues;
    }) => {
      // 1. Ensure specs is an array before sending
      // 2. We only send the fields that actually have values
      const formattedData = {
        ...data,
        specs:
          typeof data.specs === "string"
            ? data.specs
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : data.specs,
      };

      return await apiRequest("PATCH", `/api/products/${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Check console for details",
        variant: "destructive",
      });
      console.error("Update Error:", error);
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
  const [openEditId, setOpenEditId] = useState<number | null>(null);

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
            className="hover:text-destructive"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>

        {/* ANALYTICS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Visitors"
            value="1,284"
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
          <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger value="leads" className="px-8">
              Leads
            </TabsTrigger>
            <TabsTrigger value="products" className="px-8">
              Catalogue
            </TabsTrigger>
          </TabsList>

          {/* LEADS CONTENT */}
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
            </div>

            <Card className="shadow-sm border-none bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-0 divide-y">
                {filteredEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="flex items-start gap-4 p-6 hover:bg-slate-50 transition-all border-l-4 border-l-transparent hover:border-l-primary"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border ${enq.type === "buyer" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}
                    >
                      {enq.type === "buyer" ? (
                        <ShoppingCart size={18} />
                      ) : (
                        <Tractor size={18} />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{enq.company}</h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${enq.type === "buyer" ? "bg-emerald-500 text-white" : "bg-indigo-500 text-white"}`}
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 p-3 rounded-lg border italic text-sm text-slate-600 bg-slate-50">
                        "{enq.message}"
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CATALOGUE CONTENT */}
          <TabsContent value="products" className="space-y-6">
            {/* CATALOGUE HEADER */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Storefront Catalogue
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage products, pricing, and technical specs
                </p>
              </div>

              {/* ADD PRODUCT MODAL */}
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="gap-2 shadow-sm">
                    <Plus size={16} />
                    Add New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Product Listing</DialogTitle>
                    <DialogDescription className="sr-only">
                      Enter the details for the new product you want to add to
                      the inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <ProductAddForm
                    onSubmit={(v) => addProductMutation.mutate(v)}
                    isPending={addProductMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* PRODUCT TABLE */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-500 font-medium">
                    <th className="p-4 font-semibold w-20">Image</th>
                    <th className="p-4 font-semibold">Product Details</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          {/* Using the icon you already imported */}
                          <div className="bg-slate-50 p-4 rounded-full">
                            <ShoppingCart
                              size={40}
                              className="text-slate-200"
                            />
                          </div>
                          <div>
                            <p className="text-base font-medium text-slate-600">
                              Your catalogue is empty
                            </p>
                            <p className="text-sm text-slate-400">
                              Click the "Add New Item" button to populate your
                              store.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr
                        key={p.id}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                            <img
                              src={p.image || FALLBACK_IMAGE}
                              className="w-full h-full object-cover"
                              alt={p.name}
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                            {Array.isArray(p.specs)
                              ? p.specs.join(" • ")
                              : p.specs}
                          </div>
                        </td>
                        <td className="p-4 capitalize text-slate-600">
                          {p.category}
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          {p.price}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {/* EDIT MODAL */}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs"
                              >
                                <Edit size={14} className="mr-1" /> Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Update {p.name}</DialogTitle>
                                <DialogDescription className="sr-only">
                                  Modify the existing product details.
                                </DialogDescription>
                              </DialogHeader>
                              <ProductAddForm
                                initialData={p}
                                onSubmit={
                                  (v) =>
                                    updateProductMutation.mutate(
                                      {
                                        id: p.id,
                                        data: v,
                                      },
                                      { onSuccess: () => setOpenEditId(null) },
                                    ) // Closes modal on success)
                                }
                                isPending={updateProductMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>

                          {/* DELETE BUTTON */}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-3 text-xs"
                            onClick={() =>
                              confirm(`Delete ${p.name}?`) &&
                              deleteProductMutation.mutate(p.id)
                            }
                            disabled={deleteProductMutation.isPending}
                          >
                            {deleteProductMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

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
  initialData,
  onSuccess,
}: {
  onSubmit: (v: ProductFormValues) => void;
  isPending: boolean;
  initialData?: Product;
  onSuccess?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.image || null,
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || "",
      image: initialData?.image || "",
      desc: initialData?.desc || "",
      specs: Array.isArray(initialData?.specs)
        ? initialData.specs.join(", ")
        : (initialData?.specs as any) || "",
      category: (initialData?.category as any) || "avocado",
    },
  });

  // Handle actual submission
  const handleInternalSubmit = (data: ProductFormValues) => {
    onSubmit(data);
    if (onSuccess) onSuccess(); // Closes the modal
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 2MB Limit Check
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
      {/* CRITICAL: Ensure form.handleSubmit(handleInternalSubmit) is here */}
      <form
        onSubmit={form.handleSubmit(handleInternalSubmit)}
        className="space-y-4"
      >
        {/* IMAGE UPLOAD SECTION */}
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
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Plus className="mx-auto text-slate-400 mb-2" />
                      <p className="text-xs text-slate-500">
                        Click to upload image
                      </p>
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

        {/* PRODUCT NAME */}
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
