import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { UserCircle } from "lucide-react";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [code, setCode] = useState("");
  const [storeId, setStoreId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([base44.auth.me(), base44.entities.Store.list("name", 100)]).then(([me, sts]) => {
      setUser(me);
      setCode(me.operator_code || "");
      setStoreId(me.operator_store_id || "");
      setStores(sts.filter((s) => s.active !== false));
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await base44.auth.updateMe({ operator_code: code, operator_store_id: storeId });
    setSaving(false);
    toast({ title: "Perfil de operador salvo", description: "Suas operações passam a usar esses dados." });
  };

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Carregando perfil…</div>;

  return (
    <div className="p-6 md:p-8 max-w-xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meu Perfil de Operador</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Esses dados identificam você automaticamente no caixa, inventário e operações fiscais.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{user.full_name || "Sem nome"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Código do operador (crachá)</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: OP-014" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Unidade padrão</Label>
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
            <SelectContent>
              {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? "Salvando…" : "Salvar perfil"}
        </Button>
      </div>
    </div>
  );
}