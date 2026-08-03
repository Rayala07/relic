import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * The product's whole premise in one frame: you describe a half-remembered
 * thing, and the archive returns it ranked by meaning. Everything here is a
 * mock — it never touches the API — so it stays instant on first paint.
 */
const DEMOS = [
  {
    query: "that thing about vector databases",
    results: [
      { title: "Pinecone vs. pgvector — a practical benchmark", type: "ARTICLE", age: "3 WEEKS AGO", score: 0.94 },
      { title: "Retrieval-augmented generation, end to end", type: "YOUTUBE", age: "2 MONTHS AGO", score: 0.88 },
      { title: "Embeddings explained from first principles", type: "PDF", age: "5 MONTHS AGO", score: 0.79 },
    ],
  },
  {
    query: "the essay about doing fewer things",
    results: [
      { title: "Slow productivity and the myth of busyness", type: "ARTICLE", age: "6 DAYS AGO", score: 0.92 },
      { title: "On attention as a finite resource", type: "ARTICLE", age: "1 MONTH AGO", score: 0.85 },
      { title: "Deep work — annotated notes", type: "PDF", age: "8 MONTHS AGO", score: 0.74 },
    ],
  },
  {
    query: "someone's thread on pricing a side project",
    results: [
      { title: "How I priced my first paid product", type: "TWEET", age: "2 WEEKS AGO", score: 0.90 },
      { title: "Pricing psychology for small SaaS", type: "ARTICLE", age: "4 MONTHS AGO", score: 0.83 },
      { title: "Indie revenue teardown", type: "YOUTUBE", age: "7 MONTHS AGO", score: 0.71 },
    ],
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const HeroSearchDemo = () => {
  // Read once at mount rather than in an effect: reduced-motion users get the
  // finished state on first paint instead of a blank frame that fills in.
  const [reduced] = useState(prefersReducedMotion);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? DEMOS[0].query : ""));
  const [revealed, setRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    let cursor = 0;

    const run = async () => {
      while (!cancelled) {
        const { query } = DEMOS[cursor % DEMOS.length];

        for (let i = 1; i <= query.length; i++) {
          if (cancelled) return;
          setTyped(query.slice(0, i));
          // Uneven cadence reads as a person typing rather than a ticker
          await sleep(34 + Math.random() * 46);
        }

        if (cancelled) return;
        await sleep(260);
        if (cancelled) return;
        setRevealed(true);

        await sleep(4200);
        if (cancelled) return;
        setRevealed(false);
        await sleep(420);

        for (let i = query.length; i >= 0; i--) {
          if (cancelled) return;
          setTyped(query.slice(0, i));
          await sleep(16);
        }

        cursor += 1;
        if (cancelled) return;
        setIndex(cursor % DEMOS.length);
        await sleep(320);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  const demo = DEMOS[index];

  return (
    <div className="w-full border border-border bg-background/80 backdrop-blur-sm text-left">
      {/* Query bar */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
        <span className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase shrink-0 hidden sm:block">
          Ask
        </span>
        <div className="flex-1 min-w-0 text-foreground text-[13px] sm:text-[15px] truncate">
          {typed}
          <span className="caret ml-0.5" />
        </div>
        <kbd className="shrink-0 border border-border text-muted-foreground text-[10px] tracking-[0.1em] px-2 py-1 hidden sm:block">
          ⌘K
        </kbd>
      </div>

      {/* Result ledger — fixed height so the hero never reflows mid-loop */}
      <div className="relative" style={{ minHeight: "228px" }}>
        <AnimatePresence mode="wait">
          {revealed && (
            <motion.ul
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="list-none m-0 p-0"
            >
              {demo.results.map((result, i) => (
                <motion.li
                  key={result.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-border/60 last:border-b-0"
                >
                  <span className="text-muted-foreground text-[10px] tabular-nums shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-[13px] leading-snug truncate">{result.title}</p>
                    <p className="text-muted-foreground text-[10px] tracking-[0.1em] uppercase mt-1.5">
                      {result.type} · {result.age}
                    </p>
                  </div>

                  {/* Match strength, drawn rather than stated */}
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="w-10 sm:w-16 h-px bg-border relative">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-foreground"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score * 100}%` }}
                        transition={{ duration: 0.7, delay: 0.2 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: "1px" }}
                      />
                    </div>
                    <span className="text-muted-foreground text-[10px] tabular-nums w-8 text-right">
                      {result.score.toFixed(2)}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">
              Searching by meaning
            </span>
          </div>
        )}
      </div>

      {/* Footnote rail */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border">
        <span className="text-muted-foreground text-[10px] tracking-[0.12em] uppercase">
          Vector match · not keywords
        </span>
        <span className="text-muted-foreground text-[10px] tracking-[0.12em] uppercase tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(DEMOS.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

export default HeroSearchDemo;
