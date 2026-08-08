// Wayfinding na planta da loja (SDD Parte 4) — rota da entrada até o produto.

const WALKABLE_TYPES = ["corredor", "entrada", "caixa"];

// Monta a matriz de células caminháveis: vazio ou zona de circulação
export function buildGrid(map) {
  const cols = map.cols || 20;
  const rows = map.rows || 12;
  const blocked = new Set();
  (map.zones || []).forEach((z) => {
    if (WALKABLE_TYPES.includes(z.type)) return;
    (z.cells || []).forEach((c) => blocked.add(`${c.x},${c.y}`));
  });
  (map.shelves || []).forEach((s) => {
    for (let x = 0; x < (s.width || 1); x++) {
      for (let y = 0; y < (s.height || 1); y++) blocked.add(`${(s.x || 0) + x},${(s.y || 0) + y}`);
    }
  });
  return { cols, rows, blocked };
}

export function entranceCell(map) {
  const entrance = (map.zones || []).find((z) => z.type === "entrada");
  const cell = entrance?.cells?.[0];
  return cell ? { x: cell.x, y: cell.y } : null;
}

function neighbors({ x, y }, grid) {
  return [
    { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 },
  ].filter((c) => c.x >= 0 && c.y >= 0 && c.x < grid.cols && c.y < grid.rows);
}

// BFS até qualquer célula alvo (retorna o caminho de células)
export function findPath(map, start, targets) {
  if (!start || !targets.length) return null;
  const grid = buildGrid(map);
  const goal = new Set(targets.map((t) => `${t.x},${t.y}`));
  const startKey = `${start.x},${start.y}`;
  const prev = new Map([[startKey, null]]);
  const queue = [start];

  while (queue.length) {
    const cur = queue.shift();
    const key = `${cur.x},${cur.y}`;
    if (goal.has(key) && key !== startKey) {
      const path = [];
      let k = key;
      while (k) { const [x, y] = k.split(",").map(Number); path.unshift({ x, y }); k = prev.get(k); }
      return path;
    }
    for (const n of neighbors(cur, grid)) {
      const nk = `${n.x},${n.y}`;
      if (prev.has(nk)) continue;
      if (grid.blocked.has(nk) && !goal.has(nk)) continue;
      prev.set(nk, key);
      queue.push(n);
    }
  }
  return null;
}

const DIRS = {
  "1,0": "para a direita", "-1,0": "para a esquerda",
  "0,1": "para o fundo da loja", "0,-1": "em direção à frente da loja",
};

// Converte o caminho em instruções curtas de navegação
export function pathToSteps(path) {
  if (!path || path.length < 2) return [];
  const steps = [];
  let dir = null;
  let count = 0;
  const flush = () => { if (dir && count) steps.push(`Siga ${DIRS[dir]} por ${count} passo${count > 1 ? "s" : ""}`); };

  for (let i = 1; i < path.length; i++) {
    const d = `${path[i].x - path[i - 1].x},${path[i].y - path[i - 1].y}`;
    if (d === dir) count++;
    else { flush(); dir = d; count = 1; }
  }
  flush();
  return steps;
}

// Rota completa da entrada até uma célula-alvo
export function routeToCell(map, target) {
  const start = entranceCell(map);
  if (!start) return { ok: false, reason: "no_entrance" };
  const grid = buildGrid(map);
  const around = [target, ...neighbors(target, grid)].filter((c) => c.x >= 0 && c.y >= 0);
  const path = findPath(map, start, around);
  if (!path) return { ok: false, reason: "no_path" };
  return { ok: true, start, path, steps: pathToSteps(path), distance: path.length - 1 };
}