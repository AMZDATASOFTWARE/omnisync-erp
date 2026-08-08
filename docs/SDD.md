# OmniSync ERP — System Design Document (SDD)

**Versão:** 1.0
**Status:** Baseline arquitetural
**Stack:** React 18 + Vite + TailwindCSS + shadcn/ui · Base44 BaaS (Entities, Functions, Agents, Workflows)
**Escopo:** ERP modular multissetor com PDV, estoque, financeiro, fiscal, CRM, cartografia física da loja e agentes de IA.

---

## 0. Visão Arquitetural

### 0.1 Camadas

| Camada | Responsabilidade | Localização |
|---|---|---|
| Apresentação Desktop | Interface densa, operação administrativa e PDV | `src/pages/*`, `src/components/*` |
| Apresentação Mobile/PWA | Consulta ultra-rápida em pista de atendimento | `src/pages/Mobile.jsx`, `src/components/mobile/*` |
| Domínio / Regras | Cálculo fiscal, localização, custeio | `base44/shared/*` |
| Serviços | Endpoints HTTP, drivers externos | `base44/functions/*` |
| Persistência | Entidades JSON-Schema versionadas | `base44/entities/*` |
| Inteligência | Agent Runtime + Tool Calling | `base44/agents/*` |
| Automação | Triggers, agendamentos, webhooks | `base44/workflows/*` |

### 0.2 Princípios

1. **Fonte única de verdade**: nenhum dado derivado é persistido sem origem rastreável (venda → estoque → financeiro → fiscal).
2. **Desacoplamento fiscal**: o domínio nunca conhece o emissor; conversa apenas com o payload canônico.
3. **Geometria independente de pixel**: coordenadas normalizadas/métricas, renderização é detalhe de view.
4. **Tools antes de canais**: a IA expõe capacidades; WhatsApp/Web/Totem são apenas transporte.
5. **Mobile-first onde há pressa**: a pista de atendimento tem orçamento de 2 toques e < 300 ms de resposta percebida.

### 0.3 Fluxo transacional central

```
PDV (venda)
  ├─▶ Sale                 (documento comercial)
  ├─▶ Product.stock        (baixa de estoque atômica por item)
  ├─▶ FinancialEntry       (receber / liquidado)
  ├─▶ Customer.total_spent (CRM / segmentação)
  └─▶ FiscalPayload ──▶ emitFiscalDocument ──▶ Driver (sandbox | SEFAZ | SAT)

Compras (entrada)
  ├─▶ Purchase
  ├─▶ Product.stock ↑ + cost_price
  └─▶ FinancialEntry (pagar / pendente)
```

---

## 1. Especificação de Dados & Expansão de Schemas

### 1.1 `Product.jsonc` — Expansão

O produto é o agregado central: comercial, fiscal, logístico e **cartográfico**.

#### 1.1.1 Bloco Comercial
| Campo | Tipo | Regra |
|---|---|---|
| `name` | string | obrigatório |
| `sku` | string | único por tenant (validação de aplicação) |
| `barcode` | string | EAN-8/13, GTIN-14; índice de busca primário no Mobile |
| `brand`, `category` | string | facetas de filtro |
| `price` | number | preço de venda vigente |
| `cost_price` | number | atualizado pela última entrada (`Purchase`) |
| `active` | boolean | soft-delete lógico |

#### 1.1.2 Bloco Fiscal
| Campo | Tipo | Descrição |
|---|---|---|
| `ncm` | string(8) | Nomenclatura Comum do Mercosul — chave da tabela de tributação |
| `cest` | string(7) | Código Especificador da Substituição Tributária |
| `cfop_default` | string(4) | CFOP padrão de saída (ex.: `5102` venda interna, `5405` ST) |
| `origem` | enum `0..8` | Origem da mercadoria (0 = nacional, 1 = importação direta, 2 = mercado interno importado…) |
| `csosn` | string(3) | Simples Nacional (ex.: `102`, `500`) |
| `cst_icms` | string(2) | Regime Normal |
| `aliquota_icms` | number | % ICMS quando não resolvido por NCM |
| `pis_cofins_st` | boolean | monofásico / ST |

