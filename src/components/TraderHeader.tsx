import { Trader } from '@/types/trader';
import { ExternalLink, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

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
            <h1 className="text-lg md:text-3xl font-bold text-foreground">
              {trader.name}
            </h1>
            <LanguageSwitcher />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {language === 'ru' 
                ? <>📥 Копируем сделки трейдера <span className="font-bold text-foreground">{telegramUsername}</span></>
                : <>📥 We copy trades from <span className="font-bold text-foreground">{telegramUsername}</span></>
              }
            </p>
            <p className="text-muted-foreground text-sm">
              {language === 'ru' 
                ? '📊 Открываем их на бирже и прозрачно фиксируем результат — 🔒 без правок, удаления и «задним числом».'
                : '📊 We open them on the exchange and transparently record the result — 🔒 no edits, deletions, or "backdating".'
              }
            </p>
          </div>
          <a
            href={trader.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[hsl(199,89%,48%)] hover:bg-[hsl(199,89%,42%)] text-white px-3 py-3 rounded-lg transition-colors font-medium text-sm w-full"
          >
            <ExternalLink className="w-4 h-4" />
            {t('header.viewInTelegram')}
          </a>
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
