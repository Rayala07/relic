import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import itemService from "../../items/services/item.service";
import ItemCard from "../../items/components/ItemCard";

const CollectionDetailPage = () => {
  const { id } = useParams();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await itemService.getCollection(id);
        if (isMounted) {
          if (res && res.success) {
            setCollection(res.data);
          } else {
            throw new Error("failed to load collections");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "failed to load collection — retry");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCollection();
    return () => { isMounted = false; };
  }, [id]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await itemService.getCollection(id);
      if (res && res.success) {
        setCollection(res.data);
      } else {
        throw new Error("failed to load collections");
      }
    } catch (err) {
      setError("failed to load collection — retry");
    } finally {
      setLoading(false);
    }
  };

  const onItemDeleted = (itemId) => {
    if (collection) {
      setCollection(prev => ({
        ...prev,
        items: Array.isArray(prev.items) ? prev.items.filter(item => item && item._id !== itemId) : []
      }));
    }
  };

  // LOADING STATE
  if (loading && !collection) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#000000] flex items-center justify-center p-6">
        <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          LOADING
        </p>
      </div>
    );
  }

  // ERROR STATE
  if (error && !collection) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#000000] flex flex-col items-center justify-center p-6 gap-6">
        <p className="text-[#ff3333] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          {error}
        </p>
        <button 
          onClick={loadCollection}
          className="bg-white text-black hover:bg-[#e0e0e0] transition-colors duration-150 uppercase cursor-pointer" 
          style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px 28px", fontWeight: 500, borderRadius: 0, border: "none" }}
        >
          RETRY
        </button>
      </div>
    );
  }

  const { name, description, type, sourceTags, items } = collection;
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="min-h-[calc(100vh-72px)] w-full bg-[#000000] flex justify-center py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="shared-container w-full flex flex-col px-6">
        
        {/* ======================= */}
        {/* BACK NAVIGATION */}
        {/* ======================= */}
        <Link 
          to="/collections"
          className="text-[#666666] hover:text-white transition-colors duration-150 uppercase self-start mb-8 block" 
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          ← COLLECTIONS
        </Link>
        
        {/* ======================= */}
        {/* COLLECTION HEADER */}
        {/* ======================= */}
        <div className="flex flex-col mb-8 w-full">
          <div className="flex items-center justify-between text-[#666666] uppercase mb-4" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            <span>{type === "auto" ? "AUTO" : "MANUAL"}</span>
            <span>{safeItems.length === 1 ? "1 ITEM" : `${safeItems.length} ITEMS`}</span>
          </div>

          <h1 className="text-white leading-snug w-full" style={{ fontSize: "20px", letterSpacing: "0.01em", fontWeight: 500 }}>
            {name}
          </h1>

          {description && (
            <p className="text-[#666666] mt-3" style={{ fontSize: "14px", letterSpacing: "0.01em" }}>
              {description}
            </p>
          )}

          {type === "auto" && Array.isArray(sourceTags) && sourceTags.length > 0 && (
            <div className="flex flex-col gap-3 mt-6">
              <span className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                ORGANIZED AROUND
              </span>
              <div className="flex flex-wrap gap-2">
                {sourceTags.map((tag, idx) => (
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
        </div>

        {/* THIN DIVIDER BELOW HEADER */}
        <div className="w-full border-b border-[#1a1a1a] mb-12"></div>

        {/* ======================= */}
        {/* ITEMS GRID */}
        {/* ======================= */}
        {safeItems.length === 0 ? (
          <div className="w-full py-12 flex items-center justify-center border border-[#1a1a1a]">
            <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              NOTHING IN THIS COLLECTION YET
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {safeItems.map((item) => (
              <ItemCard 
                key={item._id} 
                item={item} 
                onDelete={onItemDeleted} 
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CollectionDetailPage;
