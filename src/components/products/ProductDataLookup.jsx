import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Globe, Loader2 } from "lucide-react";

export default function ProductDataLookup({ query, onApply }) {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);

  const run = async () => {
    setLoading(true);
    setRes(null);
    const r = await base44.functions.invoke("lookupProductData", { query });
    setRes(r.data);
    setLoading(false);
  };

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Buscar dados reais (Cosmos Bluesoft + NCM/Receita) pelo código de barras ou nome.
        </p>
        <Button type="button" variant="outline" size="sm" disabled={loading || !query} onClick={run}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          {loading ? "Consultando…" : "Buscar dados"}
        </Button>
      </div>

      {res && !res.found && (
        <p className="text-xs text-muted-foreground">Nada encontrado para "{res.query}".</p>
      )}

      {res?.found && (
        <div className="text-xs space-y-1.5">
          <p className="text-foreground font-medium">{res.name || "—"}</p>
          <p className="text-muted-foreground">
            {[res.brand, res.category, res.ncm && `NCM ${res.ncm}`, res.cest && `CEST ${res.cest}`]
              .filter(Boolean).join(" · ") || "Sem dados fiscais confirmados"}
          </p>
          {res.confidence && <p className="text-muted-foreground">Confiança: {res.confidence}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" onClick={() => onApply(res)}>Preencher formulário</Button>
          </div>
          <p className="text-muted-foreground/80">{res.disclaimer}</p>
        </div>
      )}
    </div>
  );
}