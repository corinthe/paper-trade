# Schéma de base de données

## Migration SQLite → PostgreSQL + pgvector

### Pourquoi PostgreSQL ?

1. **pgvector** - Extension native pour vector embeddings
2. **Scalabilité** - Meilleure que SQLite pour production
3. **Vercel Postgres** - Intégration native avec Next.js
4. **Concurrent writes** - SQLite limite les écritures concurrentes
5. **JSON support** - Meilleur que SQLite

## Prisma Schema Complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [vector]
}

// ============================================================================
// TRADING MODELS
// ============================================================================

model Order {
  id                String   @id @default(cuid())
  client_order_id   String?  @unique
  symbol            String
  qty               Float
  side              OrderSide
  type              OrderType
  time_in_force     TimeInForce
  status            OrderStatus
  filled_qty        Float    @default(0)
  filled_avg_price  Float?
  limit_price       Float?
  stop_price        Float?
  extended_hours    Boolean  @default(false)
  submitted_at      DateTime?
  filled_at         DateTime?
  canceled_at       DateTime?
  failed_at         DateTime?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@index([symbol])
  @@index([status])
  @@index([created_at])
}

enum OrderSide {
  buy
  sell
  buy_to_open
  buy_to_close
  sell_to_open
  sell_to_close
}

enum OrderType {
  market
  limit
  stop
  stop_limit
  trailing_stop
}

enum TimeInForce {
  day
  gtc
  ioc
  fok
  opg
  cls
}

enum OrderStatus {
  new
  partially_filled
  filled
  done_for_day
  canceled
  expired
  replaced
  pending_cancel
  pending_replace
  accepted
  pending_new
  accepted_for_bidding
  stopped
  rejected
  suspended
  calculated
}

// ============================================================================

model Position {
  id                String   @id @default(cuid())
  symbol            String   @unique
  asset_id          String?
  exchange          String?
  asset_class       AssetClass
  qty               Float
  avg_entry_price   Float
  current_price     Float?
  market_value      Float?
  cost_basis        Float
  unrealized_pl     Float?
  unrealized_plpc   Float?
  unrealized_intraday_pl   Float?
  unrealized_intraday_plpc Float?
  side              PositionSide
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@index([symbol])
  @@index([asset_class])
}

enum AssetClass {
  us_equity
  us_option
  crypto
}

enum PositionSide {
  long
  short
}

// ============================================================================

model ManagedPosition {
  id                String   @id @default(cuid())
  symbol            String
  qty               Float
  entry_price       Float
  entry_order_id    String?
  stop_loss_pct     Float
  take_profit_pct   Float
  stop_loss_price   Float
  take_profit_price Float
  trailing_stop     Boolean  @default(false)
  status            ManagedPositionStatus
  current_price     Float?
  unrealized_pl     Float?
  unrealized_plpc   Float?
  closed_price      Float?
  closed_reason     String?
  exit_order_id     String?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  closed_at         DateTime?
  
  @@index([symbol])
  @@index([status])
  @@index([created_at])
}

enum ManagedPositionStatus {
  active
  monitoring
  stop_loss_triggered
  take_profit_triggered
  closed
  error
}

// ============================================================================
// MARKET DATA
// ============================================================================

model Bar {
  id         String   @id @default(cuid())
  symbol     String
  timeframe  String
  timestamp  DateTime
  open       Float
  high       Float
  low        Float
  close      Float
  volume     BigInt
  vwap       Float?
  trade_count Int?
  created_at DateTime @default(now())
  
  @@unique([symbol, timeframe, timestamp])
  @@index([symbol, timeframe, timestamp])
}

model Quote {
  id         String   @id @default(cuid())
  symbol     String
  timestamp  DateTime
  bid_price  Float
  bid_size   Int
  ask_price  Float
  ask_size   Int
  conditions String[]
  tape       String?
  created_at DateTime @default(now())
  
  @@index([symbol, timestamp])
}

model Snapshot {
  id           String   @id @default(cuid())
  symbol       String
  latest_trade Json?
  latest_quote Json?
  minute_bar   Json?
  daily_bar    Json?
  prev_daily_bar Json?
  created_at   DateTime @default(now())
  
  @@index([symbol])
}

// ============================================================================
// INTELLIGENCE & ANALYSIS
// ============================================================================

model NewsArticle {
  id            String   @id @default(cuid())
  source        String
  title         String
  url           String   @unique
  author        String?
  published_at  DateTime
  content       String?  @db.Text
  summary       String?  @db.Text
  symbols       String[]
  sentiment     Float?
  relevance     Float?
  created_at    DateTime @default(now())
  
  @@index([published_at])
  @@index([source])
  @@index([symbols])
}

model StockAnalysis {
  id                String   @id @default(cuid())
  symbol            String
  current_price     Float
  technical_analysis Json
  news_sentiment    Json?
  options_flow      Json?
  ai_recommendation Json
  analyzed_at       DateTime @default(now())
  created_at        DateTime @default(now())
  
  @@index([symbol, analyzed_at])
}

