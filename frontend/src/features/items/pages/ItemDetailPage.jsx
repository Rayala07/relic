import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import itemService from "../services/item.service";
import { timeAgo } from "../utils/timeAgo";
import { RiDeleteBin4Fill } from "@remixicon/react";

function parseDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// After first fetch from database store the item details in local-storage so there are 
// less db reads.
const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [collections, setCollections] = useState([]);
  
  const [addingCollectionId, setAddingCollectionId] = useState(null);
  const [addedCollectionId, setAddedCollectionId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [itemRes, relatedRes, collRes] = await Promise.all([
          itemService.getById(id),
          itemService.getRelated(id).catch(() => ({ success: true, count: 0, data: [] })),
          itemService.getCollections().catch(() => ({ success: true, count: 0, data: [] }))
        ]);

        if (isMounted) {
          if (!itemRes || !itemRes.success) {
            throw new Error("Item not found");
          }
          setItem(itemRes.data);
          
          if (relatedRes && relatedRes.success) {
            setRelated(relatedRes.data);
          }
          
          if (collRes && collRes.success && collRes.data) {
            setCollections(collRes.data.filter(c => c.type !== "auto"));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "failed to load item");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex items-center justify-center p-6">
        <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          LOADING
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col items-center justify-center p-6 gap-6">
        <p className="text-destructive uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          {error || "Item not found"}
        </p>
        <Link 
          to="/library"
          className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase" 
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          ← RETRN TO LIBRARY
        </Link>
      </div>
    );
  }

  const { type, content = {}, ai = {}, createdAt, url } = item;
  
  const typeMap = {
    webpage: "WEBPAGE",
    pdf: "DOCS",
    youtube: "YOUTUBE",
    tweet: "SOCIAL",
  };
  const displayType = typeMap[type] || "WEBPAGE";
  const title = item.title || content.title || parseDomain(url);
  const tags = ai.tags || [];

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await itemService.deleteItem(id);
      navigate("/library");
    } catch (err) {
      console.error("Failed to delete item:", err);
      setIsDeleting(false);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    try {
      setAddingCollectionId(collectionId);
      await itemService.addItemToCollection(collectionId, id);
      setAddedCollectionId(collectionId);
      setTimeout(() => setAddedCollectionId(null), 2000);
    } catch (err) {
      console.error("Failed to add to collection:", err);
    } finally {
      setAddingCollectionId(null);
    }
  };

  return (
    <div className="w-full bg-background flex justify-center py-6">
      <div className="shared-container flex flex-col lg:flex-row gap-[64px] items-start">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="flex-1 flex flex-col gap-8 w-full">
          
          {/* Header Block */}
          <div className="flex flex-col">
            <Link 
              to="/library"
              className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase self-start mb-6" 
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              ← LIBRARY
            </Link>


            
            <div className="flex items-center justify-between text-muted-foreground uppercase mb-4" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              <span>{displayType}</span>
              <div className="flex items-center gap-4">
                <span>{timeAgo(createdAt)}</span>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive transition-colors duration-150 cursor-pointer disabled:opacity-50"
                  title="Delete item"
                >
                  <RiDeleteBin4Fill size={16} />
                </button>
              </div>
            </div>

            <h1 className="text-foreground leading-snug" style={{ fontSize: "20px", letterSpacing: "0.01em", fontWeight: 500 }}>
              {title}
            </h1>
            
            {content.author && (
              <p className="text-muted-foreground uppercase mt-3" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                {content.author}
              </p>
            )}
          </div>

          {/* Summary Block */}
          {ai.summary && (
            <div className="flex flex-col gap-4 pt-8 border-t border-border">
              <h2 className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                SUMMARY
              </h2>
              <p className="text-foreground whitespace-pre-wrap" style={{ fontSize: "14px", letterSpacing: "0.01em", lineHeight: "1.6" }}>
                {ai.summary}
              </p>
            </div>
          )}

          {/* Tags Block */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-4 pt-8 border-t border-border">
              <h2 className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                TAGS
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
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
          )}

          {/* Source Block */}
          <div className="flex flex-col gap-4 pt-8 border-t border-border">
            <h2 className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              SOURCE
            </h2>
            <a 
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-150 truncate block w-full"
              style={{ fontSize: "14px", letterSpacing: "0.01em" }}
            >
              {parseDomain(url)}
            </a>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="w-full lg:w-[280px] flex flex-col gap-12 shrink-0 lg:sticky lg:top-[96px]">
          
          {/* ADD TO COLLECTION */}
          {collections.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                ADD TO COLLECTION
              </h2>
              <div className="flex flex-col gap-3">
                {collections.map(col => {
                  const isAdding = addingCollectionId === col._id;
                  const isAdded = addedCollectionId === col._id;
                  
                  return (
                    <button
                      key={col._id}
                      onClick={() => handleAddToCollection(col._id)}
                      disabled={isAdding || isAdded}
                      className="text-left w-full border border-border p-3 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors duration-150 uppercase flex justify-between items-center group"
                      style={{ fontSize: "11px", letterSpacing: "0.08em", background: "none", cursor: (isAdding || isAdded) ? "default" : "pointer" }}
                    >
                      <span className="truncate pr-2 leading-none block pt-[2px]">{col.name}</span>
                      {isAdding && <span className="text-muted-foreground shrink-0 leading-none">...</span>}
                      {isAdded && <span className="text-foreground shrink-0 leading-none">ADDED</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RELATED */}
          <h2 className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            RELATED
          </h2>
          
          {related.length === 0 ? (
            <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              NO RELATED ITEMS
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {related.map(rel => {
                const relDisplayType = typeMap[rel.type] || "WEBPAGE";
                const relTitle = rel.title || rel.content?.title || parseDomain(rel.url);
                return (
                  <Link 
                    key={rel._id} 
                    to={`/items/${rel._id}`}
                    className="group flex flex-col gap-2 p-4 border border-border hover:border-foreground transition-colors duration-150"
                  >
                    <div className="flex justify-between items-center text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                      <span>{relDisplayType}</span>
                      <span>{(rel.score * 100).toFixed(0)}% MATCH</span>
                    </div>
                    <h3 className="text-foreground line-clamp-1 leading-tight" style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 500 }}>
                      {relTitle}
                    </h3>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ItemDetailPage;