> **Regra de resolução tributária:** `Produto.override` → `TaxRule[NCM+UF]` → `FiscalConfig.default`. A regra simplificada atual é substituída por tabela NCM na Fase 4.

#### 1.1.3 Bloco de Estoque
| Campo | Tipo | Descrição |
|---|---|---|
| `unit` | enum | `un, kg, g, l, ml, m, m2, cx, pct` |
| `unit_conversion` | number | fator para unidade de compra (ex.: cx = 12 un) |
| `stock_quantity` | number | saldo corrente |
| `min_stock` / `max_stock` | number | disparo de alerta de ruptura / limite de reposição |
| `track_lot` | boolean | ativa rastreio por lote |
| `lot` | string | lote corrente (modelo simplificado) |
| `expiry_date` | date | validade — gera alerta D-30/D-7 |

**Evolução prevista (`StockBatch`)** — desnormalização do lote para entidade própria quando `track_lot = true`:

```jsonc
{
  "name": "StockBatch",
  "properties": {
    "product_id": { "type": "string" },
    "lot": { "type": "string" },
    "quantity": { "type": "number" },
    "expiry_date": { "type": "string", "format": "date" },
    "cost": { "type": "number" },
    "zone_id": { "type": "string" }
  }
}
```
Consumo por **FEFO** (First-Expire-First-Out) no PDV.

#### 1.1.4 Bloco Cartográfico (Indexação Física)
| Campo | Tipo | Descrição |
|---|---|---|
| `zone_id` | string | zona/setor no `StoreMap` |
| `shelf_id` | string | gôndola/estante dentro da zona |
| `pos_x`, `pos_y` | number | coordenada métrica normalizada (0..1) no plano da loja |
| `pos_z` | integer | nível da prateleira (0 = piso, crescente para cima) |
| `face` | enum `A,B` | face da gôndola (corredor par/ímpar) |

> **Múltiplas posições:** quando um SKU ocupa mais de um ponto (ilha promocional + gôndola fixa), a alocação migra para `ProductPlacement` (1:N), e os campos acima passam a espelhar a posição **primária**.

```jsonc
{
  "name": "ProductPlacement",
  "properties": {
    "product_id": { "type": "string" },
    "zone_id": { "type": "string" },
    "shelf_id": { "type": "string" },
    "pos_x": { "type": "number" }, "pos_y": { "type": "number" }, "pos_z": { "type": "integer" },
    "facings": { "type": "integer" },
    "primary": { "type": "boolean" }
  }
}
```

---

### 1.2 `StoreMap.jsonc` — Grid Cartográfico 2D

Modelo **híbrido**: grade (edição rápida) + vetor (precisão métrica) + hierarquia (zona → gôndola → nível).

```jsonc
{
  "name": "StoreMap",
  "properties": {
    "name":  { "type": "string" },
    "width_m":  { "type": "number" },   // dimensão física real (metros)
    "height_m": { "type": "number" },
    "cols": { "type": "integer" },      // resolução da grade de edição
    "rows": { "type": "integer" },

    "zones": {
      "type": "array",
      "items": { "type": "object", "properties": {
        "id": { "type": "string" },
        "label": { "type": "string" },
        "type": { "type": "string", "enum": ["gondola","prateleira","geladeira","caixa","deposito","entrada","corredor","outro"] },
        "color": { "type": "string" },
        "cells": { "type": "array", "items": { "type": "object",
          "properties": { "x": {"type":"integer"}, "y": {"type":"integer"} } } },
        "polygon": { "type": "array", "items": { "type": "object",
          "properties": { "x": {"type":"number"}, "y": {"type":"number"} } } },
        "shelves": { "type": "array", "items": { "type": "object", "properties": {
          "id": { "type": "string" },
          "label": { "type": "string" },
          "levels": { "type": "integer" },
          "orientation": { "type": "string", "enum": ["horizontal","vertical"] }
        } } }
      } }
    },

    "traffic_nodes": {
      "type": "array",
      "items": { "type": "object", "properties": {
        "id": { "type": "string" },
        "x": { "type": "number" }, "y": { "type": "number" },
        "links": { "type": "array", "items": { "type": "string" } },
        "kind": { "type": "string", "enum": ["entrada","corredor","caixa","saida"] }
      } }
    }
  }
}
```

