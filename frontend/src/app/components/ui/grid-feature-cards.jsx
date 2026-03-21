"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ── Deterministic pattern per card index ───────────────── */
function genPattern(seed) {
  const results = [];
  let s = seed + 1;
  for (let i = 0; i < 5; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const x = (Math.abs(s) % 4) + 7;
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const y = (Math.abs(s) % 6) + 1;
    results.push([x, y]);
  }
  return results;
}

/* ── SVG grid pattern ───────────────────────────────────── */
function GridPattern({ width, height, x, y, squares, className, style }) {
  const patternId = React.useId();

  return (
    <svg aria-hidden="true" className={className} style={style}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], idx) => (
            <rect
              key={idx}
              strokeWidth="0"
              width={width + 1}
              height={height + 1}
              x={sx * width}
              y={sy * height}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

/* ── Feature card ───────────────────────────────────────── */
export function FeatureCard({ feature, index = 0, className, style, ...props }) {
  const pattern = genPattern(index);

  return (
    <div
      className={cn("relative overflow-hidden p-6 transition-colors duration-300", className)}
      style={{ backgroundColor: "#0a1628", ...style }}
      {...props}
    >
      {/* Subtle animated grid overlay */}
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(37,99,235,0.04), rgba(37,99,235,0.01))",
            maskImage: "radial-gradient(farthest-side at top, white, transparent)",
          }}
        >
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={pattern}
            className="absolute inset-0 h-full w-full mix-blend-overlay"
            style={{
              fill: "rgba(37,99,235,0.06)",
              stroke: "rgba(37,99,235,0.15)",
            }}
          />
        </div>
      </div>

      {/* Top-left corner bracket */}
      <div
        className="pointer-events-none absolute top-0 left-0"
        style={{
          width: 16,
          height: 16,
          borderTop: "1px solid rgba(37,99,235,0.5)",
          borderLeft: "1px solid rgba(37,99,235,0.5)",
        }}
      />

      {/* Icon */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: "rgba(37,99,235,0.1)",
          border: "1px solid rgba(37,99,235,0.25)",
          color: "#60a5fa",
        }}
      >
        <feature.icon width={18} height={18} strokeWidth={1.5} aria-hidden />
      </div>

      <h3
        className="mt-8 text-sm font-semibold md:text-base"
        style={{ fontFamily: "'Syne', sans-serif", color: "#ffffff" }}
      >
        {feature.title}
      </h3>
      <p
        className="mt-2 text-xs leading-relaxed"
        style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}
      >
        {feature.description}
      </p>
    </div>
  );
}
