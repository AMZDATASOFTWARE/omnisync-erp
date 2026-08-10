import React from "react";
import { brl } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, Package } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function ProductTable({ products, map, onEdit, onDelete }) {
  const zoneLabel = (id) => map?.zones?.find((z) => z.id === id)?.label;

  if (products.length === 0)
    return <p className="text-sm text-slate-400 py-8 text-center bg-white rounded-xl border border-slate-200/80">Nenhum produto encontrado.</p>;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <th className="px-4 py-3 font-medium">Produto</th>
            <th className="px-4 py-3 font-medium">SKU / EAN</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium text-right">Preço</th>
            <th className="px-4 py-3 font-medium text-right">Estoque</th>
            <th className="px-4 py-3 font-medium">Localização</th>
            <th className="px-4 py-3 font-medium">NCM / CFOP</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const low = (p.stock_quantity || 0) <= (p.stock_min ?? p.min_stock ?? 0);
            const zid = p.zone_id || p.map_zone_id;
            const shelf = p.shelf_identifier || p.shelf_label;
            return (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} className="w-10 h-10 rounded-md border border-slate-200 object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-md border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-800">{p.name}</p>
                      {p.brand && <p className="text-xs text-slate-400">{p.brand}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku || "—"}<br />{p.barcode || ""}</td>
                <td className="px-4 py-3 text-slate-600">{p.category || "—"}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-800">{brl(p.price)}</td>
                <td className="px-4 py-3 text-right">
                  <Badge variant="outline" className={low ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600"}>
                    {p.stock_quantity ?? 0} {p.unit || "un"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {zid ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      {zoneLabel(zid) || "Zona"}{shelf ? ` · ${shelf}` : ""}{p.pos_z != null && p.pos_z !== "" ? ` · N${p.pos_z}` : ""}
                    </span>
                  ) : <span className="text-slate-300 text-xs">Sem local</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">{p.ncm || "—"}<br />{p.cfop_default || ""}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => onDelete(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}