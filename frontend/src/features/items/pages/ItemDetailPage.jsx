import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import itemService from "../services/item.service";
import { timeAgo } from "../utils/timeAgo";

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
  
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [resurfaceDays, setResurfaceDays] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [itemRes, relatedRes, resurfaceRes] = await Promise.all([
          itemService.getById(id),
          itemService.getRelated(id).catch(() => ({ success: true, count: 0, data: [] })),
          itemService.getResurfaced().catch(() => ({ success: true, count: 0, data: [] }))
        ]);

        if (isMounted) {
          if (!itemRes || !itemRes.success) {
            throw new Error("Item not found");
          }
          setItem(itemRes.data);
          
          if (relatedRes && relatedRes.success) {
            setRelated(relatedRes.data);
          }
          
          if (resurfaceRes && resurfaceRes.success && resurfaceRes.data) {
            const found = resurfaceRes.data.find(r => r._id === id);
            if (found) {
              setResurfaceDays(found.daysAgo);
            }
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
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6">
        <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          LOADING
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 gap-6">
        <p className="text-[#ff3333] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          {error || "Item not found"}
        </p>
        <Link 
          to="/library"
          className="text-[#666666] hover:text-white transition-colors duration-150 uppercase" 
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          ← RETRN TO LIBRARY
        </Link>
      </div>
    );
  }

  const { type, content = {}, ai = {}, createdAt, url } = item;
  
  const typeMap = {
    webpage: "PAGE",
    pdf: "PDF",
    youtube: "YOUTUBE",
    tweet: "TWITTER",
  };
  const displayType = typeMap[type] || "PAGE";
  const title = item.title || content.title || parseDomain(url);
  const tags = ai.tags || [];

  return (
    <div className="min-h-screen bg-[#000000] flex justify-center px-6 py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="w-full max-w-[900px] flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Header Block */}
          <div className="flex flex-col">
            <Link 
              to="/library"
              className="text-[#666666] hover:text-white transition-colors duration-150 uppercase self-start mb-8" 
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              ← LIBRARY
            </Link>

            {resurfaceDays && (
              <span 
                className="border border-[#1a1a1a] text-[#666666] uppercase self-start mb-4"
                style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 0 }}
              >
                SAVED {resurfaceDays} DAYS AGO
              </span>
            )}
            
            <div className="flex items-center justify-between text-[#666666] uppercase mb-4" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              <span>{displayType}</span>
              <span>{timeAgo(createdAt)}</span>
            </div>

            <h1 className="text-white leading-snug" style={{ fontSize: "20px", letterSpacing: "0.01em", fontWeight: 500 }}>
              {title}
            </h1>
            
            {content.author && (
              <p className="text-[#666666] uppercase mt-3" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                {content.author}
              </p>
            )}
          </div>

          {/* Summary Block */}
          {ai.summary && (
            <div className="flex flex-col gap-4 pt-8 border-t border-[#1a1a1a]">
              <h2 className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                SUMMARY
              </h2>
              <p className="text-white whitespace-pre-wrap" style={{ fontSize: "14px", letterSpacing: "0.01em", lineHeight: "1.6" }}>
                {ai.summary}
              </p>
            </div>
          )}

          {/* Tags Block */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-4 pt-8 border-t border-[#1a1a1a]">
              <h2 className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                TAGS
              </h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="border border-[#1a1a1a] text-[#666666] uppercase"
                    style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "4px 8px", borderRadius: 0 }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Block */}
          <div className="flex flex-col gap-4 pt-8 border-t border-[#1a1a1a]">
            <h2 className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              SOURCE
            </h2>
            <a 
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[#666666] hover:text-white transition-colors duration-150 truncate block w-full"
              style={{ fontSize: "14px", letterSpacing: "0.01em" }}
            >
              {parseDomain(url)}
            </a>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="w-full lg:w-[260px] flex flex-col gap-6 shrink-0 mt-2 lg:mt-[6.5rem]">
          <h2 className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            RELATED
          </h2>
          
          {related.length === 0 ? (
            <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              NO RELATED ITEMS
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {related.map(rel => {
                const relDisplayType = typeMap[rel.type] || "PAGE";
                const relTitle = rel.title || rel.content?.title || parseDomain(rel.url);
                return (
                  <Link 
                    key={rel._id} 
                    to={`/items/${rel._id}`}
                    className="group flex flex-col gap-2 p-4 border border-[#1a1a1a] hover:border-white transition-colors duration-150"
                  >
                    <div className="flex justify-between items-center text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                      <span>{relDisplayType}</span>
                      <span>{(rel.score * 100).toFixed(0)}% MATCH</span>
                    </div>
                    <h3 className="text-white line-clamp-1 leading-tight" style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 500 }}>
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
