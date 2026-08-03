import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { isBackendWaking, onBackendWaking } from "../../features/items/services/item.service";

const CONNECTED_DISPLAY_MS = 1800;

/**
 * Explains a cold start instead of leaving a first-time visitor staring at a
 * skeleton that looks stuck.
 *
 * The API host sleeps after 15 minutes of inactivity and takes ~50s to wake.
 * item.service already retries through that; this only surfaces *why* the wait
 * is happening, which reads as a deliberate free-tier trade-off rather than a
 * broken app. Recovery is acknowledged briefly so the notice resolves visibly
 * instead of just disappearing.
 */
const BackendWakingNotice = () => {
  const [phase, setPhase] = useState(() => (isBackendWaking() ? "waking" : "idle"));

  // Tracks whether the visitor actually saw the wait, so "connected" is only
  // shown as a resolution to something — never on its own.
  const sawWaitRef = useRef(false);

  useEffect(() => {
    let hideTimer;

    const unsubscribe = onBackendWaking((waking) => {
      clearTimeout(hideTimer);

      if (waking) {
        sawWaitRef.current = true;
        setPhase("waking");
        return;
      }

      if (!sawWaitRef.current) return;
      sawWaitRef.current = false;
      setPhase("connected");
      hideTimer = setTimeout(() => setPhase("idle"), CONNECTED_DISPLAY_MS);
    });

    return () => {
      unsubscribe();
      clearTimeout(hideTimer);
    };
  }, []);

  const isWaking = phase === "waking";

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-3 border border-border bg-background px-4 py-3"
          style={{ borderRadius: 0 }}
        >
          {/* Pulses while waiting, settles to a solid dot once connected */}
          <span className="relative flex h-[6px] w-[6px] shrink-0">
            {isWaking && (
              <span className="absolute inline-flex h-full w-full animate-ping bg-muted-foreground opacity-60" />
            )}
            <span
              className={`relative inline-flex h-[6px] w-[6px] ${
                isWaking ? "bg-muted-foreground" : "bg-foreground"
              }`}
            />
          </span>

          <span
            className={isWaking ? "text-muted-foreground uppercase" : "text-foreground uppercase"}
            style={{ fontSize: "11px", letterSpacing: "0.08em" }}
          >
            {isWaking ? "WAKING UP THE SERVER — FIRST LOAD TAKES A MOMENT" : "CONNECTED"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackendWakingNotice;
