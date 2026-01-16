import { Trader } from '@/types/trader';
import { ExternalLink, Calendar, TrendingUp, TrendingDown, Activity, Target, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface TraderHeaderProps {
  trader: Trader;
}

export const TraderHeader = ({ trader }: TraderHeaderProps) => {
  const isProfit = trader.totalPnlPercent >= 0;
  const { t, language } = useLanguage();
  const dateLocale = language === 'ru' ? ru : enUS;

  return (
    <div className="animate-fade-in">
      {/* Trader Info */}
      <div className="glass-card p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                {trader.name}
              </h1>
              <a
                href={trader.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[hsl(199,89%,48%)] hover:bg-[hsl(199,89%,42%)] text-white px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('header.viewInTelegram')}
              </a>
              {trader.description && (
                <p className="text-muted-foreground mt-2 max-w-lg text-sm">
                  {trader.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              <span>{t('header.trackingSince')} {format(new Date(trader.trackingStartDate), 'd MMMM yyyy', { locale: dateLocale })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid - 2 cards on mobile */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {/* P&L Card (% + USDT) */}
        <div className={`metric-card p-3 md:p-4 ${isProfit ? 'profit-bg' : 'loss-bg'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            {isProfit ? (
              <TrendingUp className="w-3.5 h-3.5 text-profit" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-loss" />
            )}
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">P&L</span>
          </div>
          <p className={`text-lg md:text-2xl font-bold font-mono ${isProfit ? 'text-profit' : 'text-loss'}`}>
            {isProfit ? '+' : ''}{trader.totalPnlPercent.toFixed(1)}%
          </p>
          <p className={`text-xs md:text-sm font-medium font-mono ${isProfit ? 'text-profit/80' : 'text-loss/80'}`}>
            {isProfit ? '+' : ''}{trader.totalPnlUsdt >= 1000 ? `${(trader.totalPnlUsdt / 1000).toFixed(1)}k` : trader.totalPnlUsdt.toFixed(0)} USDT
          </p>
        </div>

        {/* Stats Card (Total Trades + Win Rate) */}
        <div className="metric-card p-3 md:p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('header.totalTrades')}</span>
          </div>
          <p className="text-lg md:text-2xl font-bold font-mono text-foreground">
            {trader.totalTrades}
          </p>
          <p className="text-xs md:text-sm font-medium font-mono text-muted-foreground">
            {trader.winRate}% {language === 'ru' ? 'винрейт' : 'win'}
          </p>
        </div>
      </div>
    </div>
  );
};
