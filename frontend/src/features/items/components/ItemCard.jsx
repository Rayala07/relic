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

const ItemCard = ({ item }) => {
  const { _id, type, content = {}, ai = {}, createdAt, url } = item;

  // 1. Map backend type to display label
  const typeMap = {
    webpage: "PAGE",
    pdf: "PDF",
    youtube: "YOUTUBE",
    tweet: "TWITTER",
  };
  const displayType = typeMap[type] || "PAGE";

  // 2. Title fallback
  const title = item.title || content.title || parseDomain(url);

  // 3. Summary fallback
  const summary = ai.summary || content.excerpt || null;

  // 4. Tags slice
  const tags = ai.tags || [];
  const displayTags = tags.slice(0, 4);
  const extraTagsCount = tags.length - 4;

  return (
    <Link
      to={`/items/${_id}`}
      className="block w-full border border-[#1a1a1a] p-5 hover:border-white transition-colors duration-150 flex flex-col gap-4 group"
      style={{ borderRadius: 0 }}
    >
      {/* 1. TYPE INDICATOR + DATE ROW */}
      <div
        className="flex items-center justify-between text-[#666666] uppercase"
        style={{ fontSize: "11px", letterSpacing: "0.08em" }}
      >
        <span>{displayType}</span>
        <span>{timeAgo(createdAt)}</span>
      </div>

      {/* 2. TITLE */}
      <h3
        className="text-white line-clamp-2 leading-tight"
        style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 500 }}
      >
        {title}
      </h3>

      {/* 3. SUMMARY */}
      {summary && (
        <p
          className="text-[#666666] line-clamp-3 leading-relaxed"
          style={{ fontSize: "14px", letterSpacing: "0.01em" }}
        >
          {summary}
        </p>
      )}

      {/* 4. TAGS ROW */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {displayTags.map((tag, idx) => (
            <span
              key={idx}
              className="border border-[#1a1a1a] text-[#666666] uppercase group-hover:border-[#333333] transition-colors duration-150"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                padding: "4px 8px",
                borderRadius: 0,
              }}
            >
              {tag}
            </span>
          ))}
          {extraTagsCount > 0 && (
            <span
              className="border border-[#1a1a1a] text-[#666666] uppercase group-hover:border-[#333333] transition-colors duration-150"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                padding: "4px 8px",
                borderRadius: 0,
              }}
            >
              +{extraTagsCount} MORE
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default ItemCard;
