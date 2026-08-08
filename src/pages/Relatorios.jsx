import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import DREPanel from "@/components/relatorios/DREPanel";
import ABCTable from "@/components/relatorios/ABCTable";
import ZoneTurnover from "@/components/relatorios/ZoneTurnover";
import { abcCurve, turnoverByZone, dre, inPeriod } from "@/lib/reports";

const PERIODS = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
];

export default function Relatorios() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    Promise.all([
      base44.entities.Sale.list("-created_date", 1000),
      base44.entities.Product.list("name", 1000),
      base44.entities.FinancialEntry.list("-created_date", 500),
      base44.entities.StoreMap.list("", 1),
    ]).then(([sales, products, entries, maps]) =>
      setData({ sales, products, entries, zones: maps[0]?.zones || [] })
    );
  }, []);

  const report = useMemo(() => {
    if (!data) return null;
    const sales = data.sales.filter((s) => s.status !== "cancelada" && inPeriod(s, days));
    const entries = data.entries.filter((e) => inPeriod(e, days));
    return {
      dre: dre(sales, data.products, entries),
      abc: abcCurve(sales, data.products),
      zones: turnoverByZone(sales, data.products, data.zones),
    };
  }, [data, days]);

  if (!report) return <div className="p-8 text-sm text-muted-foreground">Calculando relatórios…</div>;

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">DRE gerencial, curva ABC de produtos e giro por zona da loja.</p>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <Button key={p.days} size="sm" variant={days === p.days ? "default" : "outline"} onClick={() => setDays(p.days)}>
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <DREPanel data={report.dre} />
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Giro por zona</p>
            <ZoneTurnover rows={report.zones} />
          </div>
        </div>
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Curva ABC — faturamento</p>
          <ABCTable rows={report.abc} />
        </div>
      </div>
    </div>
  );
}