// ============================================================================
// VECTOR SEARCH & MEMORY
// ============================================================================

model Decision {
  id              String   @id @default(cuid())
  symbol          String
  action          DecisionAction
  strategy        String
  reasoning       String   @db.Text
  market_context  String?  @db.Text
  confidence      Float?
  entry_price     Float?
  qty             Float?
  stop_loss       Float?
  take_profit     Float?
  result_pct      Float?
  result_dollars  Float?
  embedding       Unsupported("vector(768)")?
  created_at      DateTime @default(now())
  
  @@index([symbol])
  @@index([action])
  @@index([strategy])
  @@index([created_at])
}

enum DecisionAction {
  BUY
  SELL
  HOLD
  CLOSE
  ADJUST
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

model ActivityLog {
  id         String   @id @default(cuid())
  type       ActivityType
  message    String   @db.Text
  metadata   Json?
  created_at DateTime @default(now())
  
  @@index([type])
  @@index([created_at])
}

enum ActivityType {
  TRADE
  ANALYSIS
  DECISION
  ERROR
  INFO
  WARNING
  SYSTEM
}

// ============================================================================
// SYSTEM & CONFIGURATION
// ============================================================================

model SystemConfig {
  key        String   @id
  value      Json
  updated_at DateTime @updatedAt
}

model TradingSession {
  id          String   @id @default(cuid())
  started_at  DateTime @default(now())
  ended_at    DateTime?
  total_trades Int     @default(0)
  total_pnl   Float    @default(0)
  win_rate    Float?
  metadata    Json?
  
  @@index([started_at])
}
```

## Migrations SQL

### Migration initiale

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enums (Prisma les génère automatiquement)

-- Create tables (Prisma les génère automatiquement)

-- Vector index pour embeddings
CREATE INDEX ON "Decision" 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Indexes supplémentaires pour performance
CREATE INDEX idx_orders_symbol_status ON "Order"(symbol, status);
CREATE INDEX idx_decisions_symbol_action ON "Decision"(symbol, action);
CREATE INDEX idx_bars_symbol_timestamp ON "Bar"(symbol, timestamp DESC);
```

### Migration ajout de colonnes

```sql
-- Ajouter une colonne pour trailing stop percentage
ALTER TABLE "ManagedPosition" 
  ADD COLUMN trailing_stop_pct FLOAT;

-- Ajouter index
CREATE INDEX idx_managed_position_trailing 
  ON "ManagedPosition"(trailing_stop) 
  WHERE trailing_stop = true;
```

## Prisma Client Usage

### Basic CRUD

```typescript
import { prisma } from '@/lib/db/client'

// Create
const order = await prisma.order.create({
  data: {
    symbol: 'AAPL',
    qty: 10,
    side: 'buy',
    type: 'market',
    time_in_force: 'day',
    status: 'new',
  }
})

// Read
const orders = await prisma.order.findMany({
  where: {
    symbol: 'AAPL',
    status: 'filled',
  },
  orderBy: {
    created_at: 'desc',
  },
  take: 10,
})

// Update
await prisma.order.update({
  where: { id: orderId },
  data: {
    status: 'filled',
    filled_qty: 10,
    filled_avg_price: 150.50,
  }
})

// Delete
await prisma.order.delete({
  where: { id: orderId }
})
```

### Transactions

```typescript
await prisma.$transaction(async (tx) => {
  // Créer l'ordre
  const order = await tx.order.create({
    data: orderData,
  })
  
  // Créer la position managée
  const managedPosition = await tx.managedPosition.create({
    data: {
      symbol: order.symbol,
      qty: order.qty,
      entry_price: order.filled_avg_price!,
      entry_order_id: order.id,
      stop_loss_pct: 0.15,
      take_profit_pct: 0.25,
      stop_loss_price: calculateStopLoss(order.filled_avg_price!, 0.15),
      take_profit_price: calculateTakeProfit(order.filled_avg_price!, 0.25),
      status: 'active',
    }
  })
  
  // Logger l'activité
  await tx.activityLog.create({
    data: {
      type: 'TRADE',
      message: `Created managed position for ${order.symbol}`,
      metadata: {
        orderId: order.id,
        managedPositionId: managedPosition.id,
      }
    }
  })
})
```

### Vector Search

```typescript
// Stocker une décision avec embedding
import { generateEmbedding } from '@/lib/services/embeddings'

const embeddingText = `${decision.symbol} ${decision.action} ${decision.reasoning}`
const embedding = await generateEmbedding(embeddingText)

await prisma.decision.create({
  data: {
    symbol: decision.symbol,
    action: decision.action,
    reasoning: decision.reasoning,
    embedding: embedding, // float[]
  }
})

// Recherche de similarité
const queryEmbedding = await generateEmbedding("SPY buy opportunity on dip")

const similar = await prisma.$queryRaw<Array<{
  id: string
  symbol: string
  action: string
  reasoning: string
  similarity: number
}>>`
  SELECT 
    id,
    symbol,
    action,
    reasoning,
    1 - (embedding <=> ${queryEmbedding}::vector) as similarity
  FROM "Decision"
  WHERE action = 'BUY'
  ORDER BY embedding <=> ${queryEmbedding}::vector
  LIMIT 5
`

// Résultat : Décisions similaires triées par similarité
```

### Aggregations

```typescript
// Stats de trading
const stats = await prisma.decision.groupBy({
  by: ['symbol'],
  where: {
    result_pct: {
      not: null,
    }
  },
  _count: {
    id: true,
  },
  _avg: {
    result_pct: true,
    result_dollars: true,
  },
  _sum: {
    result_dollars: true,
  },
})

// Win rate
const totalTrades = await prisma.decision.count({
  where: { result_pct: { not: null } }
})

const winningTrades = await prisma.decision.count({
  where: { result_pct: { gt: 0 } }
})

const winRate = (winningTrades / totalTrades) * 100

// Profit factor
const winners = await prisma.decision.aggregate({
  where: { result_dollars: { gt: 0 } },
  _sum: { result_dollars: true }
})

const losers = await prisma.decision.aggregate({
  where: { result_dollars: { lt: 0 } },
  _sum: { result_dollars: true }
})

const profitFactor = Math.abs(
  winners._sum.result_dollars! / losers._sum.result_dollars!
)
```

### Complex Queries

```typescript
// Positions avec P&L non réalisé
const positionsWithPL = await prisma.$queryRaw`
  SELECT 
    p.*,
    mp.stop_loss_price,
    mp.take_profit_price,
    mp.status as managed_status
  FROM "Position" p
  LEFT JOIN "ManagedPosition" mp ON mp.symbol = p.symbol AND mp.status = 'active'
  WHERE p.qty > 0
  ORDER BY p.unrealized_plpc DESC
`

// Historique de trades pour un symbole
const tradeHistory = await prisma.$queryRaw`
  SELECT 
    o.created_at,
    o.side,
    o.qty,
    o.filled_avg_price,
    d.reasoning,
    d.result_pct
  FROM "Order" o
  LEFT JOIN "Decision" d ON d.symbol = o.symbol 
    AND d.created_at BETWEEN o.created_at - INTERVAL '5 minutes' 
                         AND o.created_at + INTERVAL '5 minutes'
  WHERE o.symbol = ${symbol}
    AND o.status = 'filled'
  ORDER BY o.created_at DESC
  LIMIT 50
`
```

## Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed system config
  await prisma.systemConfig.upsert({
    where: { key: 'max_position_size' },
    update: {},
    create: {
      key: 'max_position_size',
      value: { pct: 0.15 }
    }
  })
  
