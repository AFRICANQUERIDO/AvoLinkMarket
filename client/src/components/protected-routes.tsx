import { Redirect, Route } from "wouter";

export function ProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const isAuth = localStorage.getItem("admin_auth") === "true";

  return (
    <Route path={path}>
      {isAuth ? <Component /> : <Redirect to="/login" />}
    </Route>
  );
}