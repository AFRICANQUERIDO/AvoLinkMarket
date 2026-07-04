import { useEffect, useState } from "react";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ path, component: Component }: { path: string, component: React.ComponentType }) {
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAuthStatus("authenticated");
            return;
          }
        }
        setAuthStatus("unauthenticated");
      } catch {
        setAuthStatus("unauthenticated");
      }
    }
    checkAuth();
  }, []);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Route path={path}>
      {authStatus === "authenticated" ? <Component /> : <Redirect to="/login" />}
    </Route>
  );
}