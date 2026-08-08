import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FileDown } from "lucide-react";

const download = (name, content, type) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

export default function FiscalExportCard() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const run = async (includeXml) => {
    setLoading(true);
    const res = await base44.functions.invoke("exportFiscalBook", { from, to, include_xml: includeXml });
    const data = res.data || {};
    setLoading(false);
    if (!data.success || !data.resumo?.documentos) {
      toast({ title: "Nada a exportar", description: data.message || "Nenhum documento no período.", variant: "destructive" });
      return;
    }
    const suffix = `${from || "inicio"}_${to || "hoje"}`;
    if (includeXml) {
      data.xmls.forEach((x) => download(`NFCe-${x.numero}.xml`, x.xml, "application/xml"));
    } else {
      download(`livro-fiscal-${suffix}.csv`, data.csv, "text/csv;charset=utf-8");
    }
    toast({ title: "Exportação concluída", description: data.message });
  };

  return (
    <div className="bg-white rounded-xl border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileDown className="w-4 h-4 text-emerald-600" />
        <h2 className="font-medium text-sm">Exportação para a contabilidade</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Livro de saídas em CSV e XML de arquivamento de cada documento emitido ou cancelado.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">De</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Até</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
        <Button variant="outline" disabled={loading} onClick={() => run(false)}>Baixar CSV</Button>
        <Button variant="outline" disabled={loading} onClick={() => run(true)}>Baixar XMLs</Button>
      </div>
    </div>
  );
}