# Analyse de l'architecture Go

## Structure du projet Go

```
Claude_Prophet/
├── cmd/bot/main.go              # Entry point - 150 lignes
├── controllers/                  # 48 fonctions HTTP handlers
│   ├── activity_controller.go   # 3 fonctions
│   ├── intelligence_controller.go # 3 fonctions
│   ├── news_controller.go       # 6 fonctions
│   ├── order_controller.go      # 5 fonctions
│   └── position_management.go   # 5 fonctions
├── services/                     # 63 fonctions business logic
│   ├── activity_logger.go       # 4 fonctions
│   ├── alpaca_data.go          # 8 fonctions
│   ├── alpaca_options_data.go  # 6 fonctions
│   ├── alpaca_trading.go       # 12 fonctions
│   ├── claude_service.go       # 3 fonctions
│   ├── news_service.go         # 8 fonctions
│   ├── position_manager.go     # 10 fonctions
│   ├── stock_analysis.go       # 5 fonctions
│   └── technical_analysis.go   # 7 fonctions
├── database/
│   └── storage.go              # 15 fonctions SQLite
├── models/
│   └── models.go               # 7 types de données
├── interfaces/
│   ├── trading.go              # 60+ types
│   └── options.go              # 20+ types
└── mcp-server.js               # MCP server Node.js
```

## Fonctions clés par module

### Controllers (48 fonctions)

#### activity_controller.go
```go
// Logger une activité générale
func LogActivity(w http.ResponseWriter, r *http.Request)

// Logger une décision de trading spécifique
func LogDecision(w http.ResponseWriter, r *http.Request)

// Récupérer les logs d'activité
func GetActivityLog(w http.ResponseWriter, r *http.Request)
```

#### intelligence_controller.go
```go
// Quick market intelligence (15 articles MarketWatch + Claude)
func GetQuickMarketIntelligence(w http.ResponseWriter, r *http.Request)

// Analyse complète de stocks avec technicals + news
func AnalyzeStocks(w http.ResponseWriter, r *http.Request)

// Agrégation et résumé de news multi-sources
func AggregateAndSummarizeNews(w http.ResponseWriter, r *http.Request)
```

#### news_controller.go
```go
// Recherche Google News
func SearchNews(w http.ResponseWriter, r *http.Request)

// News nettoyées par Claude
func GetCleanedNews(w http.ResponseWriter, r *http.Request)

// MarketWatch - Top stories
func GetMarketWatchTopStories(w http.ResponseWriter, r *http.Request)

// MarketWatch - Real-time headlines
func GetMarketWatchRealtime(w http.ResponseWriter, r *http.Request)

// MarketWatch - Breaking bulletins
func GetMarketWatchBulletins(w http.ResponseWriter, r *http.Request)

// MarketWatch - Quick market pulse
func GetMarketWatchMarketPulse(w http.ResponseWriter, r *http.Request)
```

#### order_controller.go
```go
// Placer un ordre stock
func PlaceOrder(w http.ResponseWriter, r *http.Request)

// Placer un ordre options
func PlaceOptionsOrder(w http.ResponseWriter, r *http.Request)

// Annuler un ordre
func CancelOrder(w http.ResponseWriter, r *http.Request)

// Liste des ordres avec filtres
func GetOrders(w http.ResponseWriter, r *http.Request)

// Détails d'un ordre spécifique
func GetOrder(w http.ResponseWriter, r *http.Request)
```

#### position_management.go
```go
// Créer une position managée (auto stop-loss/take-profit)
func CreateManagedPosition(w http.ResponseWriter, r *http.Request)

// Liste des positions managées
func GetManagedPositions(w http.ResponseWriter, r *http.Request)

// Détails d'une position managée
func GetManagedPosition(w http.ResponseWriter, r *http.Request)

// Fermer une position managée
func CloseManagedPosition(w http.ResponseWriter, r *http.Request)

// Mettre à jour les paramètres
func UpdateManagedPosition(w http.ResponseWriter, r *http.Request)
```

