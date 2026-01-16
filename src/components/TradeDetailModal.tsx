import { Trade, getTradeSymbol, getTradeSide, getTradeLeverage, getTradeTakeProfits, getTradeStopLoss, getTradeConfidence } from '@/types/trader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import { 
  ArrowUp, 
  ArrowDown, 
  Target, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  ArrowRightLeft, 
  Shield, 
  ExternalLink, 
  TrendingUp,
  Crosshair,
  Hourglass,
  ZoomIn,
  X,
  Send
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TradeDetailModalProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Final trade statuses (do not rename per requirements)
type FinalStatus = 'ACTIVE' | 'WAITING' | 'EXPIRED' | 'CLOSED_PROFIT' | 'CLOSED_LOSS';

// Fixed timeline status types (6 statuses in strict order)
type FixedTimelineStatus = 
  | 'SIGNAL_RECEIVED'
  | 'POSITION_OPENED'
  | 'TP1_HIT'
  | 'STOP_MOVED'
  | 'TP2_HIT'
  | 'TRADE_CLOSED';

interface FixedTimelineEvent {
  status: FixedTimelineStatus;
  occurred: boolean;
  timestamp?: string;
  data?: {
    price?: number;
    entryPrice?: number;
    positionSize?: number;
    assetVolume?: number;
    symbol?: string;
    direction?: 'LONG' | 'SHORT';
    tpLevels?: number[];
    slLevel?: number;
    closedPercent?: number;
    closedAmount?: number;
    pnl?: number;
    pnlPercent?: number;
    newSlLevel?: number;
    totalPnl?: number;
    totalReturn?: number;
  };
}

const getFinalStatus = (trade: Trade): FinalStatus => {
  if (trade.executionStatus === 'expired') return 'EXPIRED';
  if (trade.executionStatus === 'active') {
    // Check if position is opened or still waiting
    const hasEntry = trade.actualEntryPrice !== undefined;
    return hasEntry ? 'ACTIVE' : 'WAITING';
  }
  return trade.resultPercent > 0 ? 'CLOSED_PROFIT' : 'CLOSED_LOSS';
};

const getStatusConfig = (status: FinalStatus, t: (key: string) => string) => {
  const configs: Record<FinalStatus, { label: string; className: string; icon: typeof Clock }> = {
    'ACTIVE': { 
      label: t('status.active'), 
      className: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      icon: TrendingUp
    },
    'WAITING': { 
      label: t('status.waiting'), 
      className: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      icon: Hourglass
    },
    'EXPIRED': { 
      label: t('status.expired'), 
      className: 'bg-muted text-muted-foreground border-border',
      icon: Timer
    },
    'CLOSED_PROFIT': { 
      label: t('status.closedProfit'), 
      className: 'bg-profit/20 text-profit border-profit/30',
      icon: CheckCircle2
    },
    'CLOSED_LOSS': { 
      label: t('status.closedLoss'), 
      className: 'bg-loss/20 text-loss border-loss/30',
      icon: XCircle
    },
  };
  return configs[status];
};

const getFixedEventConfig = (status: FixedTimelineStatus, occurred: boolean) => {
  const configs: Record<FixedTimelineStatus, { icon: typeof Clock; colorClass: string; bgClass: string }> = {
    'SIGNAL_RECEIVED': { icon: ExternalLink, colorClass: 'text-primary', bgClass: 'bg-primary/20 border-primary/30' },
    'POSITION_OPENED': { icon: Crosshair, colorClass: 'text-blue-600', bgClass: 'bg-blue-500/20 border-blue-500/30' },
    'TP1_HIT': { icon: Target, colorClass: 'text-profit', bgClass: 'bg-profit/20 border-profit/30' },
    'STOP_MOVED': { icon: ArrowRightLeft, colorClass: 'text-orange-500', bgClass: 'bg-orange-500/20 border-orange-500/30' },
    'TP2_HIT': { icon: Target, colorClass: 'text-profit', bgClass: 'bg-profit/20 border-profit/30' },
    'TRADE_CLOSED': { icon: CheckCircle2, colorClass: 'text-profit', bgClass: 'bg-profit/20 border-profit/30' },
  };
  
  if (!occurred) {
    return {
      icon: Hourglass,
      colorClass: 'text-muted-foreground',
      bgClass: 'bg-muted/50 border-border'
    };
  }
  
  return configs[status];
};

