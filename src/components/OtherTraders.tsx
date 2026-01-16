import { Trader } from '@/types/trader';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OtherTradersProps {
  traders: Trader[];
  currentTraderId: string;
  onTraderClick: (traderId: string) => void;
}

export const OtherTraders = ({ traders, currentTraderId, onTraderClick }: OtherTradersProps) => {
  const filteredTraders = traders.filter(t => t.id !== currentTraderId);
  const { t, language } = useLanguage();

  if (filteredTraders.length === 0) return null;

  return (
    <div className="mt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
      <h2 className="text-xl font-bold text-foreground mb-6">{t('otherTraders.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredTraders.map((trader) => {
          const isProfit = trader.totalPnlPercent >= 0;
          
          return (
            <div
              key={trader.id}
              className="glass-card p-3 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:scale-[1.02]"
              onClick={() => onTraderClick(trader.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {trader.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{trader.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{trader.telegramChannel}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-1 ${isProfit ? 'text-profit' : 'text-loss'}`}>
                  {isProfit ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="font-mono font-bold text-sm">
                    {isProfit ? '+' : ''}{trader.totalPnlPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Target className="w-3 h-3" />
                  <span className="font-mono text-xs">{trader.totalTrades}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
