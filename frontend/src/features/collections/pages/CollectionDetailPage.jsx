import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import itemService from "../../items/services/item.service";
import ItemCard from "../../items/components/ItemCard";
import CollectionGaps from "../components/CollectionGaps";
import SkeletonGrid from "../../../components/ui/SkeletonGrid";
import { Skeleton } from "../../../components/ui/skeleton";

const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteState, setDeleteState] = useState('idle');

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

  const handleDelete = async () => {
    setDeleteState('deleting');
    try {
      await itemService.deleteCollection(collection._id);
      navigate('/collections');
    } catch (err) {
      console.error('delete failed:', err.message);
      setDeleteState('idle');
    }
  };

  // LOADING STATE
  if (loading && !collection) {
    return (
      <div className="min-h-[calc(100vh-72px)] w-full bg-background flex justify-center py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="shared-container w-full flex flex-col px-6">
          <div className="flex justify-between items-center w-full mb-8">
            <Skeleton className="h-3 w-24 bg-secondary" style={{ borderRadius: 0 }} />
          </div>
          
          <div className="flex flex-col mb-8 w-full gap-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-3 w-16 bg-secondary" style={{ borderRadius: 0 }} />
              <Skeleton className="h-3 w-16 bg-secondary" style={{ borderRadius: 0 }} />
            </div>
            <Skeleton className="h-6 w-3/4 bg-secondary" style={{ borderRadius: 0 }} />
            <Skeleton className="h-4 w-1/2 bg-secondary mt-2" style={{ borderRadius: 0 }} />
          </div>

          <div className="w-full border-b border-border mb-12"></div>

          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error && !collection) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col items-center justify-center p-6 gap-6">
        <p className="text-destructive uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          {error}
        </p>
        <button 
          onClick={loadCollection}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150 uppercase cursor-pointer" 
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
    <div className="min-h-[calc(100vh-72px)] w-full bg-background flex justify-center py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="shared-container w-full flex flex-col px-6">
        
        {/* ======================= */}
        {/* BACK NAVIGATION */}
        {/* ======================= */}
        <div className="flex justify-between items-center w-full mb-8">
          <Link 
            to="/collections"
            className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase" 
            style={{ fontSize: "11px", letterSpacing: "0.08em", padding: 0 }}
          >
            ← COLLECTIONS
          </Link>

          {collection?.type === 'manual' && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {deleteState === 'idle' && (
                <button 
                  onClick={() => setDeleteState('confirming')}
                  className="text-muted-foreground hover:text-destructive transition-colors duration-150 uppercase bg-transparent border-none cursor-pointer"
                  style={{ fontSize: "11px", letterSpacing: "0.08em", padding: 0 }}
                >
                  DELETE
                </button>
              )}

              {deleteState === 'confirming' && (
                <>
                  <button 
                    onClick={handleDelete}
                    className="text-destructive hover:text-foreground transition-colors duration-150 uppercase bg-transparent border-none cursor-pointer"
                    style={{ fontSize: "11px", letterSpacing: "0.08em", padding: 0 }}
                  >
                    CONFIRM DELETE
                  </button>
                  <button 
                    onClick={() => setDeleteState('idle')}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase bg-transparent border-none cursor-pointer"
                    style={{ fontSize: "11px", letterSpacing: "0.08em", padding: 0 }}
                  >
                    CANCEL
                  </button>
                </>
              )}

              {deleteState === 'deleting' && (
                <span className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                  DELETING...
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* ======================= */}
        {/* COLLECTION HEADER */}
        {/* ======================= */}
        <div className="flex flex-col mb-8 w-full">
          <div className="flex items-center justify-between text-muted-foreground uppercase mb-4" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            <span>{type === "auto" ? "AUTO" : "MANUAL"}</span>
            <span>{safeItems.length === 1 ? "1 ITEM" : `${safeItems.length} ITEMS`}</span>
          </div>

          <h1 className="text-foreground leading-snug w-full" style={{ fontSize: "20px", letterSpacing: "0.01em", fontWeight: 500 }}>
            {name}
          </h1>

          {description && (
            <p className="text-muted-foreground mt-3" style={{ fontSize: "14px", letterSpacing: "0.01em" }}>
              {description}
            </p>
          )}

          {type === "auto" && Array.isArray(sourceTags) && sourceTags.length > 0 && (
            <div className="flex flex-col gap-3 mt-6">
              <span className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                ORGANIZED AROUND
              </span>
              <div className="flex flex-wrap gap-2">
                {sourceTags.map((tag, idx) => (
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
        </div>

        {/* THIN DIVIDER BELOW HEADER */}
        <div className="w-full border-b border-border mb-12"></div>

        {/* ======================= */}
        {/* ITEMS GRID */}
        {/* ======================= */}
        {safeItems.length === 0 ? (
          <div className="w-full py-12 flex items-center justify-center border border-border">
            <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
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

        {/* ======================= */}
        {/* YOU MIGHT ALSO WANT */}
        {/* ======================= */}
        <CollectionGaps collectionId={collection._id} />

      </div>
    </div>
  );
};

export default CollectionDetailPage;
