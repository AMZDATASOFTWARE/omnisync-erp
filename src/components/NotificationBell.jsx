import React, { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { subscribeNotifications, dismissNotification, clearNotifications } from "@/lib/notifications-store";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  useEffect(() => subscribeNotifications(setItems), []);

  return (
    <Popover>
      <PopoverTrigger className="relative p-2 rounded-md text-muted-foreground hover:bg-primary/5 hover:text-foreground transition-colors">
        <Bell className="w-4 h-4" strokeWidth={2} />
        {items.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-heading font-bold text-sm text-foreground">Notificações</p>
          {items.length > 0 && (
            <button onClick={clearNotifications} className="text-xs text-primary hover:underline">
              Limpar todas
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação em aberto.</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className="flex gap-2 px-4 py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.variant === "destructive" ? "text-destructive" : "text-foreground"}`}>
                    {n.title}
                  </p>
                  {n.description && <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <button onClick={() => dismissNotification(n.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}