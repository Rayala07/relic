import React from "react";
import { motion } from "motion/react";

const steps = [
  {
    num: "01",
    stage: "[ STAGE_01 ]",
    title: "// SAVE_LINK",
    desc: "> INITIATING DATA CAPTURE...\n> Paste any URL — article, PDF, YouTube, or tweet. RELIC bypasses noise and extracts pure semantic content.",
    visual: (
      <div className="flex flex-col gap-2 p-4 border border-border/50 bg-background/50 rounded-none mt-8 w-full group-hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground group-hover:text-primary transition-colors text-[10px] font-mono uppercase tracking-widest">Sys_Status</span>
          <span className="text-primary text-[10px] font-mono animate-pulse">[ ACTIVE ]</span>
        </div>
        <div className="w-full bg-border/30 h-1 mt-2">
          <div className="bg-primary h-1 w-[85%] group-hover:w-full transition-all duration-1000" />
        </div>
        <span className="text-muted-foreground text-[10px] font-mono mt-1"> Parsing Content...</span>
      </div>
    )
  },
  {
    num: "02",
    stage: "[ STAGE_02 ]",
    title: "// INITIALIZE_RELIC",
    desc: "> RUNNING CONTENT ANALYSIS...\n> AI autonomously reads, categorizes, and synthesizes the payload. Zero manual classification required.",
    visual: (
      <div className="flex flex-wrap gap-2 mt-8">
        {["ai_core", "local_agents", "automation", "frameworks"].map((tag, i) => (
          <span key={i} className="px-2 py-1 text-[10px] font-mono border border-border/50 text-muted-foreground uppercase bg-background/50 rounded-none group-hover:border-primary/40 group-hover:text-primary group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-300">
            {tag}
          </span>
        ))}
      </div>
    )
  },
  {
    num: "03",
    stage: "[ STAGE_03 ]",
    title: "// DISCOVER_AT_YOUR_EASE",
    desc: "> QUERYING MEMORY BANKS...\n> Search with unstructured thoughts. RELIC maps natural language to exact vector matches.",
    visual: (
      <div className="flex flex-col gap-2 mt-8 w-full">
        <div className="w-full h-8 border border-border/50 bg-background/50 flex items-center px-3 rounded-none group-hover:border-primary/40 transition-colors">
          <span className="text-muted-foreground text-[10px] font-mono"> "that ai agent framework"</span>
        </div>
        <div className="w-full h-10 border border-primary/20 bg-primary/10 flex items-center px-3 gap-3 overflow-hidden rounded-none group-hover:border-primary/50 group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300">
          <span className="text-primary text-[10px] uppercase tracking-widest whitespace-nowrap font-mono">[MATCH] LangChain Local Agents</span>
        </div>
      </div>
    )
  }
];

const ProcessCards = () => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            opacity: { duration: 0.6, delay: (2 - idx) * 0.15 },
            x: { duration: 0.6, delay: (2 - idx) * 0.15, type: "spring" }
          }}
          className="relative flex flex-col p-[1px] rounded-none overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
          style={{ minHeight: "420px" }}
        >
          {/* Default Border (Highly Visible) */}
          <div className="absolute inset-0 bg-border/60 rounded-none transition-colors group-hover:bg-border/80" />

          {/* Hover Border Strike (Spinning Conic Gradient) */}
          <div className="absolute inset-0 overflow-hidden rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div
              className="absolute -inset-[100%] animate-spin"
              style={{
                animationDuration: "4s",
                backgroundImage: "conic-gradient(from 90deg at 50% 50%, transparent 70%, hsl(var(--primary)))"
              }}
            />
          </div>

          {/* Inner Content Card */}
          <div className="relative h-full w-full bg-card rounded-none p-8 flex flex-col justify-between overflow-hidden">

            {/* Top Content */}
            <div className="relative z-10 flex flex-col">
              <span className="text-primary/70 font-mono text-[10px] tracking-widest mb-2">{step.stage}</span>
              <h3 className="text-foreground uppercase tracking-widest mb-4 font-mono" style={{ fontSize: "14px", fontWeight: 600 }}>
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed font-mono whitespace-pre-line" style={{ fontSize: "12px", letterSpacing: "0.02em" }}>
                {step.desc}
              </p>
              {step.visual}
            </div>

            {/* Bottom Watermark */}
            <div className="absolute -bottom-8 -right-4 pointer-events-none select-none z-0">
              <span className="text-[180px] leading-none font-heading font-bold text-foreground/[0.03] group-hover:text-primary/5 transition-colors duration-500">
                {step.num}
              </span>
            </div>

          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProcessCards;
