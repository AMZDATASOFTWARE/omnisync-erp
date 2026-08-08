import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { brl } from "@/lib/format";

export default function SalesChart({ sales }) {
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    const total = sales
      .filter((s) => s.status !== "cancelada" && new Date(s.created_date).toDateString() === key)
      .reduce((a, s) => a + (s.total || 0), 0);
    return { day: d.toLocaleDateString("pt-BR", { weekday: "short" }), total };
  });

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={days}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => brl(v)} />
          <Tooltip formatter={(v) => brl(v)} />
          <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}