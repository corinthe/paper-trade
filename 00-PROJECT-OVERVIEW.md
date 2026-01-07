# Prophet Trader - Migration Go → Next.js

## Contexte
Reproduction complète du projet Claude Prophet (Go) en Next.js/TypeScript.

**Repo original** : https://github.com/JakeNesler/Claude_Prophet

## Objectif
Créer un système de trading autonome pilotable via Claude Code (MCP) avec :
- API de trading (Alpaca)
- Analyse de news (Gemini AI)
- Recherche sémantique (Vector DB)
- Position management
- Activity logging

## Stack technique cible

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 14+ (App Router) |
| Langage | TypeScript |
| Runtime Backend | Node.js (Vercel Serverless) |
| Base de données | PostgreSQL (Vercel Postgres ou Supabase) |
| Vector Search | pgvector extension |
| Trading API | Alpaca Markets |
| AI Analysis | Google Gemini |
| MCP Server | @modelcontextprotocol/sdk |
| Frontend UI | React + Tailwind + shadcn/ui |
| ORM | Prisma |
| Validation | Zod |
| Déploiement | Vercel |

## Métriques du projet Go (référence)

- **Packages** : 8
- **Fonctions** : 152
- **Types** : 80
- **Lignes de code** : 3,623
- **Complexité moyenne** : 3.3

## Scope fonctionnel

### Phase 1 : Core Trading
- [ ] Client Alpaca
- [ ] Account management
- [ ] Positions tracking
- [ ] Order execution (market, limit, options)
- [ ] Error handling & retry

### Phase 2 : Intelligence
- [ ] News aggregation (MarketWatch, Google News)
- [ ] Gemini AI news cleaning
- [ ] Stock analysis (technical indicators)
- [ ] Market intelligence endpoints

### Phase 3 : Position Management
- [ ] Managed positions avec stop-loss/take-profit
- [ ] Monitoring automatique
- [ ] Auto-close sur conditions

### Phase 4 : Memory & Search
- [ ] Activity logging
- [ ] Decision logging
- [ ] Vector embeddings
- [ ] Semantic search sur historique

### Phase 5 : MCP Integration
- [ ] 40+ tools exposés
- [ ] Integration avec Claude Code
- [ ] Request/response handling

### Phase 6 : Frontend (optionnel)
- [ ] Dashboard temps réel
- [ ] Positions display
- [ ] Order form
- [ ] News feed
- [ ] Trade history

## Contraintes

1. **Paper trading uniquement** - Pas de vrai argent
2. **Pas de shortcuts** - Reproduction fidèle des fonctionnalités
3. **Production-ready** - Code maintenable et testé
4. **Type-safe** - TypeScript strict mode
5. **Documented** - JSDoc pour toutes les fonctions publiques

## Livrables attendus

1. Repo Next.js complet et fonctionnel
2. Documentation API (OpenAPI/Swagger)
3. README avec instructions de setup
4. Tests unitaires et d'intégration
5. Configuration Vercel pour déploiement
6. Scripts de seed pour la DB

## Architecture cible

```
prophet-trader-nextjs/
├── app/
│   ├── api/                    # Backend API Routes
│   │   ├── trading/
│   │   ├── market/
│   │   ├── intelligence/
│   │   └── vector/
│   ├── dashboard/              # Frontend pages
│   └── layout.tsx
├── lib/
│   ├── services/               # Business logic
│   ├── db/                     # Database
│   └── utils/
├── components/
│   ├── ui/                     # shadcn/ui
│   └── trading/
├── mcp-server/                 # MCP server
├── prisma/
│   └── schema.prisma
└── public/
```

## Dépendances principales

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@alpacahq/alpaca-trade-api": "^3.0.0",
    "@google/generative-ai": "^0.2.0",
    "@prisma/client": "^5.0.0",
    "@vercel/postgres": "^0.5.0",
    "@modelcontextprotocol/sdk": "latest",
    "zod": "^3.22.0",
    "ai": "^3.0.0"
  }
}
```

## Setup rapide

```bash
# 1. Cloner et installer
git clone <repo>
cd prophet-trader-nextjs
npm install

# 2. Configuration
cp .env.example .env.local
# Remplir les credentials

# 3. Database
npx prisma generate
npx prisma db push

# 4. Lancer
npm run dev
```

## Sécurité

⚠️ **IMPORTANT** : Ce système est pour PAPER TRADING uniquement.

- Ne jamais utiliser avec de vrais fonds
- Credentials stockés en variables d'environnement
- Pas de commit des .env files
- Rate limiting sur toutes les APIs
- Validation stricte des inputs (Zod)

## Resources

- [Alpaca API Docs](https://alpaca.markets/docs/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [MCP Protocol](https://modelcontextprotocol.io)
