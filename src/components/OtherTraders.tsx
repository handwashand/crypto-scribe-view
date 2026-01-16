import { Trader } from '@/types/trader';
import { TrendingUp, TrendingDown, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="grid md:grid-cols-3 gap-4">
        {filteredTraders.map((trader) => {
          const isProfit = trader.totalPnlPercent >= 0;
          
          return (
            <div
              key={trader.id}
              className="glass-card p-5 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:scale-[1.02]"
              onClick={() => onTraderClick(trader.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {trader.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground line-clamp-1">{trader.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{trader.telegramChannel}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`p-3 rounded-lg ${isProfit ? 'profit-bg' : 'loss-bg'}`}>
                  <div className="flex items-center gap-1 mb-1">
                    {isProfit ? (
                      <TrendingUp className="w-3 h-3 text-profit" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-loss" />
                    )}
                    <span className="text-xs text-muted-foreground">P&L</span>
                  </div>
                  <p className={`font-mono font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                    {isProfit ? '+' : ''}{trader.totalPnlPercent.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t('general.trades')}</span>
                  </div>
                  <p className="font-mono font-bold text-foreground">{trader.totalTrades}</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full justify-between text-primary hover:text-primary/80"
                onClick={(e) => {
                  e.stopPropagation();
                  onTraderClick(trader.id);
                }}
              >
                {language === 'ru' ? 'Перейти' : 'View'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
