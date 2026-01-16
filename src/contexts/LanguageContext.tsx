import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.trackingSince': 'Tracking since',
    'header.totalPnl': 'Total P&L',
    'header.totalTrades': 'Total Trades',
    'header.winRate': 'Win Rate',
    'header.activeTrades': 'Active Trades',
    'header.viewInTelegram': 'View in Telegram',
    
    // Filters
    'filter.all': 'All',
    'filter.active': 'Active',
    'filter.closed': 'Closed',
    'filter.long': 'Long',
    'filter.short': 'Short',
    'filter.today': 'Today',
    'filter.week': 'Week',
    'filter.month': 'Month',
    'filter.allTime': 'All time',
    
    // Table
    'table.number': '№',
    'table.date': 'Date',
    'table.pair': 'Pair',
    'table.direction': 'Direction',
    'table.leverage': 'Leverage',
    'table.result': 'Result',
    'table.pnl': 'P&L',
    'table.status': 'Status',
    'table.signal': 'Signal',
    'table.noTrades': 'No trades found',
    'table.tapForDetails': 'Tap for details →',
    
    // Status
    'status.active': 'ACTIVE',
    'status.waiting': 'WAITING',
    'status.expired': 'EXPIRED',
    'status.closedProfit': 'PROFIT',
    'status.closedLoss': 'LOSS',
    'status.live': 'LIVE',
    'status.closed': 'Closed',
    
    // Trade Detail Modal
    'modal.dealDetails': 'Deal Details',
    'modal.market': 'Market',
    'modal.confidence': 'Confidence',
    'modal.entryZone': 'Entry Zone',
    'modal.takeProfits': 'Take Profits',
    'modal.stopLoss': 'Stop Loss',
    'modal.hard': 'Hard',
    'modal.soft': 'Soft',
    'modal.publicTradeLog': 'Public Trade Log',
    'modal.telegramProof': 'Telegram Signal Proof',
    'modal.proofCaption': 'Signal received automatically from a Telegram channel. Text and screenshot saved without modifications.',
    'modal.originalPost': 'Original post',
    'modal.close': 'Close',
    'modal.viewFullscreen': 'View fullscreen',
    'modal.opened': 'Opened',
    'modal.closed': 'Closed',
    'modal.entry': 'Entry',
    'modal.volume': 'Volume',
    'modal.finalPnl': 'Final P&L',
    'modal.telegramLink': 'View in Telegram',
    'modal.expiredReason': 'Signal expired — 7 days limit reached',
    'modal.expiredDescription': 'The entry zone was not reached within 7 days after the signal was published. This trade is no longer active.',
    
    // Fixed Timeline events (6 statuses)
    'event.signalReceived': 'Signal received from Telegram',
    'event.positionOpened': 'Position opened',
    'event.tp1Hit': 'TP1 hit — partial close',
    'event.stopMoved': 'Stop Loss moved',
    'event.tp2Hit': 'TP2 hit — full close',
    'event.tradeClosed': 'Trade closed — final result',
    'event.pending': 'Pending',
    
    // Timeline data labels
    'timeline.price': 'Price',
    'timeline.entryPrice': 'Entry price',
    'timeline.positionSize': 'Position size',
    'timeline.bought': 'Bought',
    'timeline.sold': 'Sold',
    'timeline.direction': 'Direction',
    'timeline.tp': 'TP',
    'timeline.sl': 'SL',
    'timeline.tp1Price': 'TP1 price',
    'timeline.closed': 'Closed',
    'timeline.closedAmount': 'Closed amount',
    'timeline.pnl': 'PNL',
    'timeline.newSl': 'New SL',
    'timeline.breakeven': 'Breakeven',
    'timeline.tp2Price': 'TP2 price',
    'timeline.totalPnl': 'Total PNL',
    'timeline.totalReturn': 'Total return',
    
    // Signal thumbnail
    'signal.tooltip': 'Screenshot of the original Telegram post. Saved automatically without modifications.',
    
    // Other traders
    'otherTraders.title': 'Other Traders',
    'otherTraders.trades': 'trades',
    
    // General
    'general.trades': 'trades',
  },
  ru: {
    // Header
    'header.trackingSince': 'Отслеживание с',
    'header.totalPnl': 'Общий P&L',
    'header.totalTrades': 'Всего сделок',
    'header.winRate': 'Винрейт',
    'header.activeTrades': 'Активные сделки',
    'header.viewInTelegram': 'Открыть в Telegram',
    
    // Filters
    'filter.all': 'Все',
    'filter.active': 'Активные',
    'filter.closed': 'Закрытые',
    'filter.long': 'Long',
    'filter.short': 'Short',
    'filter.today': 'Сегодня',
    'filter.week': 'Неделя',
    'filter.month': 'Месяц',
    'filter.allTime': 'Всё время',
    
    // Table
    'table.number': '№',
    'table.date': 'Дата',
    'table.pair': 'Пара',
    'table.direction': 'Направление',
    'table.leverage': 'Плечо',
    'table.result': 'Результат',
    'table.pnl': 'P&L',
    'table.status': 'Статус',
    'table.signal': 'Сигнал',
    'table.noTrades': 'Сделки не найдены',
    'table.tapForDetails': 'Нажмите для деталей →',
    
    // Status
    'status.active': 'АКТИВНА',
    'status.waiting': 'ОЖИДАНИЕ',
    'status.expired': 'ИСТЕКЛА',
    'status.closedProfit': 'ПРОФИТ',
    'status.closedLoss': 'УБЫТОК',
    'status.live': 'LIVE',
    'status.closed': 'Закрыта',
    
    // Trade Detail Modal
    'modal.dealDetails': 'Детали сделки',
    'modal.market': 'Рынок',
    'modal.confidence': 'Уверенность',
    'modal.entryZone': 'Зона входа',
    'modal.takeProfits': 'Тейк-профиты',
    'modal.stopLoss': 'Стоп-лосс',
    'modal.hard': 'Жёсткий',
    'modal.soft': 'Мягкий',
    'modal.publicTradeLog': 'Публичный лог сделки',
    'modal.telegramProof': 'Доказательство из Telegram',
    'modal.proofCaption': 'Сигнал получен автоматически из Telegram-канала. Текст и скриншот сохранены без изменений.',
    'modal.originalPost': 'Оригинальный пост',
    'modal.close': 'Закрыть',
    'modal.viewFullscreen': 'Полноэкранный просмотр',
    'modal.opened': 'Открыта',
    'modal.closed': 'Закрыта',
    'modal.entry': 'Вход',
    'modal.volume': 'Объём',
    'modal.finalPnl': 'Итоговый P&L',
    'modal.telegramLink': 'Открыть в Telegram',
    'modal.expiredReason': 'Сигнал истёк — прошло 7 дней',
    'modal.expiredDescription': 'Зона входа не была достигнута в течение 7 дней после публикации сигнала. Эта сделка больше не активна.',
    
    // Fixed Timeline events (6 statuses)
    'event.signalReceived': 'Сигнал получен из Telegram',
    'event.positionOpened': 'Позиция открыта',
    'event.tp1Hit': 'TP1 достигнут — частичное закрытие',
    'event.stopMoved': 'Stop Loss перенесён',
    'event.tp2Hit': 'TP2 достигнут — полное закрытие',
    'event.tradeClosed': 'Сделка закрыта — итог',
    'event.pending': 'Ожидается',
    
    // Timeline data labels
    'timeline.price': 'Цена',
    'timeline.entryPrice': 'Цена входа',
    'timeline.positionSize': 'Размер позиции',
    'timeline.bought': 'Куплено',
    'timeline.sold': 'Продано',
    'timeline.direction': 'Направление',
    'timeline.tp': 'TP',
    'timeline.sl': 'SL',
    'timeline.tp1Price': 'Цена TP1',
    'timeline.closed': 'Закрыто',
    'timeline.closedAmount': 'Закрыто сумма',
    'timeline.pnl': 'PNL',
    'timeline.newSl': 'Новый SL',
    'timeline.breakeven': 'Безубыток',
    'timeline.tp2Price': 'Цена TP2',
    'timeline.totalPnl': 'Итого PNL',
    'timeline.totalReturn': 'Итого доходность',
    
    // Signal thumbnail
    'signal.tooltip': 'Скриншот оригинального поста из Telegram. Сохранён автоматически, без изменений.',
    
    // Other traders
    'otherTraders.title': 'Другие трейдеры',
    'otherTraders.trades': 'сделок',
    
    // General
    'general.trades': 'сделок',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback to prevent blank screen if a component is ever rendered outside LanguageProvider
    // (e.g. during unexpected mounting order, isolation, or preview quirks).
    console.warn('[LanguageContext] useLanguage called without LanguageProvider; using fallback (en).');
    const fallbackLanguage: Language = 'en';
    return {
      language: fallbackLanguage,
      setLanguage: (lang: Language) => {
        try {
          localStorage.setItem('language', lang);
        } catch {
          // ignore
        }
      },
      t: (key: string) => translations[fallbackLanguage][key] || key,
    } as LanguageContextType;
  }
  return context;
};