// Generate FIXED timeline with 6 statuses (always in same order)
const generateFixedTimeline = (trade: Trade): FixedTimelineEvent[] => {
  const signal = trade.parsedSignal.signal;
  const source = trade.parsedSignal.source;
  const takeProfits = signal.takeProfits;
  const symbol = getTradeSymbol(trade);
  const side = getTradeSide(trade);
  
  // Parse base date from source
  let baseDate: Date;
  try {
    const [datePart, timePart] = source.publishedAtText.split(' ');
    const [day, month, year] = datePart.split('.');
    baseDate = new Date(`${year}-${month}-${day}T${timePart}`);
  } catch {
    baseDate = new Date();
  }

  const hasOpened = !!(trade.actualEntryPrice || trade.executionStatus === 'closed');
  const isClosed = trade.executionStatus === 'closed';
  const isProfit = trade.resultPercent > 0;
  const hasTP1 = isClosed && isProfit;
  const hasStopMoved = isClosed && isProfit;
  const hasTP2 = isClosed && isProfit && trade.resultPercent > 15;
  
  // Calculate values for display
  const entryPrice = trade.actualEntryPrice || (signal.entry.range?.high || signal.entry.price || 0);
  const positionSize = trade.entryAmountUsdt || 100;
  const assetVolume = trade.assetVolume || (positionSize / entryPrice).toFixed(6);

  const events: FixedTimelineEvent[] = [
    // 1. Signal received
    {
      status: 'SIGNAL_RECEIVED',
      occurred: true, // Always occurred
      timestamp: baseDate.toISOString(),
      data: {
        price: signal.entry.range?.high || signal.entry.price || entryPrice,
      }
    },
    // 2. Position opened
    {
      status: 'POSITION_OPENED',
      occurred: hasOpened,
      timestamp: hasOpened ? new Date(baseDate.getTime() + 15 * 60 * 1000).toISOString() : undefined,
      data: hasOpened ? {
        entryPrice,
        positionSize,
        assetVolume: parseFloat(String(assetVolume)),
        symbol: symbol.replace('USDT', ''),
        direction: side,
        tpLevels: takeProfits.map(tp => tp.price),
        slLevel: signal.stopLoss.price,
      } : undefined
    },
    // 3. TP1 hit
    {
      status: 'TP1_HIT',
      occurred: hasTP1,
      timestamp: hasTP1 ? new Date(baseDate.getTime() + 2 * 60 * 60 * 1000).toISOString() : undefined,
      data: hasTP1 ? {
        price: takeProfits[0]?.price,
        closedPercent: 33,
        closedAmount: positionSize * 0.33,
        pnl: trade.pnlUsdt * 0.33,
        pnlPercent: trade.resultPercent * 0.33,
      } : undefined
    },
    // 4. Stop moved
    {
      status: 'STOP_MOVED',
      occurred: hasStopMoved,
      timestamp: hasStopMoved ? new Date(baseDate.getTime() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() : undefined,
      data: hasStopMoved ? {
        newSlLevel: entryPrice, // Breakeven
      } : undefined
    },
    // 5. TP2 hit
    {
      status: 'TP2_HIT',
      occurred: hasTP2,
      timestamp: hasTP2 ? new Date(baseDate.getTime() + 5 * 60 * 60 * 1000).toISOString() : undefined,
      data: hasTP2 ? {
        price: takeProfits[1]?.price,
        closedAmount: positionSize * 0.67,
        pnl: trade.pnlUsdt * 0.67,
      } : undefined
    },
    // 6. Trade closed
    {
      status: 'TRADE_CLOSED',
      occurred: isClosed,
      timestamp: isClosed ? new Date(baseDate.getTime() + 12 * 60 * 60 * 1000).toISOString() : undefined,
      data: isClosed ? {
        totalPnl: trade.pnlUsdt,
        totalReturn: trade.resultPercent,
      } : undefined
    },
  ];

  return events;
};

// Telegram Button Component
const TelegramButton = ({ href, label }: { href: string; label: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[hsl(199,89%,48%)] hover:bg-[hsl(199,89%,42%)] text-white font-semibold rounded-lg transition-colors shadow-lg"
  >
    <Send className="w-4 h-4" />
    {label}
  </a>
);

export const TradeDetailModal = ({ trade, open, onOpenChange }: TradeDetailModalProps) => {
  const [screenshotFullscreen, setScreenshotFullscreen] = useState(false);
  const { t, language } = useLanguage();
  const dateLocale = language === 'ru' ? ru : enUS;

  if (!trade) return null;

  const symbol = getTradeSymbol(trade);
  const side = getTradeSide(trade);
  const leverage = getTradeLeverage(trade);
  const source = trade.parsedSignal.source;

  const finalStatus = getFinalStatus(trade);
  const statusConfig = getStatusConfig(finalStatus, t);
  const StatusIcon = statusConfig.icon;

  const fixedTimelineEvents = generateFixedTimeline(trade);

  const formatEventTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'd MMM, HH:mm', { locale: dateLocale });
    } catch {
      return timestamp;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-card border-border p-0 overflow-hidden">
          {/* Close button - More visible */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-50 bg-foreground/10 hover:bg-foreground/20 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>

          {/* Sticky Header with Summary */}
          <div className="sticky top-0 z-40 bg-card border-b border-border p-4 md:p-6 pb-4">
            <DialogHeader>
              <div className="flex flex-col gap-4">
                {/* Symbol, Direction, Leverage, Status */}
                <div className="flex items-center justify-between flex-wrap gap-3 pr-10">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <DialogTitle className="text-xl md:text-2xl font-mono font-bold text-foreground">
                      {symbol}
                    </DialogTitle>
                    <Badge 
                      className={`text-xs md:text-sm font-semibold px-2 md:px-3 py-1 ${
                        side === 'LONG' 
                          ? 'bg-profit/20 text-profit border-profit/30' 
                          : 'bg-loss/20 text-loss border-loss/30'
                      }`}
                    >
                      {side === 'LONG' ? <ArrowUp className="w-3.5 h-3.5 mr-1" /> : <ArrowDown className="w-3.5 h-3.5 mr-1" />}
                      {side}
                    </Badge>
                    <Badge variant="outline" className="text-xs md:text-sm font-mono">
                      x{leverage}
                    </Badge>
                  </div>
                  
                  {/* Final Status Badge */}
                  <Badge className={`text-xs md:text-sm font-semibold px-2 md:px-3 py-1.5 border ${statusConfig.className}`}>
                    <StatusIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5" />
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Expired Explanation */}
                {finalStatus === 'EXPIRED' && (
                  <div className="flex items-start gap-3 p-3 md:p-4 rounded-lg border bg-muted/50 border-border">
                    <Timer className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t('modal.expiredReason')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('modal.expiredDescription')}</p>
                    </div>
                  </div>
                )}

                {/* Combined P&L Block - Hide for expired */}
                {finalStatus !== 'EXPIRED' && (
                  <div className={`flex items-center gap-4 p-3 md:p-4 rounded-lg border ${
                    trade.resultPercent > 0 ? 'bg-profit/10 border-profit/20' : 
                    trade.resultPercent < 0 ? 'bg-loss/10 border-loss/20' : 
                    'bg-muted border-border'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {trade.executionStatus === 'closed' ? (
                          trade.resultPercent > 0 
                            ? <CheckCircle2 className="w-4 h-4 text-profit" />
                            : <XCircle className="w-4 h-4 text-loss" />
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          {trade.executionStatus === 'closed' ? t('modal.finalPnl') : 'Total P&L'}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                        <span className={`text-2xl md:text-3xl font-bold font-mono ${
                          trade.resultPercent > 0 ? 'text-profit' : trade.resultPercent < 0 ? 'text-loss' : 'text-foreground'
                        }`}>
                          {trade.resultPercent > 0 ? '+' : ''}{trade.resultPercent.toFixed(2)}%
                        </span>
                        <span className={`text-base md:text-lg font-semibold font-mono ${
                          trade.pnlUsdt > 0 ? 'text-profit' : trade.pnlUsdt < 0 ? 'text-loss' : 'text-foreground'
                        }`}>
                          {trade.pnlUsdt > 0 ? '+' : ''}{trade.pnlUsdt.toFixed(2)} USDT
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="p-4 md:p-6 space-y-6">
              
              {/* 1. Public Trade Log Timeline FIRST */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {t('modal.publicTradeLog')}
                </h3>
                
                <div className="relative">
                  {/* Timeline connector line */}
                  <div className="absolute left-[17px] top-5 bottom-5 w-0.5 bg-border" />
                  
                  {/* Fixed Timeline events - always 6 statuses */}
                  <div className="space-y-3">
                    {fixedTimelineEvents.map((event, index) => {
                      const config = getFixedEventConfig(event.status, event.occurred);
                      const Icon = config.icon;
                      const isLast = index === fixedTimelineEvents.length - 1;
                      const statusTitleKey = `event.${event.status === 'SIGNAL_RECEIVED' ? 'signalReceived' : 
                        event.status === 'POSITION_OPENED' ? 'positionOpened' :
                        event.status === 'TP1_HIT' ? 'tp1Hit' :
                        event.status === 'STOP_MOVED' ? 'stopMoved' :
                        event.status === 'TP2_HIT' ? 'tp2Hit' : 'tradeClosed'}`;
                      
                      return (
                        <div key={index} className="relative flex gap-3">
                          {/* Icon circle */}
                          <div className={`relative z-10 w-9 h-9 rounded-full ${config.bgClass} border flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${config.colorClass}`} />
                          </div>
                          
                          {/* Content */}
                          <div className={`flex-1 min-w-0 pb-3 ${!isLast ? 'border-b border-border/50' : ''}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className={`font-semibold text-sm ${config.colorClass}`}>
                                  {t(statusTitleKey)}
                                </h4>
                                
                                {/* Show "Pending" if not occurred */}
                                {!event.occurred && (
                                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                                    {t('event.pending')}
                                  </p>
                                )}
                                
                                {/* Status-specific data display */}
                                {event.occurred && event.data && (
                                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                    {/* 1. Signal received */}
                                    {event.status === 'SIGNAL_RECEIVED' && event.data.price && (
                                      <p className="font-mono">
                                        {t('timeline.price')}: {event.data.price.toLocaleString('en-US')} USDT
                                      </p>
                                    )}
                                    
                                    {/* 2. Position opened */}
                                    {event.status === 'POSITION_OPENED' && (
                                      <>
                                        <p className="font-mono">
                                          {t('timeline.entryPrice')}: {event.data.entryPrice?.toLocaleString('en-US')} USDT
                                        </p>
                                        <p className="font-mono">
                                          {t('timeline.positionSize')}: {event.data.positionSize?.toLocaleString('en-US')} USDT
                                        </p>
                                        <p className="font-mono">
                                          {event.data.direction === 'LONG' ? t('timeline.bought') : t('timeline.sold')}: {event.data.assetVolume} {event.data.symbol}
                                        </p>
                                        <p>
                                          {t('timeline.direction')}: <span className={event.data.direction === 'LONG' ? 'text-profit' : 'text-loss'}>{event.data.direction}</span>
                                        </p>
                                        {event.data.tpLevels && event.data.tpLevels.length > 0 && (
                                          <p className="font-mono">
                                            {t('timeline.tp')}: {event.data.tpLevels.map(tp => tp.toLocaleString('en-US')).join(' / ')}
                                          </p>
                                        )}
                                        {event.data.slLevel && (
                                          <p className="font-mono">
                                            {t('timeline.sl')}: {event.data.slLevel.toLocaleString('en-US')}
                                          </p>
                                        )}
                                      </>
                                    )}
                                    
                                    {/* 3. TP1 hit */}
                                    {event.status === 'TP1_HIT' && (
                                      <>
                                        <p className="font-mono">
                                          {t('timeline.tp1Price')}: {event.data.price?.toLocaleString('en-US')} USDT
                                        </p>
                                        <p>
                                          {t('timeline.closed')}: {event.data.closedPercent}%
                                        </p>
                                        <p className="font-mono">
                                          {t('timeline.closedAmount')}: {event.data.closedAmount?.toFixed(2)} USDT
                                        </p>
                                        <p className={`font-mono ${(event.data.pnl || 0) > 0 ? 'text-profit' : 'text-loss'}`}>
                                          {t('timeline.pnl')}: {(event.data.pnl || 0) > 0 ? '+' : ''}{event.data.pnl?.toFixed(2)} USDT ({(event.data.pnlPercent || 0) > 0 ? '+' : ''}{event.data.pnlPercent?.toFixed(1)}%)
                                        </p>
                                      </>
                                    )}
                                    
                                    {/* 4. Stop moved */}
                                    {event.status === 'STOP_MOVED' && (
                                      <p className="font-mono">
                                        {t('timeline.newSl')}: {event.data.newSlLevel?.toLocaleString('en-US')} USDT ({t('timeline.breakeven')})
                                      </p>
                                    )}
                                    
                                    {/* 5. TP2 hit */}
                                    {event.status === 'TP2_HIT' && (
                                      <>
                                        <p className="font-mono">
                                          {t('timeline.tp2Price')}: {event.data.price?.toLocaleString('en-US')} USDT
                                        </p>
                                        <p className="font-mono">
                                          {t('timeline.closed')}: {event.data.closedAmount?.toFixed(2)} USDT
                                        </p>
                                        <p className={`font-mono ${(event.data.pnl || 0) > 0 ? 'text-profit' : 'text-loss'}`}>
                                          {t('timeline.pnl')}: {(event.data.pnl || 0) > 0 ? '+' : ''}{event.data.pnl?.toFixed(2)} USDT
                                        </p>
                                      </>
                                    )}
                                    
                                    {/* 6. Trade closed */}
                                    {event.status === 'TRADE_CLOSED' && (
                                      <>
                                        <p className={`font-mono font-semibold ${(event.data.totalPnl || 0) > 0 ? 'text-profit' : 'text-loss'}`}>
                                          {t('timeline.totalPnl')}: {(event.data.totalPnl || 0) > 0 ? '+' : ''}{event.data.totalPnl?.toFixed(2)} USDT
                                        </p>
                                        <p className={`font-mono font-semibold ${(event.data.totalReturn || 0) > 0 ? 'text-profit' : 'text-loss'}`}>
                                          {t('timeline.totalReturn')}: {(event.data.totalReturn || 0) > 0 ? '+' : ''}{event.data.totalReturn?.toFixed(1)}%
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Timestamp */}
                              {event.occurred && event.timestamp && (
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-muted-foreground">
                                    {formatEventTime(event.timestamp)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Telegram Button after Trade Log */}
              <TelegramButton href={source.messageLink} label={t('modal.telegramLink')} />

              {/* 2. Telegram Signal Proof SECOND */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{t('modal.telegramProof')}</h3>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Screenshot - Always Visible, Click to Enlarge */}
                  <div 
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-border bg-muted/20"
                    onClick={() => setScreenshotFullscreen(true)}
                  >
                    <img
                      src={trade.originalPost.screenshotUrl}
                      alt="Original Telegram signal"
                      className="w-full h-auto max-h-[350px] object-contain"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/20 backdrop-blur-sm rounded-full p-3">
                        <ZoomIn className="w-6 h-6 text-background" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-foreground/60 backdrop-blur-sm text-background text-xs px-2 py-1 rounded opacity-70 group-hover:opacity-100 transition-opacity">
                      {t('modal.viewFullscreen')}
                    </div>
                  </div>

                  {/* Original Post Text */}
                  {trade.originalPost.text && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">{t('modal.originalPost')}</p>
                      <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                        {trade.originalPost.text}
                      </pre>
                    </div>
                  )}

                  {/* Source Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>Published: {source.publishedAtText}</span>
                  </div>

                  {/* Trust Notice */}
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        {t('modal.proofCaption')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Telegram Button after Screenshots/Proof */}
              <TelegramButton href={source.messageLink} label={t('modal.telegramLink')} />

            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Screenshot Modal */}
      <Dialog open={screenshotFullscreen} onOpenChange={setScreenshotFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 bg-foreground/95 border-border/30">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={trade.originalPost.screenshotUrl}
              alt="Original Telegram signal - fullscreen"
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
            <button
              onClick={() => setScreenshotFullscreen(false)}
              className="absolute top-2 right-2 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-background" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};