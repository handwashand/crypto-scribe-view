import { Trade, getTradeSymbol, getTradeSide, getTradeLeverage, getTradeDate } from '@/types/trader';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SignalThumbnail } from './SignalThumbnail';
import { useLanguage } from '@/contexts/LanguageContext';

interface TradesTableProps {
  trades: Trade[];
  onTradeClick: (trade: Trade) => void;
}

export const TradesTable = ({ trades, onTradeClick }: TradesTableProps) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: Trade['executionStatus']) => {
    switch (status) {
      case 'active':
        return <span className="status-active px-2 py-0.5 rounded text-xs font-medium">{t('status.active')}</span>;
      case 'closed':
        return <span className="status-closed px-2 py-0.5 rounded text-xs font-medium">{t('status.closed')}</span>;
      case 'expired':
        return <span className="status-expired px-2 py-0.5 rounded text-xs font-medium">{t('status.expired')}</span>;
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.signal')}</th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.number')}</th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.date')}</th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.pair')}</th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.direction')}</th>
              <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.leverage')}</th>
              <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.result')}</th>
              <th className="text-right p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.pnl')}</th>
              <th className="text-center p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => {
              const symbol = getTradeSymbol(trade);
              const side = getTradeSide(trade);
              const leverage = getTradeLeverage(trade);
              const dateStr = getTradeDate(trade);

              return (
                <tr
                  key={trade.id}
                  className={`
                    table-row-hover border-b border-border/50 
                    ${trade.executionStatus === 'active' ? 'bg-active/5' : ''}
                    animate-fade-in
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => onTradeClick(trade)}
                >
                  {/* Signal Thumbnail - Primary Column */}
                  <td className="p-3">
                    <SignalThumbnail 
                      trade={trade} 
                      size="md"
                      onClick={() => onTradeClick(trade)}
                    />
                  </td>
                  <td className="p-4 font-mono text-sm text-muted-foreground">#{trade.tradeNumber}</td>
                  <td className="p-4 text-sm">{dateStr}</td>
                  <td className="p-4 font-mono font-medium text-foreground">{symbol}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 font-medium text-sm ${
                      side === 'LONG' ? 'text-profit' : 'text-loss'
                    }`}>
                      {side === 'LONG' ? (
                        <ArrowUp className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5" />
                      )}
                      {side}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm text-muted-foreground">x{leverage}</td>
                  <td className={`p-4 text-right font-mono font-medium ${
                    trade.resultPercent > 0 ? 'text-profit' : trade.resultPercent < 0 ? 'text-loss' : 'text-muted-foreground'
                  }`}>
                    {trade.resultPercent > 0 ? '+' : ''}{trade.resultPercent.toFixed(1)}%
                  </td>
                  <td className={`p-4 text-right font-mono font-medium ${
                    trade.pnlUsdt > 0 ? 'text-profit' : trade.pnlUsdt < 0 ? 'text-loss' : 'text-muted-foreground'
                  }`}>
                    {trade.pnlUsdt > 0 ? '+' : ''}{trade.pnlUsdt.toFixed(2)}
                  </td>
                  <td className="p-4 text-center">{getStatusBadge(trade.executionStatus)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Screenshot First */}
      <div className="lg:hidden divide-y divide-border">
        {trades.map((trade, index) => {
          const symbol = getTradeSymbol(trade);
          const side = getTradeSide(trade);
          const leverage = getTradeLeverage(trade);
          const dateStr = getTradeDate(trade);

          return (
            <div
              key={trade.id}
              className={`
                p-4 table-row-hover 
                ${trade.executionStatus === 'active' ? 'bg-active/5' : ''}
                animate-fade-in
              `}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onTradeClick(trade)}
            >
              {/* Top: Screenshot + Main Info */}
              <div className="flex gap-4 mb-3">
                {/* Screenshot - Primary Element */}
                <SignalThumbnail 
                  trade={trade} 
                  size="lg"
                  onClick={() => onTradeClick(trade)}
                />
                
                {/* Trade Info */}
                <div className="flex-1 min-w-0">
                  {/* Pair + Direction */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono font-bold text-lg text-foreground">{symbol}</span>
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                      side === 'LONG' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'
                    }`}>
                      {side === 'LONG' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {side}
                    </span>
                  </div>

                  {/* PnL - Large Display */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-xl font-mono font-bold ${
                      trade.resultPercent > 0 ? 'text-profit' : trade.resultPercent < 0 ? 'text-loss' : 'text-muted-foreground'
                    }`}>
                      {trade.resultPercent > 0 ? '+' : ''}{trade.resultPercent.toFixed(1)}%
                    </span>
                    <span className={`text-sm font-mono ${
                      trade.pnlUsdt > 0 ? 'text-profit/80' : trade.pnlUsdt < 0 ? 'text-loss/80' : 'text-muted-foreground'
                    }`}>
                      {trade.pnlUsdt > 0 ? '+' : ''}{trade.pnlUsdt.toFixed(2)} USDT
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">#{trade.tradeNumber}</span>
                    <span>·</span>
                    <span>{dateStr}</span>
                    <span>·</span>
                    <span className="font-mono">x{leverage}</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Status Badge */}
              <div className="flex items-center justify-between">
                {getStatusBadge(trade.executionStatus)}
                <span className="text-xs text-primary">{t('table.tapForDetails')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {trades.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          {t('table.noTrades')}
        </div>
      )}
    </div>
  );
};
