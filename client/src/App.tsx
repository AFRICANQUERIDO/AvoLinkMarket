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
import { Layout } from "@/components/layout";
import { usePageTracking } from "@/hooks/use-page-tracking";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/protected-routes"

function Router() {
  usePageTracking();
  
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        
        {/* Combine the market routes into ONE. 
            The key={window.location.search} forces a full remount 
            whenever the URL parameters change (e.g., during a reset). */}
        <Route path="/market">
          {() => <Market key={window.location.search} />}
        </Route>

        <Route path="/login" component={Login} />
        <ProtectedRoute path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