  // Seed example decisions
  const exampleDecisions = [
    {
      symbol: 'SPY',
      action: 'BUY' as const,
      strategy: 'momentum',
      reasoning: 'Strong bullish momentum with RSI at 45, breaking above 50-day SMA',
      result_pct: 3.2,
      result_dollars: 320,
    },
    {
      symbol: 'QQQ',
      action: 'SELL' as const,
      strategy: 'mean_reversion',
      reasoning: 'Overbought on RSI (75), taking profit at resistance',
      result_pct: 2.8,
      result_dollars: 280,
    },
  ]
  
  for (const decision of exampleDecisions) {
    await prisma.decision.create({
      data: decision
    })
  }
  
  console.log('Seed completed')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## Database Utilities

```typescript
// lib/db/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// lib/db/utils.ts
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  throw new Error('Should not reach here')
}

// Usage
const order = await withRetry(() =>
  prisma.order.create({ data: orderData })
)
```

## Backup & Maintenance

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Reset database (dev only!)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Push schema changes (dev)
npx prisma db push

# Create migration (prod)
npx prisma migrate dev --name add_trailing_stop

# Apply migrations (prod)
npx prisma migrate deploy
```

## Performance Tips

1. **Indexes** - Créer des index sur colonnes souvent filtrées
2. **Connection pooling** - Prisma gère automatiquement
3. **Batch operations** - Utiliser `createMany`, `updateMany`
4. **Select specific fields** - Ne pas charger tout
5. **Pagination** - Utiliser `take` et `skip`
6. **Vector index** - ivfflat pour embeddings (rapide mais approx)

```typescript
// Bon - select spécifique
const orders = await prisma.order.findMany({
  select: {
    id: true,
    symbol: true,
    status: true,
  }
})

// Mauvais - charge tout
const orders = await prisma.order.findMany()

// Bon - batch insert
await prisma.bar.createMany({
  data: barsArray,
  skipDuplicates: true,
})

// Mauvais - insert un par un
for (const bar of barsArray) {
  await prisma.bar.create({ data: bar })
}
```
