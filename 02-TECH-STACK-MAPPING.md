# Mapping technique Go → Next.js

## Core Technologies

### HTTP Server & Routing

**Go (net/http)**
```go
func main() {
    http.HandleFunc("/api/account", GetAccount)
    http.HandleFunc("/api/positions", GetPositions)
    http.HandleFunc("/api/orders", PlaceOrder)
    
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func GetAccount(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(account)
}
```

**Next.js (API Routes)**
```typescript
// app/api/account/route.ts
export async function GET(request: Request) {
  const account = await getAccount()
  return NextResponse.json(account)
}

// app/api/positions/route.ts
export async function GET(request: Request) {
  const positions = await getPositions()
  return NextResponse.json(positions)
}

// app/api/orders/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const order = await placeOrder(body)
  return NextResponse.json(order)
}
```

### JSON Handling

**Go**
```go
// Encode
json.NewEncoder(w).Encode(data)

// Decode
var req OrderRequest
json.NewDecoder(r.Body).Decode(&req)

// Marshal/Unmarshal
bytes, err := json.Marshal(data)
err := json.Unmarshal(bytes, &target)
```

**Next.js**
```typescript
// Encode (automatic)
NextResponse.json(data)

// Decode
const body = await request.json()

// Manual serialize/deserialize
const json = JSON.stringify(data)
const obj = JSON.parse(json)
```

### Environment Variables

**Go**
```go
import "os"

apiKey := os.Getenv("ALPACA_API_KEY")
secret := os.Getenv("ALPACA_SECRET_KEY")
paper := os.Getenv("ALPACA_PAPER") == "true"
```

**Next.js**
```typescript
const apiKey = process.env.ALPACA_API_KEY!
const secret = process.env.ALPACA_SECRET_KEY!
const paper = process.env.ALPACA_PAPER === 'true'

// Avec validation Zod
import { z } from 'zod'

const ConfigSchema = z.object({
  alpacaApiKey: z.string().min(1),
  alpacaSecretKey: z.string().min(1),
  alpacaPaper: z.boolean(),
})

const config = ConfigSchema.parse({
  alpacaApiKey: process.env.ALPACA_API_KEY,
  alpacaSecretKey: process.env.ALPACA_SECRET_KEY,
  alpacaPaper: process.env.ALPACA_PAPER === 'true',
})
```

### HTTP Client

**Go**
```go
resp, err := http.Get("https://api.example.com/data")
if err != nil {
    return nil, err
}
defer resp.Body.Close()

body, err := ioutil.ReadAll(resp.Body)
```

**Next.js**
```typescript
const response = await fetch('https://api.example.com/data')
if (!response.ok) {
  throw new Error('Request failed')
}
const data = await response.json()

// Avec retry
import { retry } from '@/lib/utils/retry'

const data = await retry(
  () => fetch(url).then(r => r.json()),
  { maxAttempts: 3, delay: 1000 }
)
```

### Query Parameters

**Go**
```go
func Handler(w http.ResponseWriter, r *http.Request) {
    symbol := r.URL.Query().Get("symbol")
    limit := r.URL.Query().Get("limit")
    
    limitInt, err := strconv.Atoi(limit)
}
```

**Next.js**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const limit = parseInt(searchParams.get('limit') || '10')
}
```

## Database

### Go (SQLite)

```go
import (
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
)

db, err := sql.Open("sqlite3", "./prophet_trader.db")

// Query
rows, err := db.Query("SELECT * FROM orders WHERE symbol = ?", symbol)
defer rows.Close()

for rows.Next() {
    var order Order
    err := rows.Scan(&order.ID, &order.Symbol, &order.Qty)
}

// Insert
_, err = db.Exec(
    "INSERT INTO orders (id, symbol, qty) VALUES (?, ?, ?)",
    order.ID, order.Symbol, order.Qty,
)
```

### Next.js (Prisma + PostgreSQL)

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Query
const orders = await prisma.order.findMany({
  where: { symbol }
})

// Insert
const order = await prisma.order.create({
  data: {
    id: orderId,
    symbol: 'AAPL',
    qty: 10,
  }
})

// Update
await prisma.order.update({
  where: { id: orderId },
  data: { status: 'filled' }
})
```

