# Spécifications des Services

Tous les services Go doivent être traduits en classes TypeScript.

## Structure des services

```
lib/services/
├── alpaca/
│   ├── trading.ts      # AlpacaTradingService
│   ├── data.ts         # AlpacaDataService
│   └── options.ts      # AlpacaOptionsDataService
├── claude.ts           # ClaudeService
├── news.ts             # NewsService
├── analysis/
│   ├── stock.ts        # StockAnalysisService
│   └── technical.ts    # TechnicalAnalysisService
├── positions.ts        # PositionManager
├── embeddings.ts       # EmbeddingService
├── activity-logger.ts  # ActivityLogger
└── vector-search.ts    # VectorSearchService
```

## Pattern de service

Chaque service suit ce pattern :

```typescript
export class ServiceName {
  private dependency: DependencyType
  
  constructor(config?: ServiceConfig) {
    this.dependency = new Dependency(config)
  }
  
  async methodName(params: ParamsType): Promise<ResultType> {
    try {
      // Business logic
      return result
    } catch (error) {
      logger.error('Method failed', error as Error)
      throw new ServiceError('Method failed', { cause: error })
    }
  }
}
```

## Référence : Voir fichiers Go

Pour chaque service, consulter le fichier Go correspondant dans `services/`:
- `alpaca_trading.go` → `lib/services/alpaca/trading.ts`
- `claude_service.go` → `lib/services/claude.ts`
- etc.

Reproduire exactement la même logique métier, adaptée à TypeScript/async.

## Exemple complet : AlpacaTradingService

```typescript
// lib/services/alpaca/trading.ts
import Alpaca from '@alpacahq/alpaca-trade-api'
import { logger } from '@/lib/utils/logger'
import { withRetry } from '@/lib/utils/retry'

export class AlpacaTradingService {
  private client: Alpaca
  
  constructor() {
    this.client = new Alpaca({
      keyId: process.env.ALPACA_API_KEY!,
      secretKey: process.env.ALPACA_SECRET_KEY!,
      paper: process.env.ALPACA_PAPER === 'true',
    })
  }
  
  async getAccount() {
    return withRetry(
      () => this.client.getAccount(),
      { maxAttempts: 3, delay: 1000 }
    )
  }
  
  async getPositions() {
    return withRetry(
      () => this.client.getPositions(),
      { maxAttempts: 3 }
    )
  }
  
  async placeOrder(params: OrderParams) {
    logger.info('Placing order', params)
    
    const order = await this.client.createOrder({
      symbol: params.symbol,
      qty: params.qty,
      side: params.side,
      type: params.type,
      time_in_force: params.time_in_force || 'day',
      limit_price: params.limit_price,
    })
    
    logger.info('Order placed', { orderId: order.id })
    return order
  }
}
```

## Position Manager (complexe)

Le PositionManager nécessite un monitoring continu :

```typescript
export class PositionManager {
  private intervalId?: NodeJS.Timeout
  
  startMonitoring() {
    this.intervalId = setInterval(
      () => this.checkAllPositions(),
      10000 // 10 secondes
    )
  }
  
  private async checkAllPositions() {
    const positions = await this.getManagedPositions()
    
    for (const position of positions) {
      await this.checkPosition(position)
    }
  }
  
  private async checkPosition(position: ManagedPosition) {
    const currentPrice = await this.getCurrentPrice(position.symbol)
    
    // Check stop loss
    if (currentPrice <= position.stop_loss_price) {
      await this.closePosition(position, 'stop_loss')
    }
    
    // Check take profit
    if (currentPrice >= position.take_profit_price) {
      await this.closePosition(position, 'take_profit')
    }
  }
}
```

## Important : Retry Logic

Tous les appels à APIs externes doivent avoir retry logic :

```typescript
// lib/utils/retry.ts
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: 'linear' | 'exponential'
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3
  const delay = options.delay || 1000
  const backoff = options.backoff || 'exponential'
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      
      const waitTime = backoff === 'exponential' 
        ? delay * Math.pow(2, attempt - 1)
        : delay * attempt
        
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw new Error('Should not reach here')
}
```
