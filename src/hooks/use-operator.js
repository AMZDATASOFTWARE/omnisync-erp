import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export function operatorLabel(user) {
  if (!user) return "";
  const name = user.full_name || user.email || "";
  return user.operator_code ? `${name} (${user.operator_code})` : name;
}

// Perfil de operador do usuário logado
export function useOperator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).finally(() => setLoading(false));
  }, []);

  return { user, label: operatorLabel(user), loading };
}