### Schema Definition

**Go (SQL)**
```sql
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    qty REAL NOT NULL,
    side TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_symbol ON orders(symbol);
```

**Prisma (schema.prisma)**
```prisma
model Order {
  id         String   @id @default(cuid())
  symbol     String
  qty        Float
  side       String
  status     String
  created_at DateTime @default(now())
  
  @@index([symbol])
}
```

## Concurrency

### Go (Goroutines & Channels)

```go
// Goroutine
go func() {
    result := expensiveOperation()
    log.Println(result)
}()

// Channels
ch := make(chan Result)

go func() {
    result := fetchData()
    ch <- result
}()

result := <-ch

// WaitGroup
var wg sync.WaitGroup
wg.Add(3)

go func() {
    defer wg.Done()
    task1()
}()

go func() {
    defer wg.Done()
    task2()
}()

wg.Wait()
```

### Next.js (Promises & async/await)

```typescript
// Background task
(async () => {
  const result = await expensiveOperation()
  console.log(result)
})()

// Promise
const promise = new Promise<Result>((resolve, reject) => {
  const result = fetchData()
  resolve(result)
})

const result = await promise

// Promise.all (parallel)
await Promise.all([
  task1(),
  task2(),
  task3(),
])

// Promise.allSettled (toutes même si erreur)
const results = await Promise.allSettled([
  task1(),
  task2(),
  task3(),
])
```

### Monitoring Loop

**Go**
```go
func (pm *PositionManager) MonitorPositions() error {
    ticker := time.NewTicker(10 * time.Second)
    defer ticker.Stop()
    
    for {
        select {
        case <-ticker.C:
            pm.checkAllPositions()
        }
    }
}
```

**Next.js**
```typescript
class PositionManager {
  private intervalId?: NodeJS.Timeout
  
  startMonitoring() {
    this.intervalId = setInterval(
      () => this.checkAllPositions(),
      10000 // 10 seconds
    )
  }
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
}

// Ou avec Vercel Cron Jobs
// vercel.json
{
  "crons": [{
    "path": "/api/cron/monitor-positions",
    "schedule": "*/10 * * * *"
  }]
}
```

## Error Handling

### Go

```go
func GetAccount() (*Account, error) {
    account, err := alpaca.GetAccount()
    if err != nil {
        return nil, fmt.Errorf("failed to get account: %w", err)
    }
    return account, nil
}

// Usage
account, err := GetAccount()
if err != nil {
    log.Printf("Error: %v", err)
    return
}
```

### Next.js

```typescript
// Option 1: Try/catch
async function getAccount(): Promise<Account> {
  try {
    const account = await alpaca.getAccount()
    return account
  } catch (error) {
    throw new Error('Failed to get account', { cause: error })
  }
}

// Usage
try {
  const account = await getAccount()
} catch (error) {
  console.error('Error:', error)
}

// Option 2: Result type
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E }

async function getAccount(): Promise<Result<Account>> {
  try {
    const account = await alpaca.getAccount()
    return { ok: true, value: account }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
}

// Usage
const result = await getAccount()
if (result.ok) {
  console.log(result.value)
} else {
  console.error(result.error)
}
```

## Type System

### Go (Structs & Interfaces)

```go
// Struct
type Order struct {
    ID          string    `json:"id"`
    Symbol      string    `json:"symbol"`
    Qty         float64   `json:"qty"`
    Side        string    `json:"side"`
    Type        string    `json:"type"`
    Status      string    `json:"status"`
    CreatedAt   time.Time `json:"created_at"`
}

// Interface
type TradingService interface {
    GetAccount() (*Account, error)
    PlaceOrder(req OrderRequest) (*Order, error)
    GetPositions() ([]Position, error)
}

// Implementation
type AlpacaTradingService struct {
    client *alpaca.Client
}

func (s *AlpacaTradingService) GetAccount() (*Account, error) {
    // implementation
}
```