### Services (63 fonctions)

#### alpaca_trading.go
```go
// Service principal de trading
type AlpacaTradingService struct {
    client *alpaca.Client
}

// Constructeur
func NewAlpacaTradingService() *AlpacaTradingService

// Récupérer les infos du compte
func (s *AlpacaTradingService) GetAccount() (*Account, error)

// Liste toutes les positions
func (s *AlpacaTradingService) GetPositions() ([]Position, error)

// Position spécifique par symbole
func (s *AlpacaTradingService) GetPosition(symbol string) (*Position, error)

// Placer un ordre
func (s *AlpacaTradingService) PlaceOrder(order OrderRequest) (*Order, error)

// Placer un ordre d'options
func (s *AlpacaTradingService) PlaceOptionsOrder(order OptionsOrderRequest) (*Order, error)

// Annuler un ordre
func (s *AlpacaTradingService) CancelOrder(orderID string) error

// Liste des ordres avec filtres
func (s *AlpacaTradingService) GetOrders(params OrderQueryParams) ([]Order, error)

// Détails d'un ordre
func (s *AlpacaTradingService) GetOrder(orderID string) (*Order, error)

// Fermer une position au market
func (s *AlpacaTradingService) ClosePosition(symbol string) error

// Fermer toutes les positions
func (s *AlpacaTradingService) CloseAllPositions() error

// Vérifier si le marché est ouvert
func (s *AlpacaTradingService) IsMarketOpen() (bool, error)
```

#### alpaca_data.go
```go
// Service de données de marché
type AlpacaDataService struct {
    client *alpaca.DataClient
}

// Constructeur
func NewAlpacaDataService() *AlpacaDataService

// Quote temps réel
func (s *AlpacaDataService) GetLatestQuote(symbol string) (*Quote, error)

// Dernière barre
func (s *AlpacaDataService) GetLatestBar(symbol string) (*Bar, error)

// Barres historiques
func (s *AlpacaDataService) GetHistoricalBars(params BarParams) ([]Bar, error)

// Snapshot complet
func (s *AlpacaDataService) GetSnapshot(symbol string) (*Snapshot, error)

// Snapshots multiples
func (s *AlpacaDataService) GetSnapshots(symbols []string) (map[string]*Snapshot, error)

// Latest trades
func (s *AlpacaDataService) GetLatestTrades(symbols []string) (map[string]*Trade, error)

// Multi-bar request
func (s *AlpacaDataService) GetMultiBars(symbols []string, params BarParams) (map[string][]Bar, error)
```

#### alpaca_options_data.go
```go
// Service de données options
type AlpacaOptionsDataService struct {
    client *alpaca.OptionsClient
}

// Constructeur
func NewAlpacaOptionsDataService() *AlpacaOptionsDataService

// Chaîne d'options complète
func (s *AlpacaOptionsDataService) GetOptionChain(params OptionChainParams) (*OptionChain, error)

// Snapshot d'une option
func (s *AlpacaOptionsDataService) GetOptionSnapshot(symbol string) (*OptionSnapshot, error)

// Barres historiques options
func (s *AlpacaOptionsDataService) GetOptionBars(params OptionBarParams) ([]OptionBar, error)

// Latest trades options
func (s *AlpacaOptionsDataService) GetOptionLatestTrade(symbol string) (*OptionTrade, error)

// Quote options
func (s *AlpacaOptionsDataService) GetOptionLatestQuote(symbol string) (*OptionQuote, error)
```

