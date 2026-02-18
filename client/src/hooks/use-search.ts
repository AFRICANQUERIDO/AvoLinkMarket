import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const syncSearch = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("search") || "");
    };

    // Listen for URL changes
    window.addEventListener("popstate", syncSearch);
    syncSearch();
    return () => window.removeEventListener("popstate", syncSearch);
  }, [location]); // Added location dependency to sync on route changes

  /**
   * @param term The search string
   * @param targetPage Optional: where to send the user (e.g., '/market' or '/products')
   */
  const handleSearch = (term: string, targetPage?: string) => {
    const params = new URLSearchParams(window.location.search);
    
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    // Scenario A: User is on a different page and we want to send them to a specific catalog
    if (targetPage && location !== targetPage) {
      setLocation(`${targetPage}?${params.toString()}`);
    } 
    // Scenario B: User is already on the target page, just update the URL without a full reload
    else {
      const newRelativePathQuery = window.location.pathname + "?" + params.toString();
      window.history.replaceState(null, "", newRelativePathQuery);
      // Trigger the popstate so the useEffect above notices the change
      window.dispatchEvent(new Event("popstate"));
    }
  };

  return { 
    query: searchQuery, 
    handleSearch, 
    clearSearch: () => handleSearch("") 
  };
}