**Sistema de coordenadas:** origem no canto superior-esquerdo; `x,y ∈ [0,1]` normalizados; conversão métrica `x_m = x * width_m`. Renderização = `x * viewportWidth`. Trocar zoom, viewport ou dispositivo **não** invalida dado persistido.

**Grafo de tráfego:** `traffic_nodes` + `links` formam um grafo não-direcionado. Rota "caixa → produto" resolvida por Dijkstra sobre distância euclidiana entre nós; usada na Fase 2+ para o *wayfinding* do Mobile e das respostas da IA.

---

### 1.3 Arquitetura Fiscal Desacoplada — `FiscalPayload`

O domínio produz um **payload canônico**; o driver traduz para o layout do emissor.

```
Sale ──▶ buildFiscalPayload(sale, products, fiscalConfig) ──▶ FiscalPayload
                                                                  │
                        ┌──────────────┬──────────────┬───────────┴──────┐
                    NFC-e (65)      NF-e (55)        SAT-CF-e        Sandbox
                    driver-sefaz   driver-sefaz    driver-sat      driver-mock
```

**Contrato do payload** (`base44/shared/fiscal.js`):

```ts
interface FiscalPayload {
  modelo: '65' | '55' | 'SAT';
  emitente: { cnpj, razao_social, ie, uf, regime };
  destinatario?: { cpf_cnpj?, nome? };
  itens: Array<{
    codigo, descricao, ncm, cest, cfop, origem,
    unidade, quantidade, valor_unitario, valor_total,
    tributos: { icms: {cst|csosn, aliquota, valor}, pis, cofins }
  }>;
  totais: { produtos, descontos, tributos, liquido };
  pagamentos: Array<{ forma: 'dinheiro'|'credito'|'debito'|'pix', valor }>;
  referencia: { sale_id, emitido_em };
}
```

**Contrato do driver:**

```ts
interface FiscalDriver {
  emit(payload: FiscalPayload): Promise<{ status, numero, chave, xml?, qrcode?, erro? }>;
  cancel(chave: string, justificativa: string): Promise<...>;
}
```

**Máquina de estados de `Sale.fiscal_status`:**
`pendente → emitida` · `pendente → erro → pendente` (retry idempotente por `sale_id`) · `nao_aplicavel` (venda interna/ajuste) · `emitida → cancelada` (≤ 30 min, com justificativa).

**Contingência:** falha de comunicação não bloqueia o PDV — a venda conclui, o documento permanece `pendente` e a fila é reprocessada pela tela Fiscal ou por workflow agendado.

---

## 2. UI/UX Mobile-First Ultra-Rápida (`src/pages/Mobile.jsx`)

### 2.1 Contexto de uso
Vendedor **em pé, em movimento, com cliente ao lado**. Métrica de sucesso: responder "quanto custa, tem, e onde está?" em ≤ 2 toques e ≤ 3 s.

### 2.2 Orçamento de interação

| Toque | Ação | Resultado |
|---|---|---|
| 1 | Digitar/escanear no campo já focado (`autoFocus`) | Lista filtrada em tempo real |
| 2 | Tocar no resultado | Preço, saldo, zona/prateleira e miniatura do mapa |

Sem navegação de rota entre etapas: transição de estado local (`selected`), custo zero de remount.

### 2.3 Estratégia de dados
- **Prefetch único** no mount (`Product.list`, `StoreMap.list`) → busca subsequente é **client-side**, sem latência de rede.
- Filtro multicampo: `name | sku | barcode | brand | category`, `slice(0,20)` para limitar reflow.
- Evolução: cache em `localStorage` + revalidação em background (stale-while-revalidate) e paginação por cursor acima de ~2.000 SKUs.

