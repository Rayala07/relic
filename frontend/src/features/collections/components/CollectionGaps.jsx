import React, { useState, useEffect } from "react";
import itemService from "../../items/services/item.service";

const CollectionGaps = ({ collectionId }) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    itemService.getCollectionGaps(collectionId)
      .then(result => {
        if (!result.suggestions || result.suggestions.length === 0) {
          setStatus("empty");
        } else {
          setData(result);
          setStatus("done");
        }
      })
      .catch(() => setStatus("error"));
  }, [collectionId]);

  if (status === "loading" || status === "empty" || status === "error") {
    return null;
  }

  const displayTags = data.tags.slice(0, 5);

  return (
    <div className="flex flex-col w-full mt-12">
      {/* Divider line above the section */}
      <div className="w-full flex flex-col gap-4 pt-8 border-t border-border">
        
        {/* Section label */}
        <h2 className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          YOU MIGHT ALSO WANT
        </h2>

        {/* Context line and tags */}
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            Based on your saved items about:
          </p>
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag, idx) => (
              <span
                key={idx}
                className="border border-border text-muted-foreground uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 0 }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Divider line between context and suggestions */}
        <div className="w-full border-t border-border mt-6 mb-2"></div>

        {/* SUGGESTIONS LIST */}
        <div className="flex flex-col w-full">
          {data.suggestions.map((suggestion, idx) => {
            const isLast = idx === data.suggestions.length - 1;
            return (
              <div 
                key={idx} 
                className={`flex justify-between items-center py-4 ${!isLast ? "border-b border-border" : ""}`}
              >
                {/* Left side */}
                <div className="flex items-center text-foreground" style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 400 }}>
                  <span className="text-muted-foreground mr-3">→</span>
                  {suggestion}
                </div>

                {/* Right side */}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(suggestion)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase whitespace-nowrap ml-4"
                  style={{ fontSize: "11px", letterSpacing: "0.08em" }}
                >
                  Search →
                </a>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
};

export default CollectionGaps;
