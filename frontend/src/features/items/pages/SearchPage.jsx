import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import itemService from "../services/item.service";
import ItemCard from "../components/ItemCard";

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
    <div className="min-h-[calc(100vh-72px)] bg-[#000000] flex justify-center py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="shared-container w-full flex flex-col items-center">
        
        {/* UPPER ANCHOR: Search Label & Input wrapper bounding at max width matching Save Page styling constraints. But we place it within the unified width. Wait, the save page input was bounded by standard max-width: 480px, but here we can just let it span moderately or w-full. The prompt says "same container as library". */}
        <div className="w-full flex flex-col mb-8 pb-8 border-b border-[#1a1a1a]">
          <label className="text-[#666666] mb-2 uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            SEARCH
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search your saved items"
            className="w-full bg-[#000000] text-white border-0 border-b border-[#1a1a1a] focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150"
            style={{
              fontSize: "14px",
              letterSpacing: "0.01em",
              borderRadius: 0,
              color: "#ffffff",
              caretColor: "#ffffff",
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
            <div className="flex justify-center mt-12 w-full">
              <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                LOADING
              </p>
            </div>
          )}

          {/* STATE 3: DONE (RESULTS) */}
          {status === "done" && results && results.length > 0 && (
            <div className="w-full flex flex-col gap-6">
              <span className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                {results.length} RESULTS
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {results.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* STATE 4: DONE (EMPTY) */}
          {status === "done" && results && results.length === 0 && (
            <div className="text-center mt-20 flex flex-col items-center gap-4 w-full">
              <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                no results for that search
              </p>
              <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                try different keywords
              </p>
            </div>
          )}

          {/* STATE 5: ERROR */}
          {status === "error" && (
            <div className="text-center mt-20 w-full">
              <p className="text-[#ff3333] mb-6 uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
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
