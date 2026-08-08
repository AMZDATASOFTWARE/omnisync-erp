import React from "react";

const tones = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export default function StatCard({ icon: Icon, label, value, tone = "emerald" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${tones[tone]}`}>
        <Icon className="w-4.5 h-4.5 w-5 h-5" />
      </div>
      <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}