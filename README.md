<div align="center">

# ⚡ Fipou

### **Já fipou esse carro?**

_Inteligência automotiva brasileira. Preço FIPE, depreciação real, recalls, índice de roubo e consumo._
_Antes de você comprar._

[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js&logoColor=fff)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=fff)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=fff)](https://vercel.com)

```
fipou  /fiˈpow/  verbo
analisar um veículo a fundo
antes de comprar.
```

</div>

---

## 📖 O que é o Fipou

A pesquisa pré-compra de carro no Brasil hoje exige abrir 6 abas: tabela FIPE, OLX, Reclame Aqui, Senacon, INMETRO e Susep. **O Fipou junta tudo em uma ficha** ancorada no `codeFipe` — o único identificador estável entre fontes oficiais.

A vantagem competitiva não é a busca FIPE. É a **junção**: depreciação cross-sectional, recalls oficiais, índice de roubo e consumo, tudo em um veredito determinístico.

> _Sozinha, a integração FIPE é um clone. O produto é nas junções._

---

## ✨ Features atuais (MVP)

| Tela | Rota | O que entrega |
|---|---|---|
| 🏠 **Landing** | `/` | Hero, análises em destaque, teaser do ranking |
| 🔍 **Busca** | `/buscar` | Três dropdowns em cascata: marca → modelo → ano/combustível |
| 📊 **Ficha** | `/carro/[fipeCode]` | Preço FIPE, curva de depreciação, recalls, roubo, consumo, **veredito** |
| ⚖️ **Comparador** | `/comparar?a=&b=` | Duas fichas lado a lado, vencedor por métrica |
| 🏆 **Ranking** | `/ranking` | Depreciação por segmento, atualizado mensalmente |
| 🔖 **Favoritos** | `/favoritos` | Watchlist persistida em `localStorage` |

---

## 🧪 Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | **Next.js 16** (App Router, Webpack build) | SSG + Server Components + ISR-ready |
| Runtime | **Node.js 24 LTS** | Default na Vercel |
| Linguagem | **TypeScript** (strict) | Sem `any`. Sem `ignoreBuildErrors` |
| Styling | **Tailwind CSS 4** + **shadcn/ui** + Radix | Design system pronto |
| Tipografia | **Geist Sans** (UI) + **Geist Mono** (números) | Família única, performance Vercel-native |
| FIPE | **`fipe-promise` v2** | Acesso oficial à `fipe.parallelum.com.br/api/v2` |
| Data fetching | **TanStack Query v5** + **`unstable_cache`** | Cache cliente + servidor (24h por ficha) |
| State global | **Zustand v5** + `persist` middleware | Watchlist em `localStorage` |
| Charts | **Recharts** | Curva de depreciação |
| PWA | **Serwist** | Service worker + offline + manifesto |
| Telemetria | **Vercel Analytics** + **Speed Insights** | Sem custo no Hobby |

---

## 🎨 Identidade visual — Tesla / Automotive

```
Background        ████████   #000000
Card              ▓▓▓▓▓▓▓▓   #0A0A0A
Border            ░░░░░░░░   rgba(255,255,255,0.06)

Primary (blue)    ████████   #3B82F6
Hover             ████████   #60A5FA
Cyan accent       ████████   #22D3EE

Good              ████████   #10B981
Caution           ████████   #F59E0B
Bad               ████████   #EF4444

Text              ████████   #FAFAFA primary
                  ████████   #A1A1AA secondary
                  ████████   #52525B tertiary
```

**Motivos**: ornamento dotted `●●●`, divisor fino `⎯⎯⎯`, raio elétrico `⚡` (único emoji do design language).

**Tipografia regra**: tudo numérico (preço, %, km/l, ano, código FIPE) usa Geist Mono. Tudo textual usa Geist Sans.

---

## 🛡️ Hardening incluso

### Segurança (`next.config.mjs`)

- `Content-Security-Policy` restritiva (script-src, style-src, img-src, connect-src; `frame-ancestors 'none'`, `object-src 'none'`)
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Powered-By` removido

### SEO 100%

- `metadataBase` + título com template (`%s · Fipou`)
- OpenGraph + Twitter Card por rota
- **OG image dinâmico** via `next/og`: 1 imagem da landing + 1 por veículo (`/carro/[fipeCode]/opengraph-image`), todos pré-renderizados em build
- `sitemap.xml` auto-gerado (rotas estáticas + todas as fichas via `generateStaticParams`)
- `robots.txt`
- **JSON-LD** structured data: `Organization`, `WebSite` (com SearchAction), `Vehicle` (com `AggregateOffer`, `fuelEfficiency`, propriedades adicionais)
- Canonical URLs em todas as rotas
- `lang="pt-BR"`, `colorScheme="dark"`
- Skip link de acessibilidade

### PWA

- `manifest.webmanifest` gerado via `app/manifest.ts`
- Service worker via **Serwist** com fallback `/offline`
- `Service-Worker-Allowed: /` header
- Atalhos de manifesto (Buscar, Ranking, Favoritos)
- Ícones light/dark, Apple touch icon, maskable icon

### Performance

- Geist Sans + Geist Mono com `display: 'swap'`
- `optimizePackageImports` para Lucide, Recharts, Radix
- AVIF + WebP automáticos (`next/image`)
- `productionBrowserSourceMaps: false`
- 24 dias de cache HTTP em assets
- Loading skeletons em rotas dinâmicas (`loading.tsx`)
- Prefetch em todos os `<Link>` críticos
- `<a href="#main">` skip link

### Resiliência

- TanStack Query com retry exponencial (`min(2^n × 1s, 30s)`)
- Não retry em 4xx
- `refetchOnWindowFocus: false`
- `staleTime` por endpoint (5min para listas dinâmicas, 1h para fichas, 1d para marcas)
- Zustand `persist` com versão de schema

---

## 🏗️ Arquitetura

```
app/
├── layout.tsx                  ← fonts, providers, metadata, JSON-LD wiring
├── providers.tsx               ← QueryClient + Devtools
├── page.tsx                    ← landing (Server Component)
├── buscar/
│   ├── layout.tsx              ← metadata isolada (página é Client)
│   ├── page.tsx                ← cascading selects + TanStack hooks
│   └── loading.tsx
├── carro/[fipeCode]/
│   ├── page.tsx                ← SSG via generateStaticParams
│   ├── loading.tsx
│   └── opengraph-image.tsx     ← OG image SSG por veículo
├── comparar/                   ← idem
├── ranking/                    ← idem
├── favoritos/                  ← consome Zustand store
├── offline/                    ← fallback do Service Worker
├── not-found.tsx
├── sitemap.ts                  ← inclui todas as fichas
├── robots.ts
├── manifest.ts
├── opengraph-image.tsx         ← OG image da landing
└── sw.ts                       ← Serwist service worker
components/
├── ui/                         ← shadcn primitives
├── structured-data.tsx         ← JSON-LD components
├── watchlist-button.tsx
├── vehicle-card.tsx
├── depreciation-chart.tsx
├── mono-number.tsx
├── dotted-header.tsx
├── divider-line.tsx
├── verdict-bullet.tsx
└── spark-bars.tsx
lib/
├── api/
│   ├── fipe.ts                 ← cliente real fipe-promise (env-agnostic)
│   ├── fipe-server.ts          ← wrappers com unstable_cache (24h)
│   └── types.ts                ← Vehicle, Brand, Model, Year, enrichment
├── queries/
│   ├── keys.ts                 ← factory de query keys
│   └── hooks.ts                ← useBrands, useModels, useYears, useVehicle, useVehiclesBatch
├── stores/
│   └── watchlist.ts            ← Zustand persistido em localStorage
├── featured.ts                 ← FIPE codes verificados pra SSG (11 carros)
├── enrichment.ts               ← segment/consumo/recall/roubo por FIPE code (mock até Senacon/INMETRO/Susep)
├── analytics.ts                ← calculateRetention4y, getCurrentPrice, etc.
├── verdict.ts                  ← engine determinístico de veredito
├── format.ts                   ← pt-BR Intl helpers (BRL, %, km/l, datas)
├── seo.ts                      ← site config + helpers de URL
└── utils.ts                    ← cn() do shadcn
```

---

## 🟢 O que é REAL hoje vs MOCK

| Fonte | Status | Detalhes |
|---|---|---|
| **Preço FIPE** atual | ✅ Real | `fipe.parallelum.com.br/api/v2` via `fipe-promise` |
| **Curva de depreciação** | ✅ Real | Todos os anos do modelo + zero-km (cross-sectional) |
| **Marca, modelo, fuel** | ✅ Real | Catálogo oficial da FIPE |
| **Referência mensal** | ✅ Real | Vem do `referenceMonth` da API |
| **Recalls** | ✅ Real | Senacon/MJ (`dados.mj.gov.br`) — 95 recalls veiculares ingeridos, 18 marcas |
| **Consumo (km/l)** | ✅ Snapshot | INMETRO PBE Veicular, estruturado por marca/modelo |
| **Índice de roubo** | ✅ Snapshot | Susep/SSP, ranking por modelo+estado |
| **Contexto econômico** | ✅ Real | BCB SGS — IPCA 12m (série 13522) + Selic (série 432), server-side cacheado 24h |
| **Custo de oportunidade** | ✅ Real | Veredito compara depreciação a.a. × Selic |
| **Segmento** | 🟡 Curado/heurística | Tabela conhecida + inferência por regex no nome |
| **Histórico mensal** | ❌ Não | Free tier FIPE só serve mês atual; roadmap = snapshots próprios |

> **Sobre "ajuste pela inflação":** a curva de depreciação é cross-sectional (todos os anos no mesmo mês de referência), então **já está em reais constantes** — não há o que deflacionar hoje. O `deflate()` em `lib/api/bcb.ts` está pronto pra quando os snapshots históricos existirem. Por ora o IPCA entra como contexto macro + custo de oportunidade (Selic).

### Como o enrichment funciona (3 camadas)

`lib/enrichment.ts → getEnrichment()` combina, em ordem de prioridade:

1. **Curado** (`KNOWN` map) — valores verificados à mão, autoritativos para os carros em destaque (modelos novos que os datasets oficiais defasados não cobrem)
2. **Datasets oficiais** — Senacon (recalls), INMETRO (consumo), Susep (roubo), casados por marca + palavra-chave do modelo
3. **Heurística** — inferência de segmento + baseline de retenção por segmento

Os dados ficam em `lib/enrichment/data/*.json` (snapshots commitados → zero dependência de gov em runtime, cabe no free tier). Regenere com:

```bash
pnpm ingest:recalls   # baixa CSVs da Senacon e reescreve recalls.json (REAL, funciona)
pnpm ingest:fuel      # pipeline INMETRO PBE Veicular (documentado em scripts/)
pnpm ingest:theft     # pipeline Susep AUTOSEG (documentado em scripts/)
pnpm ingest           # roda os três
```

## 🔌 Roadmap restante

| Fonte | Onde plugar | Estratégia |
|---|---|---|
| **INMETRO PBEV** (automatizar) | `scripts/ingest-fuel-economy.mjs` | Parser do ODS/PDF anual → reescreve `fuel-economy.json` |
| **Susep AUTOSEG** (automatizar) | `scripts/ingest-theft.mjs` | Parser da base AUTOSEG → reescreve `theft.json` |
| **Snapshots mensais** | Vercel Cron + Neon Postgres | `app/api/cron/snapshot/route.ts` dia 1 de cada mês; aí o `deflate()` do BCB passa a ajustar preços históricos |
| **fipe.online token** | `process.env.FIPE_TOKEN` | Opcional, libera histórico extendido na FIPE API |

A interface do `lib/api/fipe.ts` + `lib/enrichment.ts` foi desenhada pra que cada fonte entre como um módulo de enriquecimento sem mexer nas páginas existentes.

---

## 🚀 Subindo no Vercel (Hobby / free tier)

Tudo aqui cabe no plano **gratuito**:

| Serviço | Free tier | Uso esperado |
|---|---|---|
| Vercel Hobby | 100 GB-h Functions/mês | Sobra muito |
| Vercel Cron | Jobs diários | 1 cron mensal de snapshot (quando vier API real) |
| Vercel Analytics | Ilimitado | ✓ |
| Speed Insights | Ilimitado | ✓ |
| Neon Postgres (Marketplace) | 0,5 GB | ~30 meses de snapshots |
| Upstash Redis (Marketplace) | 256 MB · 10k cmd/dia | Sobra |

**Pré-deploy checklist:**
- [ ] Configurar `NEXT_PUBLIC_SITE_URL` no painel da Vercel (`https://fipou.com.br`)
- [ ] Conferir build local: `pnpm build`
- [ ] Conectar domínio `fipou.com.br`
- [ ] Habilitar Speed Insights + Analytics (já estão wiring-ready)

---

## 💻 Desenvolvimento local

```bash
# Pré-requisitos: Node 24, pnpm 10
pnpm install
pnpm dev          # http://localhost:3000

# Validações
pnpm typecheck    # tsc --noEmit
pnpm build        # build de produção (webpack)
pnpm start        # roda o build local

# Lint
pnpm lint
```

> ℹ️ **Dev usa Turbopack** (mais rápido), **build usa Webpack** (Serwist requer). O Service Worker fica desabilitado em desenvolvimento.

---

## 🗺️ Roadmap

### 🟢 Pronto no MVP

- [x] 6 rotas estáticas + dinâmicas
- [x] Veredito determinístico (regras)
- [x] Watchlist com `localStorage`
- [x] PWA com offline fallback
- [x] OG images por veículo
- [x] JSON-LD `Vehicle` + `Organization` + `WebSite`
- [x] Headers de segurança (CSP, HSTS, etc.)
- [x] TanStack Query com retry exponencial
- [x] Sitemap automático

### 🟡 Próximo (sem custo)

- [ ] Cliente FIPE real (`fipe.parallelum.com.br/api/v2`)
- [ ] ETL mensal de snapshot de preços → Neon Postgres
- [ ] Recalls da Senacon (CSV de gov.br, atualização mensal)
- [ ] Consumo INMETRO PBEV
- [ ] Índice de roubo Susep
- [ ] IPCA-adjusted depreciação (BCB SGS)
- [ ] Histórico mês-a-mês acumulado a partir do primeiro snapshot

### 🔵 Depois (com receita)

- [ ] Veredito narrativo via **Vercel AI Gateway** (`anthropic/claude-haiku-4-5`)
- [ ] Token pago de **fipe.online** → histórico FIPE 2005-presente
- [ ] Integração placa → ficha (API Brasil / Apicar)
- [ ] Listagens reais de mercado (Mercado Livre API)
- [ ] API pública para devs com chaves + rate limit

---

## 📚 Fontes oficiais

| Fonte | Uso |
|---|---|
| **FIPE** (via `parallelum.com.br/api/v2`) | Preço de referência mensal |
| **Senacon** (`dados.gov.br`) | Recalls automotivos |
| **INMETRO PBEV** | Consumo veicular |
| **Susep** | Índice de roubo/furto |
| **BCB Olinda** (SGS) | IPCA e câmbio para ajuste real |

Nada de scraping. Apenas APIs oficiais e datasets públicos.

---

## 📄 Licença

Privado — todos os direitos reservados.

---

<div align="center">

**fipou.com.br** · fontes: FIPE · Senacon · INMETRO · Susep · BCB · 2026

⚡

</div>
