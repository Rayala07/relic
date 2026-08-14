import React, { useState, useEffect } from "react";
import { useItem } from "../hooks/useItem";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "../../../components/ui/skeleton";
import { RiEditBoxLine, RiLink } from "@remixicon/react";

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
      <div className="w-full flex flex-col gap-3 animate-in fade-in duration-300">
        <Skeleton className="h-[68px] w-full rounded-2xl border border-border/50 bg-background/50" />
        <Skeleton className="h-[68px] w-full rounded-2xl border border-border/30 bg-background/30" />
        <Skeleton className="h-[60px] w-full rounded-2xl mt-4 bg-foreground/10" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      {/* URL Input */}
      <div>
        <div className={`relative flex items-center bg-background/50 backdrop-blur-md rounded-2xl border ${urlError ? 'border-destructive/50 ring-2 ring-destructive/20' : 'border-border/50 hover:border-foreground/30 focus-within:border-foreground/80 focus-within:bg-background focus-within:ring-4 focus-within:ring-foreground/10'} transition-all duration-300 overflow-hidden shadow-sm`}>
          <div className={`pl-5 pr-3 shrink-0 ${urlError ? 'text-destructive' : 'text-muted-foreground/50'}`}>
            <RiLink size={20} />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              onUrlChange(e.target.value);
              if (urlError) onUrlErrorChange("");
            }}
            placeholder="Paste URL here..."
            autoFocus
            disabled={isLoading}
            className="w-full bg-transparent border-none outline-none py-4 pr-5 text-[16px] text-foreground placeholder:text-muted-foreground/40 disabled:opacity-50"
            style={{ caretColor: "var(--foreground)" }}
          />
        </div>
        {/* URL Validation Error */}
        {urlError && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-destructive text-[11px] uppercase tracking-wider pl-4 mt-2">
            {urlError}
          </motion.p>
        )}
      </div>

      {/* Title Input (Optional) */}
      <div className="relative flex items-center bg-background/50 backdrop-blur-md rounded-2xl border border-border/50 hover:border-foreground/30 focus-within:border-foreground/80 focus-within:bg-background focus-within:ring-4 focus-within:ring-foreground/10 transition-all duration-300 overflow-hidden shadow-sm">
        <div className="pl-5 pr-3 shrink-0 text-muted-foreground/50">
          <RiEditBoxLine size={20} />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Custom Title (Optional)"
          disabled={isLoading}
          className="w-full bg-transparent border-none outline-none py-4 pr-5 text-[16px] text-foreground placeholder:text-muted-foreground/40 disabled:opacity-50"
          style={{ caretColor: "var(--foreground)" }}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="group relative w-full mt-4 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center overflow-hidden shadow-xl"
        style={{ padding: "18px" }}
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-background/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
        
        <span className="relative z-10 flex items-center gap-2 text-[13px] font-bold tracking-[0.12em] uppercase">
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
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-foreground/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-foreground/5 blur-[100px] rounded-full pointer-events-none" />

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

      <div className="w-full max-w-[560px] flex flex-col items-center relative z-10">

        {/* ── PREMIUM HEADER ── */}
        <div className="flex flex-col items-center text-center mb-12 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-muted-foreground mb-6"
          >
            <Sparkles size={12} className="text-foreground/50" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Relic AI Pipeline</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 font-heading font-extrabold mb-4 tracking-tight" 
            style={{ fontSize: "clamp(40px, 6vw, 56px)", lineHeight: 1.1 }}
          >
            Save a resource
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-[16px] md:text-[17px] leading-relaxed max-w-[420px]"
          >
            Paste a link to any webpage, youtube video, article or any link. We'll instantly extract and categorize it for your knowledge base.
          </motion.p>
        </div>

        {/* ── THE CARD CONTAINER ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          className="w-full bg-card/40 backdrop-blur-3xl border border-foreground/10 rounded-[32px] p-2 shadow-2xl relative"
        >
          {/* Subtle top inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-foreground/30 to-transparent"></div>

          {/* Central static form */}
          <div className="bg-background/60 backdrop-blur-xl rounded-[24px] p-6 md:p-8 relative z-10 border border-foreground/5 shadow-inner">
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
        </motion.div>
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