import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useItem } from "../hooks/useItem";
import { Link2, Type, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "../../../components/ui/skeleton";

/**
 * Premium Form Block component for entering URL and Title.
 */
const InputBlock = ({ url, onUrlChange, title, onTitleChange, urlError, onUrlErrorChange, onSubmitData, isLoading }) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();

    try {
      new URL(trimmedUrl);
    } catch {
      onUrlErrorChange("Please enter a valid URL.");
      return;
    }

    onUrlErrorChange("");
    onSubmitData(trimmedUrl, trimmedTitle);
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-2 animate-in fade-in duration-300">
        <Skeleton className="h-[64px] w-full rounded-xl border border-border/50 bg-background/50" />
        <Skeleton className="h-[56px] w-full rounded-xl border border-border/30 bg-background/30" />
        <Skeleton className="h-[58px] w-full rounded-xl mt-4 bg-foreground/10" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
      {/* URL Input */}
      <div className={`relative flex items-center bg-background rounded-xl border ${urlError ? 'border-destructive/50 ring-1 ring-destructive/50' : 'border-border/50 focus-within:border-foreground/50 focus-within:ring-1 focus-within:ring-foreground/50'} transition-all duration-300 shadow-sm`}>
        <div className={`pl-4 pr-3 ${urlError ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Link2 size={20} />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => {
            onUrlChange(e.target.value);
            if (urlError) onUrlErrorChange("");
          }}
          placeholder="https://..."
          autoFocus
          disabled={isLoading}
          className="w-full bg-transparent border-none outline-none py-5 pr-4 text-[16px] text-foreground placeholder:text-muted-foreground/40 disabled:opacity-50"
          style={{ caretColor: "var(--foreground)" }}
        />
      </div>

      {/* URL Validation Error */}
      {urlError && (
        <p className="text-destructive text-[11px] uppercase tracking-wider pl-2 mt-1 mb-2">
          {urlError}
        </p>
      )}

      {/* Title Input (Optional) */}
      <div className="relative flex items-center bg-background/40 rounded-xl border border-border/30 focus-within:border-foreground/30 focus-within:bg-background transition-all duration-300">
        <div className="pl-4 pr-3 text-muted-foreground/40">
          <Type size={18} />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Custom Title (Optional)"
          disabled={isLoading}
          className="w-full bg-transparent border-none outline-none py-4 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/30 disabled:opacity-50"
          style={{ caretColor: "var(--foreground)" }}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="group relative w-full mt-4 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center overflow-hidden"
        style={{ padding: "18px" }}
      >
        <span className="relative z-10 flex items-center gap-2 text-[12px] font-semibold tracking-[0.1em] uppercase">
          {isLoading ? (
            <>
              <Sparkles size={16} className="animate-pulse" />
              Processing...
            </>
          ) : (
            <>
              Save to Library
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </span>
      </button>
    </form>
  );
};

const SavePage = () => {
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

  const handleSave = (submitUrl, submitTitle) => {
    setSubmittedUrl(submitUrl);
    handleSaveItem({ url: submitUrl, title: submitTitle });
  };

  useEffect(() => {
    let timer;
    if (pageState === "done") {
      setUrl("");
      setTitle("");
      setUrlError("");
      timer = setTimeout(() => {
        resetUI();
      }, 5000);
    } else if (pageState === "error") {
      timer = setTimeout(() => {
        resetUI();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [pageState, resetUI]);

  return (
    <div className="min-h-[calc(100vh-72px)] w-full bg-background flex flex-col items-center justify-center py-12 px-6 relative overflow-hidden">

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="fixed top-[96px] right-6 z-50 flex flex-col gap-4 pointer-events-none w-[calc(100%-48px)] sm:w-[400px]">
        <AnimatePresence>
          {pageState === "done" && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="px-6 py-5 bg-background/90 backdrop-blur-xl rounded-[16px] border border-border/50 flex flex-col gap-3 relative overflow-hidden shadow-2xl pointer-events-auto"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/50"></div>
              <div className="flex items-center gap-2 text-green-500/80 mb-1">
                <CheckCircle2 size={16} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Successfully Queued</span>
              </div>
              <p className="text-foreground line-clamp-2 leading-snug" style={{ fontSize: "15px", fontWeight: 500 }}>
                {savedItem?.title || savedItem?.content?.title || submittedUrl}
              </p>
              <p className="text-muted-foreground text-[12px]">
                The AI is currently extracting content in the background. It will appear in your library shortly.
              </p>
            </motion.div>
          )}

          {pageState === "error" && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="px-6 py-5 bg-destructive/10 backdrop-blur-xl rounded-[16px] border border-destructive/20 flex flex-col gap-2 relative overflow-hidden shadow-2xl pointer-events-auto"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/50"></div>
              <p className="text-destructive text-[11px] uppercase tracking-widest font-bold">
                Extraction Failed
              </p>
              <p className="text-destructive/80 text-[13px]">
                {apiError || "We couldn't reach that link. Check the URL and try again."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-[540px] flex flex-col items-center">

        {/* ── PREMIUM HEADER ── */}
        <div className="flex flex-col items-center text-center mb-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-muted-foreground mb-8">
            <span className="text-[10px] uppercase tracking-widest font-semibold">Relic AI Pipeline</span>
          </div>
          <h1 className="text-foreground font-heading font-bold mb-4 tracking-tight" style={{ fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1 }}>
            Save a resource
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: "16px", lineHeight: 1.6, maxWidth: "400px" }}>
            Paste a link to any webpage, youtube video, article or any link. We'll instantly extract and categorize it for your knowledge base.
          </p>
        </div>

        {/* ── THE CARD CONTAINER ── */}
        <div className="w-full bg-card/30 backdrop-blur-3xl border border-border/50 rounded-[24px] p-3 shadow-2xl relative">

          {/* Subtle top inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>

          {/* Central static form */}
          <div className="bg-background/40 rounded-[16px] p-4 relative z-10">
            <InputBlock
              url={url}
              onUrlChange={setUrl}
              title={title}
              onTitleChange={setTitle}
              urlError={urlError}
              onUrlErrorChange={setUrlError}
              onSubmitData={(u, t) => {
                resetUI();
                handleSave(u, t);
              }}
              isLoading={loading}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export const SavePageSkeleton = () => {
  return (
    <div className="min-h-[calc(100vh-72px)] w-full bg-background flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-[540px] flex flex-col items-center">
        {/* Skeleton Header */}
        <div className="flex flex-col items-center text-center mb-10 w-full gap-4">
          <Skeleton className="h-[28px] w-[140px] rounded-full" />
          <Skeleton className="h-[56px] w-[320px] rounded-xl" />
          <Skeleton className="h-[48px] w-[400px] rounded-xl" />
        </div>
        {/* Skeleton Card */}
        <div className="w-full bg-card/30 backdrop-blur-3xl border border-border/50 rounded-[24px] p-3 shadow-2xl relative">
          <div className="bg-background/40 rounded-[16px] p-4">
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-[64px] w-full rounded-xl border border-border/50 bg-background/50" />
              <Skeleton className="h-[56px] w-full rounded-xl border border-border/30 bg-background/30" />
              <Skeleton className="h-[58px] w-full rounded-xl mt-4 bg-foreground/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavePage;