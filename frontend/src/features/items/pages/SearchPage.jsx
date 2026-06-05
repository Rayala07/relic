import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import itemService from "../services/item.service";
import ItemCard from "../components/ItemCard";
import SkeletonGrid from "../../../components/ui/SkeletonGrid";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null);
  // status: 'idle' | 'searching' | 'done' | 'error'
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    // 1. Sync the URL replacing natively avoiding history saturation
    if (query) {
      setSearchParams({ q: query }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }

    // 2. Clear out on short queries
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      setStatus("idle");
      return;
    }

    // 3. Debounce
    const timeout = setTimeout(async () => {
      setStatus("searching");
      try {
        const response = await itemService.searchItems(query.trim());
        if (response && response.success) {
          setResults(response.data || []);
          setStatus("done");
        } else {
          throw new Error("Failed validation check");
        }
      } catch (err) {
        setStatus("error");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, setSearchParams]);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background flex justify-center py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="shared-container w-full flex flex-col items-center">
        <div className="w-full flex flex-col mb-8 pb-8 border-b border-border">
          <label className="text-muted-foreground mb-2 uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            SEARCH
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Use relatable context to perform search, we will fetch related items for you."
            className="w-full bg-background text-foreground border-0 border-b border-border focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150"
            style={{
              fontSize: "14px",
              letterSpacing: "0.01em",
              borderRadius: 0,
              color: "var(--foreground)",
              caretcolor: "var(--foreground)",
            }}
          />
        </div>

        {/* RESULTS SECTION */}
        <div className="w-full flex-1 flex flex-col">
          
          {/* STATE 1: IDLE */}
          {status === "idle" && (
            <div className="w-full h-full" />
          )}

          {/* STATE 2: SEARCHING */}
          {status === "searching" && (
            <SkeletonGrid count={3} />
          )}

          {/* STATE 3: DONE (RESULTS) */}
          {status === "done" && results && results.length > 0 && (
            <div className="w-full flex flex-col gap-6">
              <span className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                {results.length} RESULTS
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {results.map((item) => (
                  <ItemCard 
                    key={item._id} 
                    item={item} 
                    onDelete={(id) => setResults(prev => prev.filter(i => i._id !== id))} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* STATE 4: DONE (EMPTY) */}
          {status === "done" && results && results.length === 0 && (
            <div className="text-center mt-20 flex flex-col items-center gap-4 w-full">
              <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                no results for that search
              </p>
              <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                try different keywords
              </p>
            </div>
          )}

          {/* STATE 5: ERROR */}
          {status === "error" && (
            <div className="text-center mt-20 w-full">
              <p className="text-destructive mb-6 uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                search failed — try again
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchPage;
