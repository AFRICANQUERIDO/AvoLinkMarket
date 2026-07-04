import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password }),
      });

      if (!response.ok) throw new Error("Unauthorized");

      toast({ title: "Welcome back, Admin! 🔓" });
      setLocation("/admin");
    } catch {
      toast({
        title: "Access Denied",
        description: "Invalid admin password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 📧 Trigger secure back-end email recovery alert
  const handleForgotPassword = async () => {
    setIsResetting(true);
    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Failed request");

      toast({
        title: "Reset Request Sent ✉️",
        description: "A secure verification link has been sent to the registered admin email.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not process password recovery request right now.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <form onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold mb-6 text-primary">Admin Access</h2>
          <Input 
            type="password" 
            placeholder="Enter Admin Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-2"
            disabled={isSubmitting || isResetting}
          />
          
          <div className="text-right mb-4">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-emerald-600 hover:underline font-medium"
              disabled={isSubmitting || isResetting}
            >
              {isResetting ? "Sending link..." : "Forgot password?"}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || isResetting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Login to CRM"}
          </Button>
        </form>
      </div>
    </div>
  );
}