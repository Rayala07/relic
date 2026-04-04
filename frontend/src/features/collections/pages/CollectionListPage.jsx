import React, { useState, useEffect } from "react";
import itemService from "../../items/services/item.service";
import CollectionCard from "../components/CollectionCard";

const CollectionListPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await itemService.getCollections();
        if (isMounted) {
          if (res && res.success) {
            setCollections(res.data);
          } else {
            throw new Error("failed to load collections");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("failed to load collections — retry");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCollections();
    return () => { isMounted = false; };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("name is required");
      return;
    }
    try {
      setIsCreating(true);
      setFormError(null);
      const res = await itemService.createCollection(name, description);
      if (res && res.success) {
        setCollections(prev => [res.data, ...prev]);
        setShowForm(false);
        setName("");
        setDescription("");
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "failed to create collection");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setName("");
    setDescription("");
    setFormError(null);
  };

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await itemService.getCollections();
      if (res && res.success) {
        setCollections(res.data);
      } else {
        throw new Error("failed to load collections");
      }
    } catch (err) {
      setError("failed to load collections — retry");
    } finally {
      setLoading(false);
    }
  };

  const onCollectionDeleted = (id) => {
    setCollections(prev => prev.filter(c => c._id !== id));
  };

  if (loading && collections.length === 0) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#000000] flex items-center justify-center p-6">
        <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          LOADING
        </p>
      </div>
    );
  }

  if (error && collections.length === 0) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#000000] flex flex-col items-center justify-center p-6 gap-6">
        <p className="text-[#ff3333] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          {error}
        </p>
        <button 
          onClick={loadCollections}
          className="bg-white text-black hover:bg-[#e0e0e0] transition-colors duration-150 uppercase cursor-pointer" 
          style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px 28px", fontWeight: 500, borderRadius: 0, border: "none" }}
        >
          RETRY
        </button>
      </div>
    );
  }

  const autoCollections = collections.filter(c => c.type === "auto");
  const manualCollections = collections.filter(c => c.type !== "auto");

  return (
    <div className="min-h-[calc(100vh-72px)] w-full bg-[#000000] flex justify-center py-12" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="shared-container w-full flex flex-col items-center px-6">
        
        {/* HEADER ROW */}
        <div className="w-full flex items-end justify-between pb-6 mb-8 mt-[16px] border-b border-[#1a1a1a]">
          <div className="flex flex-col gap-2">
            <h1 className="text-white uppercase" style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "0.01em" }}>COLLECTIONS</h1>
            <span className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              {collections.length === 1 ? "1 COLLECTION" : `${collections.length} COLLECTIONS`}
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-white text-black hover:bg-[#e0e0e0] transition-colors duration-150 uppercase" 
            style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px 28px", fontWeight: 500, border: "none", cursor: "pointer" }}
          >
            NEW COLLECTION
          </button>
        </div>

        {/* INLINE CREATE FORM */}
        {showForm && (
          <div className="w-full flex flex-col mb-8" style={{ maxWidth: "600px", alignSelf: "flex-start" }}>
            <div className="flex flex-col gap-6 w-full">
              
              <input
                 type="text"
                 placeholder="collection name"
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full bg-transparent text-white border-0 border-b border-[#1a1a1a] focus:border-white focus:outline-none px-0 pb-4 transition-colors duration-150"
                 style={{ fontSize: "14px", letterSpacing: "0.01em", borderRadius: 0 }}
                 disabled={isCreating}
              />
              {formError && (
                 <p className="text-[#ff3333] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                   {formError}
                 </p>
              )}
              
              <input
                 type="text"
                 placeholder="description (optional)"
                 value={description}
                 onChange={e => setDescription(e.target.value)}
                 className="w-full bg-transparent text-white border-0 border-b border-[#1a1a1a] focus:border-white focus:outline-none px-0 pb-4 transition-colors duration-150"
                 style={{ fontSize: "14px", letterSpacing: "0.01em", borderRadius: 0 }}
                 disabled={isCreating}
              />
              
              <div className="flex items-center gap-6 mt-2">
                 <button 
                   onClick={handleCreate}
                   disabled={isCreating}
                   className="bg-white text-black hover:bg-[#e0e0e0] transition-colors duration-150 uppercase" 
                   style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px 28px", fontWeight: 500, border: "none", cursor: "pointer" }}
                 >
                   {isCreating ? "CREATING..." : "CREATE"}
                 </button>
                 <button 
                   onClick={handleCancel}
                   disabled={isCreating}
                   className="text-[#666666] hover:text-white transition-colors duration-150 uppercase" 
                   style={{ fontSize: "11px", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer" }}
                 >
                   CANCEL
                 </button>
              </div>
            </div>
            {/* THIN DIVIDER BELOW FORM */}
            <div className="w-full border-b border-[#1a1a1a] mt-8"></div>
          </div>
        )}

        {/* ======================= */}
        {/* SECTION 1: AUTO-ORGANIZED */}
        {/* ======================= */}
        {autoCollections.length > 0 && (
          <div className="w-full flex flex-col mb-12">
            <h2 
              className="text-[#666666] uppercase mb-6" 
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              AUTO-ORGANIZED
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {autoCollections.map((col) => (
                <CollectionCard 
                  key={col._id} 
                  collection={col} 
                  onDelete={onCollectionDeleted} 
                />
              ))}
            </div>
            
            {/* Divider if manual exists below */}
            {manualCollections.length > 0 && (
               <div className="w-full border-b border-[#1a1a1a] mt-12"></div>
            )}
          </div>
        )}

        {/* ======================= */}
        {/* SECTION 2: YOUR COLLECTIONS */}
        {/* ======================= */}
        <div className="w-full flex flex-col mb-12">
          <h2 
            className="text-[#666666] uppercase mb-6" 
            style={{ fontSize: "11px", letterSpacing: "0.08em" }}
          >
            YOUR COLLECTIONS
          </h2>
          
          {manualCollections.length === 0 ? (
            <div className="w-full py-12 flex items-center justify-center border border-[#1a1a1a]">
              <p className="text-[#666666] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
                NO COLLECTIONS YET — CREATE ONE ABOVE
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {manualCollections.map((col) => (
                <CollectionCard 
                  key={col._id} 
                  collection={col} 
                  onDelete={onCollectionDeleted} 
                />
              ))}
            </div>
          )}
        </div>

        {/* END LABEL */}
        {!loading && collections.length > 0 && (
          <div className="w-full flex justify-center mt-8 mb-16">
             <span className="text-[#333333] uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
               — END —
             </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default CollectionListPage;
