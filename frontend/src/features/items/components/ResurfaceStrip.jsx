import React from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";

function parseDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return url ? url.toUpperCase() : "UNKNOWN";
  }
}

/**
 * ResurfaceStrip — A horizontal scroll strip of resurfaced items.
 *
 * Rendered above the main library grid ONLY when the backend has
 * resurfaced items cached for today. Completely isolated from the
 * library's own loading/error/empty states.
 *
 * Edge cases handled:
 *  - items array empty or missing → null (nothing renders)
 *  - individual item missing title/url → safe string fallbacks
 *  - item missing _id → key falls back to index (no crash)
 *  - daysAgo label missing → falls back to timeAgo(createdAt)
 */
const ResurfaceStrip = ({ items }) => {
  // Edge case 1: no items or null/undefined → render nothing
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full mb-10">
      {/* Section header — matches app's uppercase label pattern */}
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-border">
        <span
          className="text-muted-foreground uppercase"
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          — FROM YOUR PAST
        </span>
      </div>

      {/* Horizontal scroll container — no scrollbar (hidden globally in index.css) */}
      <div className="flex gap-4 overflow-x-auto">
        {items.map((item, index) => {
          // Edge case 2: destructure safely with fallbacks
          const {
            _id,
            type,
            title,
            content = {},
            ai = {},
            createdAt,
            url,
            daysAgo,
            resurfaceLabel,
          } = item || {};

          const typeMap = {
            webpage: "WEBPAGE",
            pdf: "DOCS",
            youtube: "YOUTUBE",
            tweet: "SOCIAL",
          };
          const displayType = typeMap[type] || "WEBPAGE";

          // Edge case 3: title resolution with safe fallbacks
          const displayTitle =
            title || content?.title || parseDomain(url) || "Untitled";

          // Edge case 4: resurfaceLabel might not exist (older cache format)
          const timeLabel = resurfaceLabel
            ? resurfaceLabel.toUpperCase()
            : daysAgo
            ? `${daysAgo} DAYS AGO`
            : createdAt
            ? timeAgo(createdAt).toUpperCase()
            : "";

          // Edge case 5: _id might be missing (malformed data) — skip rendering
          if (!_id) return null;

          return (
            <Link
              key={_id || index}
              to={`/items/${_id}`}
              className="flex-none w-[220px] border border-border p-4 hover:border-foreground transition-colors duration-150 flex flex-col gap-3 group"
              style={{ borderRadius: 0 }}
            >
              {/* Type + time ago row */}
              <div
                className="flex items-center justify-between text-muted-foreground uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.08em" }}
              >
                <span>{displayType}</span>
                {timeLabel && <span>{timeLabel}</span>}
              </div>

              {/* Title — clamped to 2 lines */}
              <p
                className="text-foreground line-clamp-2 leading-snug"
                style={{ fontSize: "13px", letterSpacing: "0.01em", fontWeight: 500 }}
              >
                {displayTitle}
              </p>

              {/* Tags — show first 2 only to keep card compact */}
              {Array.isArray(ai?.tags) && ai.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto">
                  {ai.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="border border-border text-muted-foreground uppercase group-hover:border-muted-foreground transition-colors duration-150"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        padding: "3px 6px",
                        borderRadius: 0,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ResurfaceStrip;
