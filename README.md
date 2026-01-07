# Prophet Trader Migration Kit - Go → Next.js

Kit complet de migration du système de trading autonome Claude Prophet de Go vers Next.js/TypeScript.

## 📦 Contenu

### Documents principaux

1. **00-PROJECT-OVERVIEW.md** - Vue d'ensemble et objectifs
2. **01-ARCHITECTURE-ANALYSIS.md** - Analyse détaillée de l'architecture Go (667 lignes)
3. **02-TECH-STACK-MAPPING.md** - Correspondances techniques Go ↔ Next.js (833 lignes)
4. **03-DATABASE-SCHEMA.md** - Schéma Prisma complet avec exemples (750 lignes)
5. **04-API-SPECIFICATIONS.md** - Spécifications de toutes les API routes
6. **05-SERVICES-SPECS.md** - Specifications des services métier
7. **08-DEVELOPMENT-PHASES.md** - Plan de développement en 6 phases

### Dossier prompts/

- **PHASE-1-PROMPTS.md** - Prompts prêts à l'emploi pour démarrer

## 🎯 Objectif

Créer une reproduction complète et fidèle du projet [Claude Prophet](https://github.com/JakeNesler/Claude_Prophet) en Next.js, pour être utilisé :
1. Comme exercice de développement avec l'IA
2. Potentiellement comme matériel de formation

## 🚀 Quick Start pour une IA

### Étape 1 : Comprendre l'existant

```
Lis dans l'ordre :
1. 00-PROJECT-OVERVIEW.md (contexte général)
2. 01-ARCHITECTURE-ANALYSIS.md (comprendre le code Go)
3. 02-TECH-STACK-MAPPING.md (équivalences techniques)
```

### Étape 2 : Préparer le projet

```
Lis :
- 03-DATABASE-SCHEMA.md (structure de données)
- 08-DEVELOPMENT-PHASES.md (plan d'exécution)
```

### Étape 3 : Commencer le développement

```
Exécute les prompts dans :
- prompts/PHASE-1-PROMPTS.md

Puis continue avec les phases suivantes
```

## 📊 Métriques du projet original

- **Langage** : Go
- **Lignes de code** : 3,623
- **Fonctions** : 152
- **Types** : 80
- **Packages** : 8
- **Complexité moyenne** : 3.3

## 🏗️ Architecture cible

```
Next.js 14 + TypeScript
├── API Routes (Backend)
│   ├── Trading (Alpaca)
│   ├── Intelligence (Claude AI)
│   ├── Vector Search (pgvector)
│   └── Activity Logging
├── Services Layer
│   ├── AlpacaTradingService
│   ├── ClaudeService
│   ├── PositionManager
│   └── VectorSearchService
├── Database (Prisma + PostgreSQL)
│   ├── Orders, Positions
│   ├── News, Analysis
│   └── Vector Embeddings
└── MCP Server (Node.js)
    └── 40+ tools pour Claude Code
```

## 📋 Checklist globale

### Phase 1 : Core Trading (Semaine 1)
- [ ] Setup Next.js + TypeScript
- [ ] Integration Alpaca API
- [ ] API routes trading
- [ ] Tests unitaires

### Phase 2 : Intelligence (Semaine 2)
- [ ] Integration Claude
- [ ] News aggregation
- [ ] Technical analysis
- [ ] Stock analysis API

### Phase 3 : Position Management (Semaine 3)
- [ ] Managed positions
- [ ] Stop-loss/Take-profit
- [ ] Monitoring automation

### Phase 4 : Vector Search (Semaine 3)
- [ ] pgvector setup
- [ ] Embeddings generation
- [ ] Semantic search

### Phase 5 : MCP Integration (Semaine 4)
- [ ] MCP server
- [ ] 40+ tools
- [ ] Claude Code integration

### Phase 6 : Frontend (Optionnel, Semaine 5)
- [ ] Dashboard UI
- [ ] Real-time updates
- [ ] Order forms

## ⚠️ Avertissements

1. **Paper trading uniquement** - Ne jamais utiliser avec de vrais fonds
2. **Reproduction fidèle** - Suivre exactement la logique Go
3. **Type-safe** - TypeScript strict mode obligatoire
4. **Testable** - Tests pour chaque composant critique
5. **Production-ready** - Code maintenable et documenté

## 🔗 Références

- **Repo Go original** : https://github.com/JakeNesler/Claude_Prophet
- **Article Medium** : Jake Nesler - "I gave Claude Code 100k to trade..."
- **Alpaca API** : https://alpaca.markets/docs/
- **Claude API** : https://docs.anthropic.com
- **Next.js Docs** : https://nextjs.org/docs

## 📝 Notes

- Total documentation : ~4000+ lignes
- Temps estimé : 3-5 semaines (sans frontend) ou 4-6 semaines (avec)
- Prérequis : Connaissance de TypeScript, Next.js, API REST

## 🎓 Usage

### Pour une IA autonome :

```
1. Charge tous les fichiers .md dans ton contexte
2. Commence par PHASE-1-PROMPTS.md
3. Exécute chaque prompt séquentiellement
4. Valide avec les checklists
5. Passe à la phase suivante
```

### Pour un développeur humain :

```
1. Lis 00-PROJECT-OVERVIEW.md
2. Clone le repo Go pour référence
3. Suis 08-DEVELOPMENT-PHASES.md
4. Utilise les prompts comme guide
5. Adapte selon tes besoins
```

## 📧 Support

Pour toute question sur ce kit de migration, référer à :
- Documentation complète dans chaque fichier .md
- Code Go original pour la référence
- Spécifications Alpaca/Claude pour les APIs

---

**Bonne migration ! 🚀**
