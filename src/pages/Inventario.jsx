import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import CountSheet from "@/components/inventario/CountSheet";
import CountHistory from "@/components/inventario/CountHistory";
import { withStore, ofStore } from "@/lib/scope";
import { useOperator } from "@/hooks/use-operator";

export default function Inventario() {
  const [map, setMap] = useState(null);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [zoneId, setZoneId] = useState("");
  const [counts, setCounts] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { label: operatorName } = useOperator();

  useEffect(() => {
    Promise.all([
      base44.entities.StoreMap.list("", 20),
      base44.entities.Product.list("name", 500),
      base44.entities.InventoryCount.list("-created_date", 50),
    ]).then(([m, p, h]) => {
      setMap(ofStore(m)[0] || null);
      setProducts(ofStore(p));
      setHistory(ofStore(h).slice(0, 20));
      setLoading(false);
    });
  }, []);

  const zones = map?.zones || [];
  const zone = zones.find((z) => z.id === zoneId);
  const items = products.filter((p) => (p.zone_id || p.map_zone_id) === zoneId && p.active !== false);

  const finish = async () => {
    setSaving(true);
    const rows = items
      .filter((p) => counts[p.id] !== undefined && counts[p.id] !== "")
      .map((p) => {
        const counted = Number(counts[p.id]);
        return {
          product_id: p.id, product_name: p.name, sku: p.sku || "",
          shelf_label: p.shelf_identifier || "",
          expected: p.stock_quantity || 0, counted, diff: counted - (p.stock_quantity || 0),
        };
      });

    const divergent = rows.filter((r) => r.diff !== 0);
    const record = await base44.entities.InventoryCount.create(withStore({
      zone_id: zoneId, zone_label: zone?.label || "", status: "finalizada",
      operator: operatorName,
      started_at: new Date().toISOString(), finished_at: new Date().toISOString(),
      items: rows, items_count: rows.length, divergences: divergent.length,
      value_diff: divergent.reduce((s, r) => {
        const prod = products.find((p) => p.id === r.product_id);
        return s + r.diff * (prod?.cost_price || 0);
      }, 0),
    }));

    if (divergent.length) {
      await base44.entities.Product.bulkUpdate(
        divergent.map((r) => ({ id: r.product_id, stock_quantity: r.counted }))
      );
      setProducts((ps) => ps.map((p) => {
        const r = divergent.find((x) => x.product_id === p.id);
        return r ? { ...p, stock_quantity: r.counted } : p;
      }));
    }

    setHistory((h) => [record, ...h]);
    setCounts({});
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Carregando inventário…</div>;

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inventário Cíclico</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conte zona por zona guiado pelo mapa — o saldo do sistema é ajustado ao final.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={zoneId} onValueChange={(v) => { setZoneId(v); setCounts({}); }}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Escolha a zona para contar" /></SelectTrigger>
              <SelectContent>
                {zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {zoneId && (
              <Link to={`/mapa?zone=${zoneId}`} className="text-xs text-primary inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> ver no mapa
              </Link>
            )}
            <div className="flex-1" />
            <Button disabled={!zoneId || saving || !Object.values(counts).some((v) => v !== "")}
              onClick={finish}>
              {saving ? "Ajustando…" : "Finalizar contagem"}
            </Button>
          </div>

          {zoneId
            ? <CountSheet items={items} counts={counts}
                onCount={(id, v) => setCounts((c) => ({ ...c, [id]: v }))} />
            : <p className="text-sm text-muted-foreground py-6">Selecione uma zona para iniciar a contagem.</p>}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Últimas contagens</p>
          <CountHistory counts={history} />
        </div>
      </div>
    </div>
  );
}