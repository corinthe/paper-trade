export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Prophet Trader - Next.js</h1>
        <p className="text-lg mb-8">
          AI-powered paper trading system with Claude and Alpaca Markets
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">Trading</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>GET /api/trading/account - Get account information</li>
                <li>GET /api/trading/positions - Get all positions</li>
                <li>GET /api/trading/positions/[symbol] - Get specific position</li>
                <li>DELETE /api/trading/positions/[symbol] - Close position</li>
                <li>GET /api/trading/orders - Get orders</li>
                <li>POST /api/trading/orders - Place new order</li>
                <li>GET /api/trading/orders/[id] - Get order details</li>
                <li>DELETE /api/trading/orders/[id] - Cancel order</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Intelligence & Analysis</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>GET /api/intelligence/news/quick - Quick market intelligence</li>
                <li>GET /api/intelligence/news/search - Search and analyze news</li>
                <li>POST /api/intelligence/stocks/analyze - Comprehensive stock analysis</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">⚠️ Important</h3>
          <p className="text-sm">
            This is a <strong>paper trading system</strong>. Never use real funds.
            Configure your Alpaca API keys in <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env.local</code>
          </p>
        </div>
      </main>
    </div>
  );
}
