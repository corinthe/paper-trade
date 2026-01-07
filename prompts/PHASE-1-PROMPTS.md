# Prompts pour Phase 1 : Core Trading

## Prompt 1 : Setup Initial

```
Je veux créer un projet Next.js 14 avec TypeScript pour répliquer un système de trading.

Crée la structure de base :
1. Projet Next.js avec App Router
2. Configuration TypeScript strict mode
3. Installation des dépendances :
   - @alpacahq/alpaca-trade-api
   - @prisma/client
   - zod
   - tailwindcss

Génère :
- next.config.js optimisé
- tsconfig.json strict
- .env.example avec les variables nécessaires
- .gitignore approprié
- README.md avec instructions de setup
```

---

## Prompt 2 : AlpacaTradingService

```
Crée un service TypeScript pour intégrer l'API Alpaca Markets.

Fichier : lib/services/alpaca/trading.ts

Exigences :
- Classe AlpacaTradingService
- Méthodes :
  - getAccount(): Promise<Account>
  - getPositions(): Promise<Position[]>
  - placeOrder(params: OrderParams): Promise<Order>
  - cancelOrder(orderId: string): Promise<void>

- Configuration depuis environment variables
- Gestion d'erreurs avec try/catch
- Retry logic avec backoff exponentiel (max 3 tentatives)
- Logging structuré (JSON format)
- Types TypeScript stricts

Utilise la librairie @alpacahq/alpaca-trade-api v3.

Génère aussi :
- Types TypeScript pour Account, Position, Order
- Fichier de tests unitaires avec Vitest
```

---

## Prompt 3 : API Route /api/trading/account

```
Crée une API Route Next.js pour récupérer les informations du compte de trading.

Fichier : app/api/trading/account/route.ts

Spécifications :
- Endpoint GET uniquement
- Utilise AlpacaTradingService
- Format de réponse :
  {
    data: {
      equity: number,
      cash: number,
      buying_power: number,
      portfolio_value: number,
      pattern_day_trader: boolean,
      daytrade_count: number
    },
    meta: {
      timestamp: string (ISO),
      request_id: string (UUID)
    }
  }

- Gestion d'erreurs avec codes HTTP appropriés
- Logging de chaque requête
- CORS headers si nécessaire
- Rate limiting basique (optionnel)

Error format :
  {
    error: {
      code: string,
      message: string
    }
  }

Ajoute aussi un middleware de logging si pertinent.
```

---

## Prompt 4 : Validation Zod pour Orders

```
Crée des schémas de validation Zod pour les ordres de trading.

Fichier : lib/schemas/order.ts

Schémas à créer :
1. OrderSchema - ordre stock basique
2. OptionsOrderSchema - ordre d'options
3. ManagedPositionSchema - position managée

OrderSchema doit valider :
- symbol: string (1-5 lettres majuscules)
- qty: number positive
- side: enum ['buy', 'sell']
- type: enum ['market', 'limit', 'stop', 'stop_limit']
- time_in_force: enum ['day', 'gtc', 'ioc', 'fok']
- limit_price: number positive (requis si type = 'limit')
- stop_price: number positive (requis si type contient 'stop')

Génère aussi :
- Types TypeScript inférés depuis Zod
- Fonction helper pour valider + formater errors
- Tests unitaires pour chaque schéma
```

---

## Prompt 5 : Error Handling Standard

```
Crée un système d'error handling centralisé pour l'application.

Fichiers à créer :
1. lib/errors/trading-error.ts - Classes d'erreurs custom
2. lib/utils/error-handler.ts - Handler pour API routes
3. middleware.ts - Middleware global de catch errors

Classes d'erreurs :
- TradingError (base)
  - AlpacaError (erreurs API Alpaca)
  - ValidationError (erreurs Zod)
  - RateLimitError
  - InsufficientFundsError
  - InvalidSymbolError

Error handler doit :
- Convertir erreurs en réponses HTTP standard
- Logger toutes les erreurs
- Masquer les détails sensibles en production
- Ajouter request_id pour tracking

Génère aussi :
- Types pour error responses
- Tests pour chaque type d'erreur
```

---

## Prompt 6 : Tests d'intégration API

```
Crée des tests d'intégration pour les API routes de trading.

Fichier : __tests__/api/trading.test.ts

Tests à couvrir :
1. GET /api/trading/account
   - Success case (200)
   - Alpaca API down (500)
   - Invalid credentials (401)

2. GET /api/trading/positions
   - Success avec positions (200)
   - Success sans positions (200)
   - Error handling (500)

3. POST /api/trading/orders
   - Success order placement (201)
   - Validation errors (400)
   - Insufficient funds (400)
   - Invalid symbol (400)

Setup :
- Mock Alpaca API avec msw ou nock
- Fixtures pour responses
- Cleanup après chaque test

Framework : Vitest avec @testing-library/react si nécessaire
```

---

## Checklist Phase 1

Après avoir exécuté tous ces prompts :

- [ ] `npm install` fonctionne sans erreurs
- [ ] `npm run dev` démarre le serveur
- [ ] GET http://localhost:3000/api/trading/account retourne 200
- [ ] GET http://localhost:3000/api/trading/positions retourne 200  
- [ ] POST http://localhost:3000/api/trading/orders avec body valide retourne 201
- [ ] Tests unitaires passent : `npm test`
- [ ] TypeScript compile : `npm run build`
- [ ] Lint passe : `npm run lint`

---

## Prompt final : Documentation Phase 1

```
Génère une documentation complète pour Phase 1.

Fichier : docs/phase-1-complete.md

Inclure :
- Architecture overview (diagramme mermaid)
- Liste de tous les fichiers créés
- Guide d'utilisation des APIs
- Exemples de requêtes curl
- Troubleshooting commun
- Next steps pour Phase 2
```