### 2.4 Entrada por código de barras
1. **Leitor físico/HID**: teclado emulado → o campo com `autoFocus` já captura; `Enter` seleciona o primeiro resultado exato por `barcode`.
2. **Câmera** (evolução): `BarcodeDetector` nativo com fallback; ao ler, aplica match exato e salta direto à tela de resultado (**1 toque**).

### 2.5 Regras visuais
- Tema escuro `#0e1420` — legibilidade sob luz de loja e menor consumo em OLED.
- Alvos de toque ≥ 56 px; tipografia de preço em destaque (maior elemento da tela).
- Semáforo de saldo: verde (> mín.), âmbar (≤ mín.), vermelho (0).
- Miniatura de localização: SVG do `StoreMap` com a zona do produto realçada + rótulo "Corredor / Gôndola / Nível".
- Rota de saída sempre disponível (voltar ao sistema / voltar ao resultado).

### 2.6 PWA
`display: standalone`, ícone e splash; shell em cache (Service Worker) para abertura offline e consulta com dado da última sincronização.

---

## 3. Motor de Planta Baixa 2D (`src/pages/MapaLoja.jsx`, `src/components/map/`)

### 3.1 Componentização

| Componente | Responsabilidade |
|---|---|
| `MapCanvas` | Renderização do grid/vetor, pintura e borracha de células, legenda |
| `ZonePanel` | CRUD de zonas: rótulo, tipo, cor, contagem de SKUs |
| `ZoneInventory` | Estoque, valorização e alertas da zona selecionada |
| `ShelfEditor` *(Fase 2)* | Gôndolas, níveis e facings dentro da zona |
| `PlacementPicker` *(Fase 2)* | Alocação produto → `zone/shelf/level` |

### 3.2 Pipeline de renderização

```
StoreMap (dado normalizado)
   → layout pass  (normalizado → px do viewport)
   → paint pass   (zonas → polígonos/células SVG, cores por zona)
   → overlay pass (heatmap de estoque, alertas, rota destacada)
   → hit-test     (ponteiro → célula/zona → seleção)
```

**SVG** para a planta (nós interativos, acessíveis, DOM-diffáveis, exportáveis) e **Canvas** reservado a overlays de alta densidade (heatmap com centenas de milhares de pontos), quando necessário.

### 3.3 Modelo de edição
- **Modo pintura**: zona ativa + arraste sobre a grade → `cells[]`. Rápido e tolerante a erro.
- **Modo vetor** *(Fase 2)*: polígono livre → `polygon[]`, para lojas com planta irregular.
- **Persistência**: gravação debounced (~600 ms) do documento inteiro; `StoreMap` é agregado pequeno, atualização otimista com rollback em erro.

### 3.4 Alocação de produtos
Bidirecional e sempre consistente:
- **Produto → Mapa**: no cadastro, escolher zona/gôndola/nível.
- **Mapa → Produto**: em `ZoneInventory`, arrastar/selecionar SKUs para a zona.
- Índice invertido em memória `zone_id → Product[]` para os KPIs de zona (itens, valorização, rupturas).

### 3.5 Camadas analíticas
Heatmap de **giro** (vendas/zona), de **ruptura** (itens < mínimo) e de **valorização** (R$ parado por zona) — todas derivadas de `Sale` + `Product`, sem persistência adicional.

---

## 4. Arquitetura de Agentes de IA (WhatsApp & Chatbot)

### 4.1 Topologia

```
WhatsApp ─┐
Web Chat ─┼─▶ Agent Runtime (base44/agents/loja_assistente) ─▶ Tools ─▶ Entities
Totem    ─┘                                                    │
                                                     shared/locate.js (regras)
```
O agente é **agnóstico de canal**: mesma política, mesmas tools, respostas adaptadas ao formato do transporte.

### 4.2 Especificação de Tool Calling

