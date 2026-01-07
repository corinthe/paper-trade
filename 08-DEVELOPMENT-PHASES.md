# Plan de développement par phases

## Phase 1 : Setup & Core Trading (Semaine 1)

### Objectifs
- Projet Next.js fonctionnel
- Intégration Alpaca de base
- APIs trading essentielles

### Tâches
1. Setup projet
   ```bash
   npx create-next-app@latest prophet-trader-nextjs --typescript
   cd prophet-trader-nextjs
   npm install @alpacahq/alpaca-trade-api @prisma/client zod
   ```

2. Configuration
   - `.env.local` avec credentials Alpaca
   - Prisma init + schema de base
   - TypeScript config strict

3. Services Alpaca
   - `lib/services/alpaca/trading.ts`
   - `lib/services/alpaca/data.ts`
   - Tests avec paper trading

4. API Routes
   - `/api/trading/account` 
   - `/api/trading/positions`
   - `/api/trading/orders`

5. Validation
   - Schémas Zod pour inputs
   - Error handling standard

**Livrable** : API fonctionnelle pour trading de base

---

## Phase 2 : Intelligence & AI (Semaine 2)

### Objectifs
- Intégration Gemini
- News aggregation
- Stock analysis

### Tâches
1. Service Gemini
   - `lib/services/gemini.ts`
   - News cleaning
   - Stock analysis

2. Service News
   - `lib/services/news.ts`
   - RSS parsing (MarketWatch)
   - Google News search

3. Technical Analysis
   - `lib/services/analysis/technical.ts`
   - RSI, MACD, Bollinger Bands
   - Support/Resistance

4. API Routes
   - `/api/intelligence/news/quick`
   - `/api/intelligence/stocks/analyze`

**Livrable** : Intelligence endpoints fonctionnels

---

## Phase 3 : Position Management (Semaine 3)

### Objectifs
- Managed positions
- Stop-loss/Take-profit automatiques
- Monitoring

### Tâches
1. Position Manager
   - `lib/services/positions.ts`
   - Create/Update/Close managed positions
   - Monitoring loop

2. Database
   - Table ManagedPosition
   - Tracking status

3. API Routes
   - `/api/positions/managed`
   - `/api/positions/managed/[id]`

4. Cron Job (Vercel)
   - Monitoring task every 10s

**Livrable** : Position automation complète

---

## Phase 4 : Vector Search & Memory (Semaine 3)

### Objectifs
- Embeddings
- Recherche sémantique
- Trade history

### Tâches
1. Embedding Service
   - `lib/services/embeddings.ts`
   - Gemini embeddings API

2. Vector DB
   - pgvector extension
   - Index creation

3. Vector Search Service
   - `lib/services/vector-search.ts`
   - Store decisions
   - Find similar

4. API Routes
   - `/api/vector/store`
   - `/api/vector/search`
   - `/api/vector/stats`

**Livrable** : AI memory fonctionnelle

---

## Phase 5 : MCP Integration (Semaine 4)

### Objectifs
- 40+ MCP tools
- Claude Code integration

### Tâches
1. MCP Server
   - `mcp-server/server.ts`
   - Adapter le JS original
   - Tools definitions

2. Tool Handlers
   - Mapping vers API routes
   - Error handling
   - Response formatting

3. Configuration
   - `.mcp.json`
   - Claude Code setup

**Livrable** : MCP server opérationnel

---

## Phase 6 : Frontend (Optionnel, Semaine 5)

### Objectifs
- Dashboard UI
- Real-time data
- Order forms

### Tâches
1. UI Components (shadcn/ui)
   - Account summary
   - Positions list
   - Order form
   - News feed

2. Pages
   - `/dashboard`
   - `/positions`
   - `/history`

3. Real-time Updates
   - Polling ou WebSocket
   - Auto-refresh

**Livrable** : Interface utilisateur complète

---

## Checklist par phase

### Phase 1 ✓
- [ ] Projet Next.js créé
- [ ] Alpaca client fonctionne
- [ ] GET /api/trading/account → 200
- [ ] GET /api/trading/positions → 200
- [ ] POST /api/trading/orders → 200
- [ ] Paper trading testé

### Phase 2 ✓
- [ ] Gemini API configurée
- [ ] News fetch MarketWatch
- [ ] Technical indicators calculés
- [ ] GET /api/intelligence/news/quick → 200
- [ ] POST /api/intelligence/stocks/analyze → 200

### Phase 3 ✓
- [ ] Position manager créé
- [ ] Monitoring loop actif
- [ ] Stop-loss trigger testé
- [ ] POST /api/positions/managed → 200
- [ ] DELETE /api/positions/managed/[id] → 200

### Phase 4 ✓
- [ ] pgvector installé
- [ ] Embeddings générés
- [ ] Vector search fonctionne
- [ ] POST /api/vector/store → 200
- [ ] POST /api/vector/search → résultats pertinents

### Phase 5 ✓
- [ ] MCP server démarre
- [ ] Claude Code connecté
- [ ] 40+ tools exposés
- [ ] Test end-to-end via Claude

### Phase 6 ✓
- [ ] Dashboard affiche account
- [ ] Positions list temps réel
- [ ] Order form fonctionnel
- [ ] News feed intégré

---

## Stratégie de test

### Par phase
1. Tests unitaires (Vitest)
2. Tests d'intégration (API routes)
3. Tests E2E (Playwright - optionnel)

### Continuous
- Lint (ESLint)
- Type-check (tsc)
- Format (Prettier)

---

## Déploiement progressif

### Dev
- Local avec `npm run dev`
- Vercel Preview per PR

### Staging
- Branch `staging` → Vercel staging environment
- Tests manuels

### Production
- Branch `main` → Vercel production
- Monitoring actif

---

## Timeline estimée

| Phase | Durée | Dépendances |
|-------|-------|-------------|
| 1 - Core Trading | 5-7 jours | Aucune |
| 2 - Intelligence | 5-7 jours | Phase 1 |
| 3 - Position Mgmt | 3-5 jours | Phase 1 |
| 4 - Vector Search | 3-5 jours | Phase 2 |
| 5 - MCP | 3-5 jours | Toutes |
| 6 - Frontend | 5-7 jours | Optionnel |

**Total** : 3-5 semaines (sans frontend) ou 4-6 semaines (avec)

---

## Ordre recommandé

1. Phase 1 (obligatoire - fondations)
2. Phase 2 (intelligence nécessaire pour décisions)
3. Phase 3 + 4 en parallèle (indépendantes)
4. Phase 5 (intégration finale)
5. Phase 6 (optionnel, cosmétique)

---

## Points de contrôle qualité

Après chaque phase :
- [ ] Tous les tests passent
- [ ] Code review (même solo)
- [ ] Documentation à jour
- [ ] Démo fonctionnelle
- [ ] Git tag pour la phase