#### position_manager.go (Complexité élevée)
```go
// Manager de positions avec automation
type PositionManager struct {
    tradingService *AlpacaTradingService
    dataService    *AlpacaDataService
    storage        *Storage
    monitoring     bool
}

// Constructeur
func NewPositionManager() *PositionManager

// Créer une position managée
func (pm *PositionManager) CreateManagedPosition(params ManagedPositionParams) (*ManagedPosition, error)

// Récupérer toutes les positions managées
func (pm *PositionManager) GetManagedPositions() ([]ManagedPosition, error)

// Récupérer une position managée
func (pm *PositionManager) GetManagedPosition(id string) (*ManagedPosition, error)

// Mettre à jour une position managée
func (pm *PositionManager) UpdateManagedPosition(id string, params UpdateParams) error

// Monitorer toutes les positions (goroutine)
func (pm *PositionManager) MonitorPositions() error

// Fermer une position managée
func (pm *PositionManager) CloseManagedPosition(id string) error

// Vérifier les conditions de sortie
func (pm *PositionManager) checkExitConditions(mp *ManagedPosition) (bool, string, error)

// Calculer le prix actuel
func (pm *PositionManager) getCurrentPrice(symbol string) (float64, error)

// Logger la fermeture d'une position
func (pm *PositionManager) logPositionClosed(mp *ManagedPosition, reason string, price float64) error
```

#### claude_service.go
```go
// Service Claude AI
type ClaudeService struct {
    client *anthropic.Client
    model  string
}

// Constructeur
func NewClaudeService() *ClaudeService

// Nettoyer et résumer des news pour trading
func (c *ClaudeService) CleanNewsForTrading(articles []NewsArticle) (*CleanedNews, error)

// Analyser un stock avec contexte
func (c *ClaudeService) AnalyzeStockForTrading(params StockAnalysisParams) (*StockAnalysis, error)
```

#### news_service.go
```go
// Service d'agrégation de news
type NewsService struct {
    claudeService *ClaudeService
}

// Constructeur
func NewNewsService() *NewsService

// Recherche Google News
func (n *NewsService) SearchGoogleNews(query string, limit int) ([]NewsArticle, error)

// Récupérer MarketWatch feed
func (n *NewsService) GetMarketWatchFeed(feedType string) ([]NewsArticle, error)

// Parser RSS feed
func (n *NewsService) parseRSSFeed(url string) ([]NewsArticle, error)

// Agrégation multi-sources
func (n *NewsService) AggregateNews(sources []string, symbol string) ([]NewsArticle, error)

// News nettoyées par AI
func (n *NewsService) GetCleanedNews(sources []string, symbol string) (*CleanedNews, error)

// Quick intelligence MarketWatch
func (n *NewsService) GetQuickIntelligence() (*CleanedNews, error)
```

#### stock_analysis.go
```go
// Service d'analyse de stocks
type StockAnalysisService struct {
    dataService      *AlpacaDataService
    optionsService   *AlpacaOptionsDataService
    newsService      *NewsService
    technicalService *TechnicalAnalysisService
}

// Constructeur
func NewStockAnalysisService() *StockAnalysisService

// Analyse complète d'un stock
func (s *StockAnalysisService) AnalyzeStock(symbol string) (*StockAnalysis, error)

// Analyse technique uniquement
func (s *StockAnalysisService) GetTechnicalAnalysis(symbol string) (*TechnicalAnalysis, error)

// Analyse options flow
func (s *StockAnalysisService) GetOptionsFlow(symbol string) (*OptionsFlow, error)

// Combiner toutes les analyses
func (s *StockAnalysisService) GetComprehensiveAnalysis(symbol string) (*ComprehensiveAnalysis, error)
```

#### technical_analysis.go
```go
// Service d'indicateurs techniques
type TechnicalAnalysisService struct{}

// RSI (Relative Strength Index)
func CalculateRSI(prices []float64, period int) float64

// SMA (Simple Moving Average)
func CalculateSMA(prices []float64, period int) float64

// EMA (Exponential Moving Average)
func CalculateEMA(prices []float64, period int) float64

// MACD
func CalculateMACD(prices []float64) *MACDResult

// Bollinger Bands
func CalculateBollingerBands(prices []float64, period int, stdDev float64) *BollingerBands

// Support/Resistance levels
func FindSupportResistance(bars []Bar) ([]float64, []float64)

// Trend detection
func DetectTrend(prices []float64) string
```

