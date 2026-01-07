# Spécifications complètes des APIs

Ce document contient les spécifications de toutes les API routes à créer dans Next.js.

## Structure des APIs

```
app/api/
├── trading/
│   ├── account/route.ts
│   ├── positions/route.ts
│   ├── positions/[symbol]/route.ts
│   ├── orders/route.ts
│   ├── orders/[id]/route.ts
│   └── orders/options/route.ts
├── positions/
│   ├── managed/route.ts
│   └── managed/[id]/route.ts
├── market/
│   ├── quote/[symbol]/route.ts
│   ├── bars/[symbol]/route.ts
│   ├── snapshot/[symbol]/route.ts
│   └── options/chain/route.ts
├── intelligence/
│   ├── news/quick/route.ts
│   ├── news/search/route.ts
│   ├── news/analyze/route.ts
│   └── stocks/analyze/route.ts
├── vector/
│   ├── store/route.ts
│   ├── search/route.ts
│   └── stats/route.ts
├── activity/
│   ├── log/route.ts
│   ├── logs/route.ts
│   └── decision/route.ts
└── utils/
    ├── datetime/route.ts
    └── wait/route.ts
```

## Référence complète : Voir fichier Go original

Pour les spécifications détaillées de chaque endpoint, référer aux controllers Go :
- `controllers/order_controller.go`
- `controllers/position_management.go`
- `controllers/intelligence_controller.go`
- `controllers/news_controller.go`
- `controllers/activity_controller.go`

## Pattern de réponse standard

Tous les endpoints suivent ce pattern :

```typescript
// Success
NextResponse.json({
  data: result,
  meta: {
    timestamp: new Date().toISOString(),
    request_id: crypto.randomUUID(),
  }
})

// Error
NextResponse.json({
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable message',
    details: validationErrors, // optionnel
  }
}, { status: 400/500 })
```

## Validation avec Zod

Chaque endpoint valide son input :

```typescript
import { z } from 'zod'

const OrderSchema = z.object({
  symbol: z.string().regex(/^[A-Z]{1,5}$/),
  qty: z.number().positive(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  limit_price: z.number().positive().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const validated = OrderSchema.parse(body) // throws si invalide
  
  // Process order...
}
```

## Exemple complet : Trading Account

```typescript
// app/api/trading/account/route.ts
import { NextResponse } from 'next/server'
import { AlpacaService } from '@/lib/services/alpaca'
import { logger } from '@/lib/utils/logger'

export async function GET(request: Request) {
  try {
    const alpaca = new AlpacaService()
    const account = await alpaca.getAccount()
    
    return NextResponse.json({
      data: {
        equity: parseFloat(account.equity),
        cash: parseFloat(account.cash),
        buying_power: parseFloat(account.buying_power),
        portfolio_value: parseFloat(account.portfolio_value),
        pattern_day_trader: account.pattern_day_trader,
        daytrade_count: account.daytrade_count,
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: crypto.randomUUID(),
      }
    })
  } catch (error) {
    logger.error('Failed to fetch account', error as Error)
    
    return NextResponse.json({
      error: {
        code: 'ACCOUNT_FETCH_FAILED',
        message: 'Failed to retrieve account information',
      }
    }, { status: 500 })
  }
}
```

## Mapping complet des endpoints Go → Next.js

Voir `01-ARCHITECTURE-ANALYSIS.md` pour la liste complète des 48 fonctions de controllers à implémenter.

Chaque fonction Go correspond à une route Next.js avec la même logique métier.
