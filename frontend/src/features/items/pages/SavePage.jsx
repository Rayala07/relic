import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useItem } from "../hooks/useItem";

/**
 * Reusable Form Block component for entering URL and Title.
 * Shared across 'idle', 'error', and 'done' (save another) states.
 */
const InputBlock = ({ labelText, prefillUrl = "", onSubmitData, isLoading }) => {
  const [localUrl, setLocalUrl] = useState(prefillUrl);
  const [localTitle, setLocalTitle] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUrl = localUrl.trim();
    const trimmedTitle = localTitle.trim();

    // Basic client-side URL validation
    try {
      new URL(trimmedUrl);
    } catch {
      setUrlError("invalid url");
      return;
    }
    
    setUrlError("");
    onSubmitData(trimmedUrl, trimmedTitle);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex-col flex gap-4">
      {/* Optional Top Label */}
      {labelText && (
        <p
          className="text-[#666666] mb-2 uppercase"
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          {labelText}
        </p>
      )}

      {/* URL Input */}
      <input
        type="text"
        value={localUrl}
        onChange={(e) => {
          setLocalUrl(e.target.value);
          setUrlError("");
        }}
        placeholder="paste a url"
        autoFocus
        disabled={isLoading}
        className="w-full bg-[#0a0a0a] text-white border-0 border-b border-[#1a1a1a] focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150 disabled:opacity-50"
        style={{
          fontSize: "14px",
          letterSpacing: "0.01em",
          borderRadius: 0,
          color: "#ffffff",
          caretColor: "#ffffff",
        }}
      />
      
      {/* URL Validation Error */}
      {urlError && (
        <p
          className="text-[#ff3333] uppercase"
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          {urlError}
        </p>
      )}

      {/* Title Input (Optional) */}
      <input
        type="text"
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        placeholder="title"
        disabled={isLoading}
        className="w-full bg-[#0a0a0a] text-white border-0 border-b border-[#1a1a1a] focus:border-b focus:border-white outline-none pb-4 pt-0 px-0 transition-colors duration-150 disabled:opacity-50"
        style={{
          fontSize: "14px",
          letterSpacing: "0.01em",
          borderRadius: 0,
          color: "#ffffff",
          caretColor: "#ffffff",
        }}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 bg-white text-black hover:bg-[#e0e0e0] transition-colors duration-150 cursor-pointer uppercase disabled:opacity-50 disabled:cursor-wait"
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          padding: "14px",
          borderRadius: 0,
          border: "none",
          fontWeight: 500,
        }}
      >
        {isLoading ? "SAVING..." : "SAVE"}
      </button>
    </form>
  );
};

/**
 * Main Save Page Component
 * Handles the logic transitions between Idle, Error, and Done states.
 */
const SavePage = () => {
  const {
    currentItem: savedItem,
    error: apiError,
    pageState,
    loading,
    handleSaveItem,
    resetUI,
  } = useItem();

  // Keeps track of the URL that was typed, mainly to prefill the bar again on an 'Error'
  const [submittedUrl, setSubmittedUrl] = useState("");

  const handleSave = (url, title) => {
    setSubmittedUrl(url);
    handleSaveItem({ url, title });
  };

  return (
    <div
      className="min-h-screen bg-[#000000] flex items-center justify-center px-6"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="w-full" style={{ maxWidth: "480px" }}>
        
        {/* ── IDLE / DEFAULT STATE ── */}
        {pageState === "idle" && (
          <>
            <InputBlock
              labelText="SAVE"
              onSubmitData={handleSave}
              isLoading={loading}
            />
            <p
              className="mt-4 text-[#333333] text-center uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              supports webpages, pdfs, youtube, twitter
            </p>
          </>
        )}

        {/* ── DONE STATE (Success) ── */}
        {pageState === "done" && (
          <>
            <p
              className="text-[#666666] mb-3 uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              SAVED
            </p>

            {savedItem && (
              <>
                <p
                  className="text-white mb-4 line-clamp-1"
                  style={{ fontSize: "14px", letterSpacing: "0.01em" }}
                >
                  {savedItem.title || savedItem.content?.title || submittedUrl}
                </p>
                {savedItem._id && (
                  <Link
                    to={`/items/${savedItem._id}`}
                    className="text-[#666666] hover:text-white transition-colors duration-150 uppercase"
                    style={{ fontSize: "11px", letterSpacing: "0.08em" }}
                  >
                    view item →
                  </Link>
                )}
              </>
            )}

            {/* Render a fresh form to immediately save another context */}
            <div className="mt-12 pt-8 border-t border-[#1a1a1a]">
              <InputBlock
                labelText="SAVE ANOTHER"
                isLoading={loading}
                onSubmitData={(url, title) => {
                  resetUI();
                  handleSave(url, title);
                }}
              />
            </div>
          </>
        )}

        {/* ── ERROR STATE (Failure) ── */}
        {pageState === "error" && (
          <>
            <p
              className="text-[#ff3333] mb-8 uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.08em" }}
            >
              {apiError || "failed to save — try again"}
            </p>
            {/* Repopulate the input field so the user doesn't lose their URL */}
            <InputBlock
              prefillUrl={submittedUrl}
              onSubmitData={handleSave}
              isLoading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SavePage;
