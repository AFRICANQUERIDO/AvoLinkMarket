export interface Product {
  id: number;
  name: string;
  category: "avocado" | "macadamia";
  type: "Crude" | "Refined" | "Extra Virgin";
  price: number;
  origin: string;
  image: string;
}

export const initialProducts: Product[] = [
  {
    id: 1,
    name: "Premium Extra Virgin Avocado Oil",
    category: "avocado",
    type: "Extra Virgin",
    price: 9.45,
    origin: "Murang'a, Kenya",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800"
  },
  {
    id: 2,
    name: "Industrial Grade Crude Avocado Oil",
    category: "avocado",
    type: "Crude",
    price: 3.85,
    origin: "Arusha, Tanzania",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800"
  }
];