import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, inView, stagger } from "motion";
import { useUser } from "../../features/auth/components/AuthProvider";
import FluidAccordion from "./components/FluidAccordion";
import FeatureCardStack from "./components/FeatureCardStack";

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

    // 3. WHAT YOU GET ANIMATION (Handled by FeatureCardStack directly)

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
            className="text-foreground flex flex-col items-center mb-10" 
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
            className="mb-18" 
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
          className="text-muted-foreground uppercase mb-12 text-center" 
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          HOW IT WORKS
        </h2>

        <FluidAccordion />
      </section>

      {/* ======================= */}
      {/* SECTION 3: WHAT YOU GET */}
      {/* ======================= */}
      <section id="features" className="w-full px-6 flex flex-col border-t border-border py-32 relative">
        <h2 
          className="text-muted-foreground uppercase mb-12 text-center" 
          style={{ fontSize: "11px", letterSpacing: "0.08em" }}
        >
          WHAT YOU GET
        </h2>

        <FeatureCardStack />
      </section>

      {/* ======================= */}
      {/* SECTION 4: CLOSING CTA (Chrome Extension) */}
      {/* ======================= */}
      <section id="chrome-extension" className="w-full px-6 flex flex-col border-t border-border py-32 relative">
        <div ref={closingRef} className="flex flex-col items-center text-center w-full mx-auto" style={{ maxWidth: "600px" }}>
          
          <h2 className="text-foreground flex flex-col items-center mb-6" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            <span className="block closing-line" style={{ opacity: 0 }}>Never break your focus.</span>
          </h2>

          <p 
            className="text-muted-foreground mb-12 closing-line" 
            style={{ opacity: 0, fontSize: "16px", lineHeight: 1.6 }}
          >
            Save any article, video, or research paper instantly with the Relic Chrome Extension. Keep your flow state, you don't even have to leave the tab.
          </p>

          <div className="flex flex-col items-center gap-4 closing-btn" style={{ opacity: 0 }}>
            <button 
              type="button"
              onClick={() => alert("Extension download link goes here!")}
              className="flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 uppercase shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer border-0"
              style={{ fontSize: "12px", letterSpacing: "0.1em", padding: "16px 32px", fontWeight: 600, borderRadius: "8px" }}
            >
              GET CHROME EXTENSION
            </button>
            <p className="text-muted-foreground uppercase" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
              1 click install • Native integration
            </p>
          </div>
        </div>
      </section>

      {/* ======================= */}
      {/* FOOTER                  */}
      {/* ======================= */}
      <footer className="w-full px-6 flex flex-col border-t border-border py-20 bg-background">
        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col md:col-span-1">
            <span className="text-foreground font-bold tracking-widest text-lg mb-4">RELIC</span>
            <span className="text-muted-foreground" style={{ fontSize: "13px", letterSpacing: "0.02em" }}>
              [ MADE TO REMEMBER ]
            </span>
          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-5">
            <h4 className="text-foreground font-semibold uppercase tracking-widest mb-2" style={{ fontSize: "11px" }}>Product</h4>
            <a 
              href="#chrome-extension" 
              onClick={(e) => { e.preventDefault(); document.getElementById('chrome-extension')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-muted-foreground hover:text-foreground transition-colors text-[13px] w-fit"
            >
              Chrome Extension
            </a>
            <a 
              href="#features" 
              onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-muted-foreground hover:text-foreground transition-colors text-[13px] w-fit"
            >
              Features
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-foreground font-semibold uppercase tracking-widest mb-2" style={{ fontSize: "11px" }}>Contact</h4>
            <a href="mailto:developer.rayala@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors text-[13px]">developer.rayala@gmail.com</a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50">
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
            © {new Date().getFullYear()} Relic. All rights reserved.
          </span>
          <div className="flex items-center gap-8 mt-6 md:mt-0 uppercase tracking-widest">
             <a href="https://github.com/Rayala07/relic" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: "10px" }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
