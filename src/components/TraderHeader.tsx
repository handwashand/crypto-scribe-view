import { Trader } from '@/types/trader';
import { ExternalLink, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import pnlMamaLogo from '@/assets/pnl-mama-logo.png';

interface TraderHeaderProps {
  trader: Trader;
}

export const TraderHeader = ({ trader }: TraderHeaderProps) => {
  const isProfit = trader.totalPnlPercent >= 0;
  const { t, language } = useLanguage();

  // Extract username from telegram link or use trader name
  const telegramUsername = trader.telegramLink.includes('t.me/') 
    ? '@' + trader.telegramLink.split('t.me/')[1]
    : '@' + trader.name.replace(/\s+/g, '');

  return (
    <div className="animate-fade-in">
      {/* Trader Info */}
      <div className="glass-card p-6 md:p-8 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={pnlMamaLogo} alt="PNL Mama" className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full" />
              <div>
                <h1 className="text-sm md:text-2xl font-bold text-foreground">
                  PNL Mama
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground italic">Real signals. Real results.</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Intro text */}
          <p className="text-muted-foreground text-sm">
            {language === 'ru' 
              ? <>Мы отслеживаем каждую сделку и публикуем прозрачную P&L статистику:</>
              : <>We track every trade and publish transparent P&L statistics:</>
            }
          </p>

          {/* Trader Channel Card */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            {trader.avatarUrl ? (
              <img src={trader.avatarUrl} alt={trader.name} className="w-10 h-10 rounded-full shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {trader.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-sm text-foreground">{trader.name}</span>
              {trader.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{trader.description}</p>
              )}
            </div>
            <a
              href={trader.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('header.viewInTelegram')}</span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>📊 {language === 'ru' ? 'Отслеживание на бирже' : 'Exchange-based tracking'}</span>
            <span>·</span>
            <span>🔒 {language === 'ru' ? 'Без правок. Никогда.' : 'No edits. Ever.'}</span>
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