#### `get_product_info`
```jsonc
{
  "name": "get_product_info",
  "description": "Retorna preço, saldo, marca e status de estoque de um produto.",
  "input":  { "query": "string  // nome, SKU ou código de barras" },
  "output": {
    "found": "boolean",
    "matches": [{
      "id": "string", "name": "string", "sku": "string", "barcode": "string",
      "price": "number", "stock_quantity": "number", "min_stock": "number",
      "stock_status": "ok | baixo | ruptura", "brand": "string", "category": "string"
    }]
  }
}
```

#### `get_product_location`
```jsonc
{
  "name": "get_product_location",
  "description": "Retorna a localização física do produto na loja.",
  "input":  { "query": "string" },
  "output": {
    "found": "boolean",
    "product": { "id": "string", "name": "string" },
    "location": {
      "zone_id": "string", "zone_label": "string", "zone_type": "string",
      "shelf_label": "string", "level": "integer",
      "coords": { "x": "number", "y": "number" },
      "human_readable": "string  // 'Corredor 3 — Gôndola B, 2º nível'"
    },
    "map_url": "string // deep link /mapa?zone=<id>&product=<id>"
  }
}
```

**Regras de resolução** (`base44/shared/locate.js`, compartilhado por tools e UI — nunca duplicado):
1. Match exato por `barcode` → por `sku` → busca fuzzy por `name` (normalização: minúsculas, sem acento).
2. Ambiguidade (> 1 match): o agente **pergunta**, nunca adivinha.
3. Sem `zone_id`: responde explicitamente "produto sem localização cadastrada" + sugere cadastro.

### 4.3 Fluxo do vendedor via WhatsApp

```
Vendedor: "tem café pilão 500g? onde fica?"
   │
   ├─▶ Agent → get_product_info("café pilão 500g")
   │      ← { price: 21.90, stock: 34, status: "ok" }
   ├─▶ Agent → get_product_location("café pilão 500g")
   │      ← { zone_label: "Corredor 3", shelf: "Gôndola B", level: 2, map_url: ... }
   └─▶ Resposta:
        "☕ Café Pilão 500g — R$ 21,90 · 34 un em estoque
         📍 Corredor 3 — Gôndola B, 2º nível
         🗺️ ver no mapa: <map_url>"
```

**Coordenadas visuais:** o `map_url` abre `/mapa` com a zona realçada; evolução prevista é a geração server-side de um PNG do recorte da planta com pino, anexado como imagem na resposta do WhatsApp.

### 4.4 Governança
- **Permissões**: decisão revisada — o agente opera como um usuário completo, com leitura **e escrita** em todas as entidades do ERP e acesso a todas as tools; toda operação de escrita exige confirmação explícita do usuário antes de executar.
- **Sem alucinação de preço**: toda resposta numérica origina de tool; sem match → "não encontrei".
- **Auditoria**: cada tool call registra query e produto resolvido para calibrar o dicionário de busca.
- **Escalonamento**: pedido fora do escopo (desconto, cancelamento) → encaminhar a humano.

---

## 5. Roadmap de Implementação

### Fase 1 — Fundação: Schemas & SDD ✅
- Entidades base: `Product`, `StoreMap`, `Sale`, `CashSession`, `CashMovement`, `Customer`, `FinancialEntry`, `Supplier`, `Purchase`, `FiscalConfig`.
- Layout, navegação e Dashboard com KPIs conectados.
- **Entregável:** modelo de dados estável + este documento.

