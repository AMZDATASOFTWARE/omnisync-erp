import React from "react";

// Cards · Feature Card — Default (.brand-card / .fc-icon em src/index.css)
export default function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="brand-card h-full">
      <div className="fc-icon"><Icon className="w-5 h-5" strokeWidth={2} /></div>
      <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs mt-1" style={{ color: "rgba(242,246,248,.65)" }}>{label}</p>
    </div>
  );
}