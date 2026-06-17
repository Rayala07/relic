import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const features = [
  { 
    tag: "SEMANTIC SEARCH", 
    text: "Find anything you saved with natural language - not just keywords. Describe what you're looking for, and our AI will instantly retrieve the exact concept.",
    colSpan: "md:col-span-2",
    color: "rgba(168, 85, 247, 0.15)" // Purple glow
  },
  { 
    tag: "AI SUMMARIES", 
    text: "Every saved item is summarized automatically. No reading required to remember.",
    colSpan: "md:col-span-1",
    color: "rgba(16, 185, 129, 0.15)" // Emerald glow
  },
  { 
    tag: "AUTO TAGGING", 
    text: "Topics are detected and tagged the moment you save. Zero manual effort.",
    colSpan: "md:col-span-1",
    color: "rgba(59, 130, 246, 0.15)" // Blue glow
  },
  { 
    tag: "SMART COLLECTIONS", 
    text: "Your saves are grouped into dynamic collections automatically as you add more to your library.",
    colSpan: "md:col-span-1",
    color: "rgba(249, 115, 22, 0.15)" // Orange glow
  },
  { 
    tag: "MEMORY RESURFACING", 
    text: "Items you saved weeks ago organically come back to your feed when they are worth revisiting.",
    colSpan: "md:col-span-1",
    color: "rgba(236, 72, 153, 0.15)" // Pink glow
  },
  { 
    tag: "RELATED ITEMS", 
    text: "Explore your second brain visually. Every saved item shows you what else in your library connects to it semantically, uncovering hidden patterns in your knowledge.",
    colSpan: "md:col-span-2 lg:col-span-3", // Full width bottom hero
    color: "rgba(99, 102, 241, 0.15)" // Indigo glow
  },
];

export default function FeatureCardStack() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-[1200px] mx-auto py-12">
      {features.map((feat, idx) => (
        <FeatureCard key={idx} feat={feat} idx={idx} />
      ))}
    </div>
  );
}

function FeatureCard({ feat, idx }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle mouse move for the spotlight effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-3xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-[#050505] overflow-hidden cursor-pointer group flex flex-col justify-center items-center text-center ${feat.colSpan}`}
      style={{ minHeight: "320px" }}
    >
      {/* 1. Mouse Spotlight Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${feat.color}, transparent 40%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* 2. Glassmorphic Noise Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />

      {/* 3. Base Subtle Gradient (always visible) */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-black/5 to-transparent dark:from-black/80" />

      {/* Content Container */}
      <div className="relative z-10 p-8 flex flex-col items-center justify-center w-full max-w-lg">
        
        <motion.h3 
          layout
          className="text-foreground font-semibold tracking-widest text-lg uppercase"
          animate={{ y: isHovered ? -10 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {feat.tag}
        </motion.h3>
          
        <div className="overflow-hidden">
          <AnimatePresence mode="popLayout">
            {isHovered && (
              <motion.p 
                layout
                initial={{ opacity: 0, height: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-muted-foreground text-sm leading-relaxed pt-3"
              >
                {feat.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
