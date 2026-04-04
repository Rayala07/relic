import React, { useState } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../items/utils/timeAgo";
import itemService from "../../items/services/item.service";

const CollectionCard = ({ collection, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { _id, name, type, sourceTags, items, itemCount, createdAt } = collection;
  
  // displayCount extracts directly prioritizing explicit backend attributes securely preventing nested crashes
  const displayCount = itemCount ?? (Array.isArray(items) ? items.length : 0);
  
  // Slice tags natively avoiding layout breaks
  const displayTags = (sourceTags || []).slice(0, 3);
  const extraTagsCount = (sourceTags || []).length - 3;

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const confirmDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await itemService.deleteCollection(_id);
      if (onDelete) onDelete(_id);
    } catch (err) {
      console.error("Failed to delete collection:", err);
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  // 1. CONFIRMATION UI RENDERING (Replaces entire card surface entirely seamlessly on triggering)
  if (showConfirm) {
    return (
      <div 
        className="block w-full border border-[#1a1a1a] p-5 flex flex-col justify-center items-center gap-6"
        style={{ borderRadius: 0, minHeight: "140px" }}
      >
        <p className="text-white uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          delete this collection?
        </p>
        <div className="flex items-center gap-6">
          <button 
            type="button"
            onClick={confirmDelete}
            className="text-[#ff3333] hover:text-white transition-colors duration-150 uppercase cursor-pointer"
            style={{ fontSize: "11px", letterSpacing: "0.08em", background: "none", border: "none" }}
            disabled={isDeleting}
          >
            {isDeleting ? "DELETING..." : "YES DELETE"}
          </button>
          <button 
            type="button"
            onClick={handleCancelDelete}
            className="text-[#666666] hover:text-white transition-colors duration-150 uppercase cursor-pointer"
            style={{ fontSize: "11px", letterSpacing: "0.08em", background: "none", border: "none" }}
            disabled={isDeleting}
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  // 2. STANDARD CARD RENDERING mapping precise spacing models mimicking ItemCard constants natively
  return (
    <Link
      to={`/collections/${_id}`}
      className="block w-full border border-[#1a1a1a] p-5 hover:border-white transition-colors duration-150 flex flex-col gap-4 group"
      style={{ borderRadius: 0, opacity: isDeleting ? 0.5 : 1, minHeight: "140px" }}
    >
      
      {/* 2.1 TYPE AND METADATA */}
      <div
        className="flex items-center justify-between text-[#666666] uppercase"
        style={{ fontSize: "11px", letterSpacing: "0.08em" }}
      >
        <div className="flex items-center gap-4">
          <span>{type === "auto" ? "AUTO" : "MANUAL"}</span>
          
          {/* NATIVE DELETE INJECTION (Manual explicitly rendering hidden unless hovered) */}
          {type !== "auto" && (
            <button 
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 text-[#666666] hover:text-[#ff3333] transition-all duration-150 cursor-pointer disabled:opacity-0"
              style={{ background: "none", border: "none" }}
              aria-label="Delete collection"
            >
              DELETE
            </button>
          )}
        </div>
        <span>{displayCount === 1 ? "1 ITEM" : `${displayCount} ITEMS`}</span>
      </div>

      {/* 2.2 NAME INJECTION */}
      <h3
        className="text-white line-clamp-1 leading-tight flex-1"
        style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 500 }}
      >
        {name}
      </h3>

      {/* 2.3 CONDITIONAL AUTO TAG RENDERING */}
      {type === "auto" && (sourceTags || []).length > 0 && (
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
              +{extraTagsCount}
            </span>
          )}
        </div>
      )}

      {/* 2.4 TIMESTAMP BLOCK */}
      <div 
        className="text-[#666666] uppercase pt-2"
        style={{ fontSize: "11px", letterSpacing: "0.08em", marginTop: type !== "auto" ? "auto" : "0" }}
      >
        {timeAgo(createdAt)}
      </div>
      
    </Link>
  );
};

export default CollectionCard;
