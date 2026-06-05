import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import itemService from "../services/item.service";
import ItemCard from "../components/ItemCard";
import SkeletonGrid from "../../../components/ui/SkeletonGrid";

const FILTERS = ["ALL", "WEBPAGE", "DOCS", "YOUTUBE", "SOCIAL"];

const LibraryPage = () => {
  const [allItems, setAllItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async (targetPage, isAppend = false) => {
    try {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");

      const response = await itemService.getAll(targetPage, 12);
      
      if (response && response.success) {
        setAllItems((prev) => 
          isAppend ? [...prev, ...response.data] : response.data
        );
        setTotalCount(response.pagination.total);
        setHasMore(response.pagination.hasMore);
      } else {
        throw new Error("Failed to load");
      }
    } catch {
      setError("failed to load");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount
    fetchItems(1, false);
  }, [fetchItems]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage, true);
  };

  const handleRetry = () => {
    fetchItems(page, page > 1);
  };

  // Pure Client-side filtering mechanism based on fetched items pool
  const displayedItems = useMemo(() => {
    return allItems.filter(item => {
      if (activeFilter === "ALL") return true;
      if (activeFilter === "WEBPAGE" && item.type === "webpage") return true;
      if (activeFilter === "DOCS" && item.type === "pdf") return true;
      if (activeFilter === "YOUTUBE" && item.type === "youtube") return true;
      if (activeFilter === "SOCIAL" && item.type === "tweet") return true;
      return false;
    });
  }, [allItems, activeFilter]);

  // Remove early return for loading so we keep the layout shell intact

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background flex justify-center py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="shared-container">
        
        {/* TOP BAR */}
        <div className="flex flex-row items-end justify-between border-b border-border pb-6 mb-8 w-full gap-6">
          <div className="flex flex-col gap-1 shrink-0">
            <h1 className="text-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              LIBRARY
            </h1>
            <span className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              {totalCount} items
            </span>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-end">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`uppercase transition-colors duration-150 ${activeFilter === f ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                style={{ fontSize: "11px", letterSpacing: "0.08em", background: "none", border: "none", padding: 0 }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR STATE */}
        {error && allItems.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-destructive mb-6 uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="bg-background text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-150 uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px", border: "1px solid var(--border)" }}
            >
              RETRY
            </button>
          </div>
        ) : null}

        {/* EMPTY STATE */}
        {!loading && allItems.length === 0 && !error ? (
          <div className="text-center mt-32 flex flex-col items-center gap-4">
            <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              nothing saved yet
            </p>
            <Link
              to="/save"
              className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              save your first item →
            </Link>
          </div>
        ) : null}

        {/* LOADING STATE */}
        {loading && allItems.length === 0 && !error && (
          <SkeletonGrid count={6} />
        )}

        {/* EMPTY FILTER STATE */}
        {!loading && allItems.length > 0 && displayedItems.length === 0 && !error ? (
          <div className="text-center mt-20 flex flex-col items-center gap-4 w-full">
            <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              no {activeFilter === "ALL" ? "items" : activeFilter.toLowerCase()} found
            </p>
          </div>
        ) : null}

        {/* GRID LAYOUT */}
        {displayedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {displayedItems.map((item) => (
              <ItemCard 
                key={item._id} 
                item={item} 
                onDelete={(id) => setAllItems(prev => prev.filter(i => i._id !== id))} 
              />
            ))}
          </div>
        )}

        {/* PAGINATION / LOAD MORE */}
        {allItems.length > 0 && !error && (
          <div className="mt-12 flex justify-center border-t border-border pt-12">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full max-w-[240px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150 cursor-pointer uppercase disabled:opacity-50 disabled:cursor-wait"
                style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px", border: "none", fontWeight: 500 }}
              >
                {loadingMore ? "LOADING..." : "LOAD MORE"}
              </button>
            ) : (
              <span className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                — end —
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default LibraryPage;
