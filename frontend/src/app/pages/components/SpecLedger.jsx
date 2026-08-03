import React from "react";
import { motion } from "motion/react";

// The actual stack behind the product — specifics do more for credibility here
// than another round of adjectives.
const SPECS = [
  { key: "Retrieval", value: "Pinecone vector index, MistralAI embeddings" },
  { key: "Extraction", value: "Mozilla Readability, PDF parsing, YouTube transcripts" },
  { key: "Reasoning", value: "LangChain orchestration, Google Generative AI, Groq" },
  { key: "Capture", value: "Chrome extension, Manifest V3" },
  { key: "Service", value: "Node.js, Express, MongoDB, Redis" },
  { key: "Interface", value: "React 19, Vite, Tailwind CSS, Motion, D3" },
];

const SpecLedger = () => (
  <dl className="w-full max-w-[1200px] mx-auto m-0 border-t border-border">
    {SPECS.map((spec, i) => (
      <motion.div
        key={spec.key}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="group grid grid-cols-[auto_1fr] md:grid-cols-[56px_180px_1fr] items-baseline gap-x-5 gap-y-2 py-5 border-b border-border transition-colors duration-200 hover:bg-muted/40"
      >
        <span className="text-muted-foreground text-[10px] tabular-nums tracking-[0.1em] group-hover:text-foreground transition-colors duration-200">
          {String(i + 1).padStart(2, "0")}
        </span>
        <dt className="text-foreground text-[11px] tracking-[0.16em] uppercase font-semibold">
          {spec.key}
        </dt>
        <dd className="col-span-2 md:col-span-1 m-0 text-muted-foreground text-[14px] leading-relaxed">
          {spec.value}
        </dd>
      </motion.div>
    ))}
  </dl>
);

export default SpecLedger;
