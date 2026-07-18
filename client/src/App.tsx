import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import Market from "@/pages/market";
import Admin from "@/pages/admin";
import Login from "./pages/login";
import { Layout } from "@/components/layout";
import { usePageTracking } from "@/hooks/use-page-tracking";
import { ProtectedRoute } from "./components/protected-routes";

function Router() {
  // Use the tracking hook inside a proper component
  usePageTracking();
  
  return (
    <Switch>
      {/* 🔒 Auth Pages */}
      <Route path="/login" component={Login} />
      <ProtectedRoute path="/admin" component={Admin} />

      {/* 🌐 Public Website Routes */}
      <Route path="/">
        {() => <Layout><Home /></Layout>}
      </Route>
      <Route path="/products">
        {() => <Layout><Products /></Layout>}
      </Route>
      <Route path="/market">
        {() => <Layout><Market /></Layout>}
      </Route>

      {/* 🚫 Fallback 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;