### Fase 2 — Mapa 2D & Alocação ✅
- `MapCanvas`, `ZonePanel`, `ZoneInventory` operacionais; alocação por zona.
- ✅ Renderização SVG com zoom/pan, alocação bidirecional de SKUs (`ProductLinker`) e deep link `/mapa?zone=&product=` com pin pulsante.
- ✅ Gôndolas/níveis (`shelves`): criação por zona (`ShelfPanel`), reposicionamento no canvas (ferramenta “Gôndola”), alocação de SKU a gôndola + nível (`shelf_identifier` / `pos_z`) e pino no destaque.
- ✅ `ProductPlacement` 1:N: um SKU pode ocupar várias posições (zona + gôndola + nível), com posição principal (`is_primary`) espelhada em `Product` e promoção automática ao remover a principal. `getProductLocation` retorna `placements` e `other_locations`.
- ✅ Wayfinding: rota a pé da zona "entrada" até o produto (BFS na grade, zonas entrada/corredor/caixa são caminháveis), via `getRouteToProduct` — passos numerados no mobile ("Como chegar") e traçado animado no mapa.
- ✅ `polygon[]` vetorial: ferramenta “Polígono” no `MapCanvas` (coordenadas normalizadas 0..1), renderização em `PolygonLayer`, edição/limpeza por zona.
- ✅ Camadas analíticas (3.5): mapa de calor por zona de giro (vendas), ruptura e valorização (`HeatControls` + `lib/heat.js`), derivadas de `Sale` + `Product`.
- **Critério de aceite:** localizar qualquer SKU cadastrado em ≤ 2 cliques a partir do mapa.

### Fase 3 — Mobile Fast & PDV ✅
- PDV com sessão de caixa, sangria/reforço, carrinho, baixa de estoque, financeiro e CRM encadeados.
- Mobile de consulta rápida com busca instantânea e retorno de preço/saldo/localização.
- ✅ Leitura por câmera (`BarcodeDetector`), busca com debounce, miniatura de mapa com pin e deep link `/mobile?sku=`.
- ✅ Cache offline (stale-while-revalidate em `localStorage` via `use-offline-cache`) com selo de última sincronização; PWA com manifest.
- **Critério de aceite:** consulta completa em ≤ 2 toques; venda concluída em ≤ 15 s.

### Fase 4 — IA Tools & Driver Fiscal 🔄
- **4a ✅** Agente `loja_assistente` com `get_product_info` e `get_product_location`; chat web.
- **4b ✅** Motor fiscal com payload canônico, `emitFiscalDocument`, `FiscalConfig` e emissão automática no fechamento da venda (driver `sandbox`).
- **4c 🔄** Driver SEFAZ real (NFC-e/NF-e) + SAT; certificado A1 via secret.
- **4d ✅** Tabela de tributação por NCM/UF (`TaxRule`, tela `/tributacao`): CFOP, CSOSN/CST, alíquotas de ICMS/PIS/COFINS, CEST e marcação de ST por NCM. `buildFiscalPayload` resolve via `resolveTaxRule` na ordem NCM+UF → NCM (todas UFs) → padrão do regime, e `emitFiscalDocument` carrega as regras na emissão. Agente conectado com leitura/escrita de `TaxRule`.
- **4f 🔄** NFS-e Padrão Nacional (gov.br): entidade `ServiceInvoice`, tela `/nfse`, geração da DPS (leiaute nacional v1.00, GZip+Base64) e chamadas diretas à API Sefin Nacional (`emitNFSe`, `consultNfseNacional`), com dados do emitente em `FiscalConfig`. Pendente: a autorização da API exige mTLS com certificado ICP-Brasil A1, não suportado pelo runtime — necessário um intermediário que apresente o certificado.
- **4g ✅** Ciclo de vida do documento: cancelamento de NFC-e (`cancelFiscalDocument`, janela de 30 min + justificativa ≥ 15 caracteres, `Sale.fiscal_status = cancelada`), cancelamento de NFS-e (`cancelNFSe`) e fila de contingência reprocessável em lote (`reprocessFiscalQueue`, idempotente, botão “Reprocessar fila” em `/fiscal`). Agente conectado às três ferramentas.
- **4h ✅** Eventos fiscais: Carta de Correção Eletrônica (`correctFiscalDocument` — janela de 720h, texto de 15 a 1000 caracteres, bloqueio de correções que alterem valor/quantidade/destinatário, sequência incremental por documento) e inutilização de faixa de numeração (`voidFiscalNumbers`), ambos auditados na entidade `FiscalEvent` e operáveis em `/fiscal`. Agente conectado às duas ferramentas e à entidade.
- **4e 🔄** Canal WhatsApp do agente + imagem de localização gerada server-side.
- **Critério de aceite:** documento autorizado pela SEFAZ em homologação e reprocessamento de fila sem duplicidade.

