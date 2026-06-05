import React, { useState } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { RiDeleteBin4Fill } from "@remixicon/react";
import itemService from "../services/item.service";

function parseDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return url ? url.toUpperCase() : "UNKNOWN";
  }
}

const ItemCard = ({ item, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { _id, type, content = {}, ai = {}, createdAt, url } = item;

  // 1. Map backend type to display label
  const typeMap = {
    webpage: "WEBPAGE",
    pdf: "DOCS",
    youtube: "YOUTUBE",
    tweet: "SOCIAL",
  };
  const displayType = typeMap[type] || "WEBPAGE";

  // 2. Title fallback
  const title = item.title || content.title || parseDomain(url);

  // 3. Summary fallback
  const summary = ai.summary || content.excerpt || null;

  // 4. Tags slice
  const tags = ai.tags || [];
  const displayTags = tags.slice(0, 4);
  const extraTagsCount = tags.length - 4;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await itemService.deleteItem(_id);
      if (onDelete) onDelete(_id);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setIsDeleting(false);
    }
  };

  return (
    <Link
      to={`/items/${_id}`}
      className="block w-full border border-border p-5 hover:border-foreground transition-colors duration-150 flex flex-col gap-4 group"
      style={{ borderRadius: 0, opacity: isDeleting ? 0.5 : 1 }}
    >
      {/* 1. TYPE INDICATOR + DATE ROW */}
      <div
        className="flex items-center justify-between text-muted-foreground uppercase"
        style={{ fontSize: "11px", letterSpacing: "0.08em" }}
      >
        <span>{displayType}</span>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all duration-150 disabled:opacity-0 cursor-pointer"
            aria-label="Delete item"
          >
            <RiDeleteBin4Fill size={14} />
          </button>
          <span>{timeAgo(createdAt)}</span>
        </div>
      </div>

      {/* 2. TITLE */}
      <h3
        className="text-foreground line-clamp-2 leading-tight"
        style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 500 }}
      >
        {title}
      </h3>

      {/* 3. SUMMARY */}
      {summary && (
        <p
          className="text-muted-foreground line-clamp-3 leading-relaxed"
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
              className="border border-border text-muted-foreground uppercase group-hover:border-muted-foreground transition-colors duration-150"
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
              className="border border-border text-muted-foreground uppercase group-hover:border-muted-foreground transition-colors duration-150"
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
