import React from "react";

// Icons · Brand · Primary mark — trevo de três círculos em ciano
export default function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="#22D3EE" stroke="#0A1224" strokeWidth="3">
        <circle cx="32" cy="20" r="8.5" />
        <circle cx="24.5" cy="30" r="8.5" />
        <circle cx="39.5" cy="30" r="8.5" />
      </g>
      <path d="M32 37 V44" stroke="#22D3EE" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="48.5" r="4.5" fill="none" stroke="#22D3EE" strokeWidth="3.5" />
    </svg>
  );
}