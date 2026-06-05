import React from "react";
import { Skeleton } from "./skeleton";

const SkeletonCard = () => {
  return (
    <div 
      className="block w-full border border-border p-5 flex flex-col gap-4"
      style={{ borderRadius: 0, minHeight: "140px" }}
    >
      {/* 1. TYPE INDICATOR + DATE ROW */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16 bg-secondary" style={{ borderRadius: 0 }} />
        <Skeleton className="h-3 w-12 bg-secondary" style={{ borderRadius: 0 }} />
      </div>

      {/* 2. TITLE */}
      <Skeleton className="h-4 w-3/4 bg-secondary mt-1" style={{ borderRadius: 0 }} />

      {/* 3. SUMMARY (2 lines) */}
      <div className="flex flex-col gap-2 mt-1">
        <Skeleton className="h-3 w-full bg-secondary" style={{ borderRadius: 0 }} />
        <Skeleton className="h-3 w-5/6 bg-secondary" style={{ borderRadius: 0 }} />
      </div>

      {/* 4. TAGS ROW */}
      <div className="flex gap-2 mt-auto pt-2">
        <Skeleton className="h-[20px] w-12 bg-secondary" style={{ borderRadius: 0 }} />
        <Skeleton className="h-[20px] w-16 bg-secondary" style={{ borderRadius: 0 }} />
      </div>
    </div>
  );
};

export default SkeletonCard;
