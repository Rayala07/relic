import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useItem } from "../hooks/useItem";
import { closeSaveModal } from "../../../app/uiSlice";
import { ArrowRight, Sparkles, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RiEditBoxLine, RiLink } from "@remixicon/react";

export const SaveModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.isSaveModalOpen);

  const {
    currentItem: savedItem,
    error: apiError,
    pageState,
    loading,
    handleSaveItem,
    resetUI,
  } = useItem();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [urlError, setUrlError] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");

  const handleClose = () => {
    dispatch(closeSaveModal());
    setTimeout(() => {
      setUrl("");
      setTitle("");
      setUrlError("");
      resetUI();
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();

    try {
      new URL(trimmedUrl);
    } catch {
      setUrlError("Please enter a valid URL.");
      return;
    }

    setUrlError("");
    setSubmittedUrl(trimmedUrl);
    handleSaveItem({ url: trimmedUrl, title: trimmedTitle });
  };

  useEffect(() => {
    let timer;
    if (pageState === "done") {
      setUrl("");
      setTitle("");
      setUrlError("");
      timer = setTimeout(() => {
        handleClose();
      }, 3000); // Close automatically after success
    } else if (pageState === "error") {
      timer = setTimeout(() => {
        resetUI();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [pageState, resetUI]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[500px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-foreground/5 z-20"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="p-6 md:p-8 text-center border-b border-border/50">
              <h2 className="text-2xl font-heading font-bold mb-2">Save a resource</h2>
              <p className="text-muted-foreground text-sm">
                Paste a link to any webpage, youtube video, article or any link.
              </p>
            </div>

            {/* Form */}
            <div className="p-6 md:p-8">
              {pageState === "done" ? (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-foreground font-semibold mb-1">Successfully Queued</h3>
                  <p className="text-muted-foreground text-sm">
                    {savedItem?.title || savedItem?.content?.title || submittedUrl}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  
                  {apiError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                      {apiError}
                    </div>
                  )}

                  {/* URL Input */}
                  <div>
                    <div className={`flex items-center bg-background rounded-xl border ${urlError ? 'border-destructive/50 ring-2 ring-destructive/20' : 'border-border focus-within:border-foreground/50 focus-within:ring-2 focus-within:ring-foreground/10'} transition-all px-4 py-3`}>
                      <RiLink size={18} className="text-muted-foreground/50 mr-3 shrink-0" />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (urlError) setUrlError("");
                        }}
                        placeholder="Paste URL here..."
                        autoFocus
                        disabled={loading}
                        className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 text-[15px]"
                      />
                    </div>
                    {urlError && <p className="text-destructive text-xs mt-2 pl-2">{urlError}</p>}
                  </div>

                  {/* Title Input */}
                  <div className="flex items-center bg-background rounded-xl border border-border focus-within:border-foreground/50 focus-within:ring-2 focus-within:ring-foreground/10 transition-all px-4 py-3">
                    <RiEditBoxLine size={18} className="text-muted-foreground/50 mr-3 shrink-0" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Custom Title (Optional)"
                      disabled={loading}
                      className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 text-[15px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !url.trim()}
                    className="w-full mt-2 bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3.5 flex items-center justify-center text-sm font-semibold tracking-wide"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><Sparkles size={16} className="animate-pulse" /> Processing...</span>
                    ) : (
                      "Save to Library"
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