### Fase 5 — Backlog arquitetural
- ✅ `StockBatch` com consumo FEFO e alertas de validade: tela `/lotes` (registro de lote, saldo, bloqueio, painel de vencidos e a vencer em 30 dias), regras em `shared/batch.js` e baixa via `consumeStockFEFO` (dry-run + alocação lote a lote, com ajuste do saldo do produto). Agente conectado com leitura/escrita de `StockBatch` e a ferramenta FEFO.
- ✅ Inventário cíclico assistido por zona: tela `/inventario` com seleção de zona do mapa, folha de contagem (saldo do sistema × contado, divergência em tempo real), ajuste automático do `stock_quantity` ao finalizar e histórico com impacto financeiro (`InventoryCount`). Agente conectado com leitura/escrita da entidade.
- ✅ Workflows agendados (e-mail aos administradores, via `shared/notify.js`): **Alerta de Ruptura** (08h, `alertStockouts`), **Resumo Diário de Vendas** (20h, `dailySalesDigest` — faturamento, ticket médio, mix de pagamento e pendência fiscal) e **Cobrança de Contas a Vencer** (07h, `alertDueEntries` — marca vencidas e alerta os 7 dias seguintes).
- ✅ Multi-loja: entidade `Store` (unidades da rede, com unidade padrão), tela `/lojas` para CRUD e seletor de unidade ativa na navegação (`StoreSwitcher` / `use-store`, persistido em `localStorage`). `store_id` transversal em `Product`, `StoreMap`, `Sale`, `CashSession`, `FinancialEntry`, `Purchase`, `StockBatch` e `InventoryCount`, carimbado na criação e filtrado na leitura por `lib/scope.js` (`withStore` / `ofStore`); registros sem `store_id` seguem compartilhados entre unidades. Agente conectado com leitura/escrita de `Store` e ciente do escopo por `store_id`. Próximo passo: RLS por unidade quando houver usuários restritos a uma loja.
- ✅ Relatórios (`/relatorios`, cálculos em `lib/reports.js`, período 7/30/90 dias): DRE gerencial (receita, CMV, lucro bruto, despesas pagas, resultado líquido e margens), curva ABC por faturamento (classes A ≤80%, B ≤95%, C) com margem por SKU e giro por zona (unidades, faturamento e giro sobre o valor de estoque, com link para o mapa).

---

## 6. Riscos & Decisões Registradas

| # | Decisão | Alternativa descartada | Motivo |
|---|---|---|---|
| D1 | Coordenadas normalizadas 0..1 | Pixels absolutos | Independência de viewport/zoom/dispositivo |
| D2 | Grade + vetor híbridos | Só vetor | Curva de aprendizado; grade é imediata |
| D3 | Payload fiscal canônico + drivers | Integração direta com emissor | Troca de emissor sem tocar no domínio |
| D4 | Falha fiscal não bloqueia a venda | Bloqueio síncrono | Caixa não pode parar por indisponibilidade da SEFAZ |
| D5 | Tools desacopladas do canal | Bot por canal | Reuso em WhatsApp, web e totem |
| D6 | Busca client-side no Mobile | Query por tecla | Latência zero percebida na pista |

| Risco | Impacto | Mitigação |
|---|---|---|
| Catálogo > 5.000 SKUs no Mobile | Memória/tempo de carga | Cache local + paginação por cursor + índice por prefixo |
| Rejeição fiscal por NCM incorreto | Venda sem documento | Validação de NCM no cadastro + fila de reprocessamento |
| Divergência entre estoque e físico | Ruptura invisível | ✅ Inventário cíclico por zona (`/inventario`) |
| NCM/CEST incorretos no cadastro | Rejeição fiscal | ✅ `lookupProductData` no cadastro + painel de pendências fiscais em `/fiscal` (`fiscalPendencies`, correção automática por fontes oficiais); NCM normalizado (aceita pontuação) no motor fiscal |
| Mapa desatualizado após remanejo | IA responde local errado | Registro de `updated_date` por zona + alerta de zona sem revisão |