#### activity_logger.go
```go
// Service de logging
type ActivityLogger struct {
    storage *Storage
}

// Constructeur
func NewActivityLogger() *ActivityLogger

// Logger une activité générale
func (a *ActivityLogger) LogActivity(activityType string, message string, metadata map[string]interface{}) error

// Logger une décision de trading
func (a *ActivityLogger) LogDecision(decision DecisionLog) error

// Récupérer les logs d'une date
func (a *ActivityLogger) GetActivityLog(date time.Time) ([]ActivityLog, error)

// Générer un embedding pour une décision
func (a *ActivityLogger) generateEmbedding(text string) ([]float64, error)
```

### Database (15 fonctions)

```go
// Storage SQLite
type Storage struct {
    db *sql.DB
}

// Constructeur et init
func NewStorage() *Storage
func (s *Storage) initTables() error

// Orders
func (s *Storage) SaveOrder(order *Order) error
func (s *Storage) GetOrder(orderID string) (*Order, error)
func (s *Storage) GetOrders(filters OrderFilters) ([]Order, error)

// Bars (cache de données de marché)
func (s *Storage) SaveBar(symbol string, bar *Bar) error
func (s *Storage) GetBars(symbol string, start, end time.Time) ([]Bar, error)

// Positions
func (s *Storage) SavePosition(position *Position) error
func (s *Storage) GetPosition(symbol string) (*Position, error)

// Managed Positions
func (s *Storage) SaveManagedPosition(mp *ManagedPosition) error
func (s *Storage) GetManagedPosition(id string) (*ManagedPosition, error)
func (s *Storage) UpdateManagedPosition(mp *ManagedPosition) error
func (s *Storage) GetAllManagedPositions() ([]ManagedPosition, error)

// Vector embeddings
func (s *Storage) SaveTradeEmbedding(embedding *TradeEmbedding) error
func (s *Storage) FindSimilarTrades(queryVector []float64, limit int) ([]TradeEmbedding, error)

// Stats
func (s *Storage) GetTradeStats(filters TradeStatsFilters) (*TradeStats, error)
```

## Patterns architecturaux identifiés

### 1. Layered Architecture (3 couches)

```
┌─────────────────────────────────┐
│   HTTP Handlers (Controllers)   │  ← Validation, HTTP formatting
├─────────────────────────────────┤
│   Service Layer                  │  ← Business logic
├─────────────────────────────────┤
│   Data Layer (Storage)           │  ← Persistence
└─────────────────────────────────┘
         │
         ↓
    External APIs
    (Alpaca, Claude)
```

### 2. Dependency Injection

Services construits avec `New*()` et passés aux controllers.

**Exemple :**
```go
tradingService := services.NewAlpacaTradingService()
controller := controllers.NewOrderController(tradingService)
```

### 3. Error Handling Pattern

Toutes les fonctions retournent `(result, error)`:
```go
func GetAccount() (*Account, error) {
    if err != nil {
        return nil, fmt.Errorf("failed to get account: %w", err)
    }
    return account, nil
}
```

### 4. Configuration via Environment

```go
alpacaKey := os.Getenv("ALPACA_API_KEY")
alpacaSecret := os.Getenv("ALPACA_SECRET_KEY")
alpacaPaper := os.Getenv("ALPACA_PAPER") == "true"
```

### 5. Retry Logic

Retry automatique sur erreurs réseau avec backoff exponentiel.

### 6. Concurrent Monitoring

Position monitoring dans une goroutine séparée:
```go
go positionManager.MonitorPositions()
```

### 7. Vector Search (Cosine Similarity)

```go
func cosineSimilarity(a, b []float64) float64 {
    // Custom implementation
    var dot, magA, magB float64
    for i := range a {
        dot += a[i] * b[i]
        magA += a[i] * a[i]
        magB += b[i] * b[i]
    }
    return dot / (math.Sqrt(magA) * math.Sqrt(magB))
}
```

## Flow d'exécution typique

### Exemple : Placer un ordre d'options

