# Prophet Trader - Next.js

AI-powered paper trading system built with Next.js, TypeScript, and Claude AI. This is a complete migration of the [Claude Prophet](https://github.com/JakeNesler/Claude_Prophet) project from Go to Next.js.

## ⚠️ Important Warning

**This is a PAPER TRADING system only. Never use with real funds.**

## 🚀 Features

- **Trading Operations** - Full integration with Alpaca Markets API
- **AI Analysis** - News analysis and stock recommendations using Claude AI
- **Position Management** - Automated stop-loss and take-profit monitoring
- **Vector Search** - Semantic search over trading decisions and history
- **MCP Integration** - 40+ tools for Claude Code integration
- **Type-Safe** - Full TypeScript with strict mode

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (with pgvector extension)
- Alpaca Markets account (paper trading)
- Anthropic API key (for Claude)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Alpaca API Configuration
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_PAPER=true

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/prophet_trader
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 API Endpoints

### Trading

- `GET /api/trading/account` - Get account information
- `GET /api/trading/positions` - Get all positions
- `GET /api/trading/positions/[symbol]` - Get specific position
- `DELETE /api/trading/positions/[symbol]` - Close a position
- `GET /api/trading/orders` - Get orders (with filters)
- `POST /api/trading/orders` - Place a new order
- `GET /api/trading/orders/[id]` - Get order details
- `DELETE /api/trading/orders/[id]` - Cancel an order

### Example: Place an Order

```bash
curl -X POST http://localhost:3000/api/trading/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "qty": 10,
    "side": "buy",
    "type": "market",
    "time_in_force": "day"
  }'
```

## 🏗️ Project Structure

```
prophet-trader-nextjs/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   └── trading/      # Trading endpoints
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── services/         # Business logic
│       │   └── alpaca/       # Alpaca trading & data services
│       ├── db/               # Database client
│       ├── utils/            # Utilities (retry, logger)
│       ├── types/            # TypeScript types
│       └── config.ts         # Configuration
├── prisma/
│   └── schema.prisma         # Database schema
├── public/
└── package.json
```

## 🔧 Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Build for Production

```bash
npm run build
```

## 📊 Database Schema

The project uses PostgreSQL with the following main models:

- **Order** - Trading orders
- **Position** - Current positions
- **ManagedPosition** - Positions with automated management
- **Bar** - Historical market data
- **NewsArticle** - News articles
- **Decision** - Trading decisions with vector embeddings
- **ActivityLog** - System activity logs

See [prisma/schema.prisma](prisma/schema.prisma) for the complete schema.

## 🔐 Security

- All API keys stored in environment variables
- Input validation using Zod schemas
- TypeScript strict mode enabled
- Paper trading mode enforced

## 📝 Development Phases

This project is being developed in phases:

- ✅ **Phase 1**: Core Trading (Account, Positions, Orders)
- ⏳ **Phase 2**: Intelligence & AI (Claude, News, Analysis)
- ⏳ **Phase 3**: Position Management (Auto stop-loss/take-profit)
- ⏳ **Phase 4**: Vector Search & Memory
- ⏳ **Phase 5**: MCP Integration
- ⏳ **Phase 6**: Frontend Dashboard (Optional)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The project is optimized for Vercel deployment with:
- Serverless API routes
- PostgreSQL database (Vercel Postgres)
- Automatic deployments

## 📖 Documentation

For more information, see the documentation files in the parent directory:

- `00-PROJECT-OVERVIEW.md` - Project overview
- `01-ARCHITECTURE-ANALYSIS.md` - Architecture details
- `02-TECH-STACK-MAPPING.md` - Go to Next.js mapping
- `03-DATABASE-SCHEMA.md` - Database schema details
- `08-DEVELOPMENT-PHASES.md` - Development roadmap

## 🤝 Contributing

This is a learning/demo project. Feel free to fork and modify for your own use.

## 📄 License

ISC

## 🙏 Credits

- Original Go project: [Claude Prophet by Jake Nesler](https://github.com/JakeNesler/Claude_Prophet)
- Inspired by the Medium article: "I gave Claude Code 100k to trade..."

---

**Remember: This is for PAPER TRADING only. Never use with real money.**
