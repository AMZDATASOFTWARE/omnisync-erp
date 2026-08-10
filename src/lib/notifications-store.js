// Arquivo de notificações: guarda cada aviso exibido em toast para consulta no sininho.
const listeners = [];
let items = [];

export function addNotification({ title, description, variant }) {
  items = [
    { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, description, variant, created_at: new Date().toISOString() },
    ...items,
  ].slice(0, 50);
  listeners.forEach((l) => l(items));
}

export function dismissNotification(id) {
  items = items.filter((n) => n.id !== id);
  listeners.forEach((l) => l(items));
}

export function clearNotifications() {
  items = [];
  listeners.forEach((l) => l(items));
}

export function subscribeNotifications(listener) {
  listeners.push(listener);
  listener(items);
  return () => {
    const i = listeners.indexOf(listener);
    if (i > -1) listeners.splice(i, 1);
  };
}