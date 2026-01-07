/**
 * Trading types and interfaces
 */

export interface Account {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  shorting_enabled: boolean;
  multiplier: string;
  long_market_value: string;
  short_market_value: string;
  equity: string;
  last_equity: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  daytrade_count: number;
  daytrading_buying_power: string;
}

export interface Position {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  qty: string;
  avg_entry_price: string;
  side: 'long' | 'short';
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
export type OrderStatus = 'new' | 'partially_filled' | 'filled' | 'done_for_day' | 'canceled' | 'expired' | 'replaced' | 'pending_cancel' | 'pending_replace' | 'accepted' | 'pending_new' | 'accepted_for_bidding' | 'stopped' | 'rejected' | 'suspended' | 'calculated';
export type TimeInForce = 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';

export interface Order {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at?: string;
  expired_at?: string;
  canceled_at?: string;
  failed_at?: string;
  replaced_at?: string;
  replaced_by?: string;
  replaces?: string;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional?: string;
  qty?: string;
  filled_qty: string;
  filled_avg_price?: string;
  order_class: string;
  order_type: OrderType;
  type: OrderType;
  side: OrderSide;
  time_in_force: TimeInForce;
  limit_price?: string;
  stop_price?: string;
  status: OrderStatus;
  extended_hours: boolean;
  legs?: Order[];
  trail_percent?: string;
  trail_price?: string;
  hwm?: string;
}

export interface OrderRequest {
  symbol: string;
  qty?: number;
  notional?: number;
  side: OrderSide;
  type: OrderType;
  time_in_force?: TimeInForce;
  limit_price?: number;
  stop_price?: number;
  trail_price?: number;
  trail_percent?: number;
  extended_hours?: boolean;
  client_order_id?: string;
  order_class?: 'simple' | 'bracket' | 'oco' | 'oto';
  take_profit?: {
    limit_price: number;
  };
  stop_loss?: {
    stop_price: number;
    limit_price?: number;
  };
}

export interface Quote {
  symbol: string;
  ask_price: number;
  ask_size: number;
  ask_exchange: string;
  bid_price: number;
  bid_size: number;
  bid_exchange: string;
  timestamp: string;
}

export interface Bar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  n?: number; // number of trades
  vw?: number; // volume-weighted average price
}

export interface Snapshot {
  symbol: string;
  latestTrade?: {
    t: string;
    x: string;
    p: number;
    s: number;
    c: string[];
    i: number;
    z: string;
  };
  latestQuote?: {
    t: string;
    ax: string;
    ap: number;
    as: number;
    bx: string;
    bp: number;
    bs: number;
    c: string[];
  };
  minuteBar?: Bar;
  dailyBar?: Bar;
  prevDailyBar?: Bar;
}

export interface BarParams {
  symbol: string;
  timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day';
  start?: string;
  end?: string;
  limit?: number;
}

export interface OrderQueryParams {
  status?: 'open' | 'closed' | 'all';
  limit?: number;
  after?: string;
  until?: string;
  direction?: 'asc' | 'desc';
  nested?: boolean;
  symbols?: string;
}