### Next.js (TypeScript)

```typescript
// Interface
interface Order {
  id: string
  symbol: string
  qty: number
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  status: 'new' | 'filled' | 'canceled'
  created_at: Date
}

// Type alias
type OrderSide = 'buy' | 'sell'
type OrderType = 'market' | 'limit'

// Interface for service
interface TradingService {
  getAccount(): Promise<Account>
  placeOrder(req: OrderRequest): Promise<Order>
  getPositions(): Promise<Position[]>
}

// Implementation (class)
class AlpacaTradingService implements TradingService {
  private client: AlpacaClient
  
  constructor(client: AlpacaClient) {
    this.client = client
  }
  
  async getAccount(): Promise<Account> {
    // implementation
  }
}
```

## Configuration & Dependency Injection

### Go

```go
type Config struct {
    AlpacaKey    string
    AlpacaSecret string
    AlpacaPaper  bool
}

func LoadConfig() *Config {
    return &Config{
        AlpacaKey:    os.Getenv("ALPACA_KEY"),
        AlpacaSecret: os.Getenv("ALPACA_SECRET"),
        AlpacaPaper:  os.Getenv("ALPACA_PAPER") == "true",
    }
}

// Dependency Injection
type OrderController struct {
    tradingService *AlpacaTradingService
}

func NewOrderController(ts *AlpacaTradingService) *OrderController {
    return &OrderController{tradingService: ts}
}
```

### Next.js

```typescript
// lib/config.ts
import { z } from 'zod'

const ConfigSchema = z.object({
  alpaca: z.object({
    apiKey: z.string(),
    secretKey: z.string(),
    paper: z.boolean(),
  }),
  claude: z.object({
    apiKey: z.string(),
  }),
})

export const config = ConfigSchema.parse({
  alpaca: {
    apiKey: process.env.ALPACA_API_KEY!,
    secretKey: process.env.ALPACA_SECRET_KEY!,
    paper: process.env.ALPACA_PAPER === 'true',
  },
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },
})

// Dependency Injection (simple)
class OrderController {
  constructor(private tradingService: TradingService) {}
}

const tradingService = new AlpacaTradingService(config.alpaca)
const controller = new OrderController(tradingService)

// Ou avec factory pattern
export function createOrderController() {
  const tradingService = createTradingService()
  return new OrderController(tradingService)
}
```

## External Libraries

### Trading APIs

| Go | Next.js |
|----|---------|
| `github.com/alpacahq/alpaca-trade-api-go/v3` | `@alpacahq/alpaca-trade-api` |

```go
// Go
import "github.com/alpacahq/alpaca-trade-api-go/v3/alpaca"

client := alpaca.NewClient(alpaca.ClientOpts{
    APIKey:    key,
    APISecret: secret,
    BaseURL:   alpaca.PaperBaseURL,
})
```

```typescript
// Next.js
import Alpaca from '@alpacahq/alpaca-trade-api'

const client = new Alpaca({
  keyId: key,
  secretKey: secret,
  paper: true,
})
```

### AI APIs

| Go | Next.js |
|----|---------|
| `github.com/anthropics/anthropic-sdk-go` | `@anthropic-ai/sdk` |

```go
// Go
import "github.com/anthropics/anthropic-sdk-go"

client := anthropic.NewClient(
    option.WithAPIKey(apiKey),
)
```

```typescript
// Next.js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})
```

## Vector Search

### Go (Custom implementation)

