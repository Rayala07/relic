import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, inView, stagger } from "motion";
import { useUser } from "@clerk/clerk-react";

const HomePage = () => {
  const { user, isLoaded } = useUser();
  // Hero Refs
  const labelRef = useRef(null);
  const headline1Ref = useRef(null);
  const headline2Ref = useRef(null);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);

  // Section Refs (for inView mapping)
  const stepsRef = useRef(null);
  const featuresRef = useRef(null);
  const closingRef = useRef(null);

  useEffect(() => {
    // 1. HERO ANIMATION (Immediate)
    // Easing curve mimicking gentle fluid settling
    const ease = [0.25, 0.1, 0.25, 1];

    if (labelRef.current) {
      animate(labelRef.current, { opacity: [0, 0.15], scale: [0.95, 1] }, { duration: 1.5, ease });
    }
    if (headline1Ref.current) {
      animate(headline1Ref.current, { opacity: [0, 1], y: [24, 0] }, { duration: 1.0, delay: 0.1, ease });
    }
    if (headline2Ref.current) {
      animate(headline2Ref.current, { opacity: [0, 1], y: [24, 0] }, { duration: 1.0, delay: 0.2, ease });
    }
    if (subtextRef.current) {
      animate(subtextRef.current, { opacity: [0, 0.50], y: [16, 0] }, { duration: 0.8, delay: 0.4, ease });
    }
    if (ctaRef.current) {
      animate(ctaRef.current, { opacity: [0, 1], y: [16, 0] }, { duration: 0.8, delay: 0.5, ease });
    }

    // 2. HOW IT WORKS ANIMATION (Scroll)
    if (stepsRef.current) {
      inView(stepsRef.current, () => {
        animate(
          ".step-item",
          { opacity: [0, 1], y: [24, 0] },
          { duration: 0.8, delay: stagger(0.12), ease }
        );
      });
    }

    // 3. WHAT YOU GET ANIMATION (Scroll)
    if (featuresRef.current) {
      inView(featuresRef.current, () => {
        animate(
          ".feature-item",
          { opacity: [0, 1], y: [16, 0] },
          { duration: 0.6, delay: stagger(0.08), ease }
        );
      });
    }

    // 4. CLOSING ANIMATION (Scroll)
    if (closingRef.current) {
      inView(closingRef.current, () => {
        animate(
          ".closing-line",
          { opacity: [0, 1], y: [24, 0] },
          { duration: 1.0, delay: stagger(0.1), ease }
        );
        animate(
          ".closing-btn",
          { opacity: [0, 1], y: [16, 0] },
          { duration: 0.8, delay: 0.4, ease }
        );
      });
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* ======================= */}
      {/* SECTION 1: HERO CONTAINER */}
      {/* ======================= */}
      <section 
        className="w-full relative overflow-hidden flex items-center justify-center px-6"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >
        {/* Background massive RELIC text - Gradient Fade style */}
        <div 
          ref={labelRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading font-bold select-none pointer-events-none bg-clip-text text-transparent"
          style={{ 
            fontSize: "clamp(120px, 28vw, 400px)", 
            letterSpacing: "0.02em",
            lineHeight: 1,
            backgroundImage: "linear-gradient(180deg, var(--foreground) 0%, var(--foreground) 30%, transparent 100%)",
            opacity: 0, 
            zIndex: 0 
          }}
        >
          RELIC
        </div>

        {/* Foreground Content Flow */}
        <div className="flex flex-col items-center text-center w-full relative z-10" style={{ maxWidth: "800px", marginTop: "-5vh" }}>
          
          <h1 
            className="text-foreground flex flex-col items-center mb-8" 
            style={{ 
              fontSize: "clamp(48px, 8vw, 84px)", 
              fontWeight: 600, 
              letterSpacing: "-0.02em", 
              lineHeight: 1.1 
            }}
          >
            <span ref={headline1Ref} className="block" style={{ opacity: 0 }}>Save the Web</span>
            <span ref={headline2Ref} className="block" style={{ opacity: 0 }}>Find it Instantly</span>
          </h1>

          <p 
            ref={subtextRef} 
            className="mb-14 italic" 
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: "var(--foreground)",
              opacity: 0.50,
              fontSize: "clamp(16px, 2vw, 22px)", 
              letterSpacing: "0.02em"
            }}
          >
            Save anything from the Web and Find it with a Thought !
          </p>

          <div ref={ctaRef} className="flex flex-col items-center gap-6" style={{ opacity: 0 }}>
            <Link 
              to="/save"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 uppercase inline-block shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ fontSize: "12px", letterSpacing: "0.1em", padding: "18px 40px", fontWeight: 600, borderRadius: 0, textDecoration: "none" }}
            >
              START SAVING
            </Link>
            <Link 
              to="/library"
              className="text-muted-foreground hover:text-foreground transition-colors duration-150 uppercase"
              style={{ fontSize: "12px", letterSpacing: "0.08em" }}
            >
              VIEW LIBRARY →
            </Link>
          </div>

        </div>
      </section>

      {/* ======================= */}
      {/* SECTION 2: HOW IT WORKS */}
      {/* ======================= */}
      <section className="w-full px-6 flex flex-col border-t border-border py-32 relative">
        <h2 
          className="text-muted-foreground uppercase mb-12" 
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          HOW IT WORKS
        </h2>

        <div ref={stepsRef} className="flex flex-col lg:flex-row w-full gap-12 lg:gap-8">
          {/* STEP 1 */}
          <div className="flex-1 flex flex-col gap-4 step-item" style={{ opacity: 0 }}>
            <span className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>01</span>
            <h3 className="text-foreground" style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 500 }}>SAVE</h3>
            <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "14px", letterSpacing: "0.01em" }}>
              Paste any URL — article, PDF, YouTube, or tweet. RELIC extracts the content.
            </p>
          </div>
          {/* STEP 2 */}
          <div className="flex-1 flex flex-col gap-4 step-item" style={{ opacity: 0 }}>
            <span className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>02</span>
            <h3 className="text-foreground" style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 500 }}>UNDERSTAND</h3>
            <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "14px", letterSpacing: "0.01em" }}>
              AI reads it, tags it, and summarizes it. Automatically. No effort from you.
            </p>
          </div>
          {/* STEP 3 */}
          <div className="flex-1 flex flex-col gap-4 step-item" style={{ opacity: 0 }}>
            <span className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>03</span>
            <h3 className="text-foreground" style={{ fontSize: "14px", letterSpacing: "0.01em", fontWeight: 500 }}>FIND</h3>
            <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "14px", letterSpacing: "0.01em" }}>
              Search with any thought. RELIC finds what you saved even if you forget the words.
            </p>
          </div>
        </div>
      </section>

      {/* ======================= */}
      {/* SECTION 3: WHAT YOU GET */}
      {/* ======================= */}
      <section className="w-full px-6 flex flex-col border-t border-border py-32 relative">
        <h2 
          className="text-muted-foreground uppercase mb-12" 
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          WHAT YOU GET
        </h2>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-6 w-full">
          {[
            { tag: "SEMANTIC SEARCH", text: "Find anything you saved with natural language — not just keywords." },
            { tag: "AI SUMMARIES", text: "Every saved item is summarized automatically. No reading required to remember." },
            { tag: "AUTO TAGGING", text: "Topics are detected and tagged the moment you save. Zero manual effort." },
            { tag: "SMART COLLECTIONS", text: "Your saves are grouped into collections automatically as you add more." },
            { tag: "MEMORY RESURFACING", text: "Items you saved weeks ago come back when they are worth revisiting." },
            { tag: "RELATED ITEMS", text: "Every saved item shows you what else in your library connects to it semantically." },
          ].map((feat, idx) => (
            <div key={idx} className="flex flex-col gap-2 feature-item" style={{ opacity: 0 }}>
              <h3 className="text-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em", fontWeight: 500 }}>
                {feat.tag}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: "14px", letterSpacing: "0.01em" }}>
                {feat.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= */}
      {/* SECTION 4: CLOSING CTA */}
      {/* ======================= */}
      <section className="w-full px-6 flex flex-col border-t border-border py-32 relative">
        <div ref={closingRef} className="flex flex-col items-center text-center w-full mx-auto" style={{ maxWidth: "600px" }}>
          
          <h2 className="text-foreground flex flex-col items-center mb-10" style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1.6 }}>
            <span className="block closing-line" style={{ opacity: 0 }}>Your saved internet.</span>
            <span className="block closing-line" style={{ opacity: 0 }}>Organized and searchable.</span>
          </h2>

          <div className="flex flex-col items-center gap-4 closing-btn" style={{ opacity: 0 }}>
            <Link 
              to="/save"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150 uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.08em", padding: "14px 28px", fontWeight: 500, borderRadius: 0, textDecoration: "none" }}
            >
              SAVE YOUR FIRST ITEM
            </Link>
            <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              takes less than a minute
            </p>
          </div>
        </div>
      </section>

      {/* ======================= */}
      {/* FOOTER                  */}
      {/* ======================= */}
      <footer className="w-full px-6 flex border-t border-border py-12 items-center justify-between">
        <div className="w-full flex items-center justify-between text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
          <span>RELIC</span>
          <span>— MADE TO REMEMBER</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
