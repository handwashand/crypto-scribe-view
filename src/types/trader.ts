export interface Trader {
  id: string;
  name: string;
  telegramChannel: string;
  telegramLink: string;
  description?: string;
  trackingStartDate: string;
  totalPnlPercent: number;
  totalPnlUsdt: number;
  totalTrades: number;
  winRate: number;
  activeTrades: number;
  avatarUrl?: string;
}

// Signal source information
export interface SignalSource {
  channelName: string;
  messageLink: string;
  publishedAtText: string;
}

// Entry can be either a single price or a range
export interface EntryRange {
  low: number;
  high: number;
}

export interface SignalEntry {
  type: 'MARKET' | 'LIMIT' | 'RANGE';
  price: number | null;
  range: EntryRange | null;
}

// Take profit level
export interface TakeProfit {
  price: number;
  portion: number | null;
}

// Stop loss configuration
export interface StopLoss {
  price: number;
  hard: boolean;
}

// Signal meta information
export interface SignalMeta {
  confidence: number;
  notes: string;
}

// Main signal data structure matching the parser JSON
export interface Signal {
  symbolRaw: string;
  market: 'USDT_PERP' | 'COIN_PERP' | 'SPOT';
  side: 'LONG' | 'SHORT';
  leverageX: number;
  entry: SignalEntry;
  takeProfits: TakeProfit[];
  stopLoss: StopLoss;
  status: 'ACTIVE' | 'CLOSED' | 'EXPIRED' | 'CANCELLED';
  author: string | null;
  updateOfId: string | null;
  externalId: string | null;
}

// Full parsed signal structure
export interface ParsedSignal {
  source: SignalSource;
  signal: Signal;
  meta: SignalMeta;
  version: string;
}

// Trade with execution data
export interface Trade {
  id: string;
  tradeNumber: number;
  // Parsed signal data
  parsedSignal: ParsedSignal;
  // Execution results
  resultPercent: number;
  pnlUsdt: number;
  executionStatus: 'active' | 'closed' | 'expired';
  actualEntryPrice?: number;
  exitPrice?: number;
  // Entry details for "Opened" status
  entryAmountUsdt?: number;
  assetVolume?: number;
  timeline: TimelineEvent[];
  // Original post screenshot
  originalPost: {
    screenshotUrl: string;
    text: string;
  };
}

export interface TimelineEvent {
  id: string;
  type: 'signal_received' | 'entry_executed' | 'tp_reached' | 'sl_moved' | 'trade_closed' | 'sl_hit' | 'expired';
  timestamp: string;
  price: number;
  positionChange?: string;
  pnlChange?: number;
  description: string;
}

// Helper functions to get display values from Trade
export const getTradeSymbol = (trade: Trade): string => trade.parsedSignal.signal.symbolRaw;
export const getTradeSide = (trade: Trade): 'LONG' | 'SHORT' => trade.parsedSignal.signal.side;
export const getTradeLeverage = (trade: Trade): number => trade.parsedSignal.signal.leverageX;
export const getTradeDate = (trade: Trade): string => trade.parsedSignal.source.publishedAtText;
export const getTradeEntryPrice = (trade: Trade): number => {
  const entry = trade.parsedSignal.signal.entry;
  if (entry.price !== null) return entry.price;
  if (entry.range) return (entry.range.low + entry.range.high) / 2;
  return 0;
};
export const getTradeTakeProfits = (trade: Trade): number[] => 
  trade.parsedSignal.signal.takeProfits.map(tp => tp.price);
export const getTradeStopLoss = (trade: Trade): number => trade.parsedSignal.signal.stopLoss.price;
export const getTradeConfidence = (trade: Trade): number => trade.parsedSignal.meta.confidence;