```go
func cosineSimilarity(a, b []float64) float64 {
    var dot, magA, magB float64
    for i := range a {
        dot += a[i] * b[i]
        magA += a[i] * a[i]
        magB += b[i] * b[i]
    }
    return dot / (math.Sqrt(magA) * math.Sqrt(magB))
}

func (s *Storage) FindSimilarTrades(queryVector []float64, limit int) ([]TradeEmbedding, error) {
    embeddings, err := s.GetAllEmbeddings()
    
    scores := make([]struct {
        embedding TradeEmbedding
        score     float64
    }, len(embeddings))
    
    for i, emb := range embeddings {
        scores[i].embedding = emb
        scores[i].score = cosineSimilarity(queryVector, emb.Vector)
    }
    
    sort.Slice(scores, func(i, j int) bool {
        return scores[i].score > scores[j].score
    })
    
    results := make([]TradeEmbedding, min(limit, len(scores)))
    for i := 0; i < len(results); i++ {
        results[i] = scores[i].embedding
    }
    
    return results, nil
}
```

### Next.js (pgvector extension)

```typescript
// Migration SQL
// migrations/001_add_vector_extension.sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE decisions 
  ALTER COLUMN embedding TYPE vector(768);

CREATE INDEX ON decisions 
  USING ivfflat (embedding vector_cosine_ops);

// Prisma schema
model Decision {
  id        String   @id @default(cuid())
  symbol    String
  reasoning String
  embedding Unsupported("vector(768)")
  // ...
}

// Usage
import { prisma } from '@/lib/db/client'

async function findSimilarTrades(
  queryVector: number[],
  limit: number = 5
) {
  const similar = await prisma.$queryRaw`
    SELECT 
      id, symbol, action, reasoning,
      1 - (embedding <=> ${queryVector}::vector) as similarity
    FROM decisions
    ORDER BY embedding <=> ${queryVector}::vector
    LIMIT ${limit}
  `
  
  return similar
}
```

## Logging

### Go

```go
import "log"

log.Println("Info message")
log.Printf("Order placed: %s", orderID)
log.Fatal("Fatal error")

// Structured logging
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("order placed",
    zap.String("order_id", orderID),
    zap.String("symbol", symbol),
    zap.Float64("qty", qty),
)
```

### Next.js

```typescript
// Basic
console.log('Info message')
console.error('Error:', error)

// Structured logging (custom util)
// lib/utils/logger.ts
export const logger = {
  info(message: string, metadata?: Record<string, any>) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      ...metadata,
      timestamp: new Date().toISOString(),
    }))
  },
  
  error(message: string, error?: Error, metadata?: Record<string, any>) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      ...metadata,
      timestamp: new Date().toISOString(),
    }))
  },
}

// Usage
logger.info('order placed', {
  orderId,
  symbol,
  qty,
})
```

## Validation

### Go

```go
func ValidateOrder(req OrderRequest) error {
    if req.Symbol == "" {
        return fmt.Errorf("symbol is required")
    }
    if req.Qty <= 0 {
        return fmt.Errorf("qty must be positive")
    }
    if req.Side != "buy" && req.Side != "sell" {
        return fmt.Errorf("side must be buy or sell")
    }
    return nil
}
```

### Next.js (Zod)

```typescript
import { z } from 'zod'

const OrderRequestSchema = z.object({
  symbol: z.string().min(1).max(10),
  qty: z.number().positive(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  limit_price: z.number().positive().optional(),
})

type OrderRequest = z.infer<typeof OrderRequestSchema>

// Usage in API route
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const order = OrderRequestSchema.parse(body)
    
    // order is now type-safe and validated
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    throw error
  }
}
```

## Summary: Key Differences

| Aspect | Go | Next.js |
|--------|----|---------| 
| Concurrency | Goroutines, channels | Promises, async/await |
| Error handling | Multiple return values | try/catch, Result types |
| Type system | Structs, interfaces | Interfaces, types, classes |
| Database | SQL direct, SQLite | Prisma ORM, PostgreSQL |
| HTTP | net/http package | API Routes, fetch API |
| JSON | Marshal/Unmarshal | Native JSON with validation |
| Dependencies | Explicit injection | Factory functions, singletons |
| Vector search | Custom implementation | pgvector extension |
| Monitoring | Goroutines + tickers | setInterval, cron jobs |