```
1. HTTP Request → POST /api/orders/options
                     ↓
2. order_controller.PlaceOptionsOrder()
   - Parse JSON body
   - Validate input
                     ↓
3. alpaca_trading.PlaceOptionsOrder()
   - Format order for Alpaca API
   - Call Alpaca
   - Retry on network error
                     ↓
4. storage.SaveOrder()
   - Persist to SQLite
                     ↓
5. activity_logger.LogActivity()
   - Log decision with embedding
                     ↓
6. HTTP Response ← JSON order confirmation
```

## Schéma de base de données SQLite

```sql
-- Orders
CREATE TABLE db_orders (
    id TEXT PRIMARY KEY,
    symbol TEXT,
    qty REAL,
    side TEXT,
    type TEXT,
    status TEXT,
    filled_qty REAL,
    filled_price REAL,
    limit_price REAL,
    created_at DATETIME,
    updated_at DATETIME
);

-- Positions
CREATE TABLE db_positions (
    symbol TEXT PRIMARY KEY,
    qty REAL,
    avg_entry_price REAL,
    current_price REAL,
    unrealized_pl REAL,
    unrealized_plpc REAL,
    created_at DATETIME,
    updated_at DATETIME
);

-- Managed Positions
CREATE TABLE db_managed_positions (
    id TEXT PRIMARY KEY,
    symbol TEXT,
    qty REAL,
    entry_price REAL,
    stop_loss_price REAL,
    take_profit_price REAL,
    trailing_stop BOOLEAN,
    status TEXT,
    closed_price REAL,
    closed_reason TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    closed_at DATETIME
);

-- Bars (cache)
CREATE TABLE db_bars (
    symbol TEXT,
    timestamp DATETIME,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    volume INTEGER,
    PRIMARY KEY (symbol, timestamp)
);

-- Trade Embeddings
CREATE TABLE trade_embeddings (
    id TEXT PRIMARY KEY,
    symbol TEXT,
    action TEXT,
    strategy TEXT,
    reasoning TEXT,
    market_context TEXT,
    result_pct REAL,
    result_dollars REAL,
    created_at DATETIME
);

-- Trade Vectors (384 dimensions)
CREATE TABLE trade_vectors (
    embedding_id TEXT PRIMARY KEY,
    vector BLOB,  -- 384 float64 values
    FOREIGN KEY (embedding_id) REFERENCES trade_embeddings(id)
);
```

## Métriques de complexité

### Fonctions les plus complexes (cyclomatic complexity)

1. **CloseManagedPosition** - 15
   - Multiple conditions de sortie
   - Gestion d'erreurs multiples
   - Logging détaillé

2. **MonitorPositions** - 12
   - Boucle infinie
   - Vérifications multiples
   - Concurrent checks

3. **LogPositionClosed** - 8
   - Calculs P&L
   - Embedding generation
   - Database writes

4. **AnalyzeStock** - 8
   - Agrégation de 4 sources
   - Error handling per source
   - AI analysis

5. **GetOptionsChain** - 7
   - Parsing complexe
   - Filtrage multi-critères
   - Validation

## Points d'attention pour la migration

### 1. Concurrency
Go utilise goroutines. En Node.js :
- Utiliser `setInterval` pour le monitoring
- `Promise.all()` pour parallélisme
- Considérer des workers pour tâches lourdes

### 2. Error Handling
Go retourne `(value, error)`. En TypeScript :
- `try/catch` avec async/await
- Ou type `Result<T, E>`

### 3. Type Safety
Go a des types forts. En TypeScript :
- Utiliser `strict: true`
- Zod pour validation runtime
- Prisma pour type-safe DB

### 4. Vector Search
Go implémente cosine similarity custom. En Next.js :
- Utiliser pgvector (PostgreSQL extension)
- Ou librairie comme `ml-distance`

### 5. SQLite → PostgreSQL
- Adapter les requêtes SQL
- Utiliser Prisma migrations
- pgvector pour embeddings

### 6. HTTP Server
Go `net/http` → Next.js API Routes
- Même patterns RESTful
- Middleware pour logging
- Error boundaries
