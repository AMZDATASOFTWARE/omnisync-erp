import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

// DANFE simplificado (cupom) do documento fiscal — impressão em bobina 80mm.
export default function DanfeDialog({ sale, config, open, onOpenChange }) {
  if (!sale) return null;

  const print = () => {
    const html = document.getElementById("danfe-print")?.innerHTML || "";
    const w = window.open("", "_blank", "width=380,height=640");
    w.document.write(
      `<html><head><title>NFC-e ${sale.fiscal_number || ""}</title>
      <style>body{font-family:monospace;font-size:12px;width:300px;margin:0 auto;padding:12px}
      table{width:100%;border-collapse:collapse}td{padding:1px 0;vertical-align:top}
      .c{text-align:center}.r{text-align:right}.b{font-weight:700}
      hr{border:0;border-top:1px dashed #000;margin:6px 0}</style></head>
      <body>${html}</body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Cupom fiscal (DANFE simplificado)</DialogTitle></DialogHeader>

        <div id="danfe-print" className="font-mono text-[11px] leading-tight max-h-[55vh] overflow-y-auto">
          <div className="c">
            <div className="b">{config?.razao_social || "EMITENTE NÃO CONFIGURADO"}</div>
            <div>CNPJ {config?.cnpj || "—"} · IE {config?.inscricao_estadual || "—"}</div>
            <div>UF {config?.uf || "—"}</div>
          </div>
          <hr />
          <div className="c b">DOCUMENTO AUXILIAR DA NFC-e</div>
          <div className="c">Nº {sale.fiscal_number || "—"} · {format(new Date(sale.created_date), "dd/MM/yyyy HH:mm")}</div>
          <hr />
          <table>
            <tbody>
              {(sale.items || []).map((i, idx) => (
                <tr key={idx}>
                  <td>{i.quantity}x {i.name}</td>
                  <td className="r">{brl((i.price || 0) * (i.quantity || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr />
          <table>
            <tbody>
              <tr className="b"><td>TOTAL</td><td className="r">{brl(sale.total)}</td></tr>
              <tr><td>Pagamento</td><td className="r">{sale.payment_method}</td></tr>
              <tr><td>Cliente</td><td className="r">{sale.customer_name || "CONSUMIDOR"}</td></tr>
            </tbody>
          </table>
          <hr />
          <div className="c">Chave de acesso</div>
          <div className="c" style={{ wordBreak: "break-all" }}>{sale.fiscal_key || "—"}</div>
          <div className="c">Consulte pela chave em www.nfce.fazenda.gov.br</div>
          {sale.fiscal_status === "cancelada" && <div className="c b">*** DOCUMENTO CANCELADO ***</div>}
        </div>

        <DialogFooter>
          <Button onClick={print}><Printer className="w-4 h-4" /> Imprimir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}