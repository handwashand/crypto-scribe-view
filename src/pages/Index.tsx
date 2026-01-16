import { useState, useMemo } from 'react';
import { TraderHeader } from '@/components/TraderHeader';
import { TradeFilters, FilterPeriod } from '@/components/TradeFilters';
import { TradesTable } from '@/components/TradesTable';
import { TradeDetailModal } from '@/components/TradeDetailModal';
import { OtherTraders } from '@/components/OtherTraders';
import { mockTrader, mockTrades, otherTraders } from '@/data/mockData';
import { Trade, getTradeDate } from '@/types/trader';
import { subDays, isAfter, parse } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const TRADES_PER_PAGE = 10;

const Index = () => {
  const [periodFilter, setPeriodFilter] = useState<FilterPeriod>('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { t, language } = useLanguage();

  const filteredTrades = useMemo(() => {
    return mockTrades.filter(trade => {
      // Period filter
      if (periodFilter !== 'all') {
        const cutoffDate = subDays(new Date(), periodFilter);
        const dateStr = getTradeDate(trade);
        // Parse date in format "DD.MM.YYYY HH:mm:ss"
        const tradeDate = parse(dateStr, 'dd.MM.yyyy HH:mm:ss', new Date());
        if (!isAfter(tradeDate, cutoffDate)) {
          return false;
        }
      }

      return true;
    });
  }, [periodFilter]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [periodFilter]);

  const totalPages = Math.ceil(filteredTrades.length / TRADES_PER_PAGE);
  
  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * TRADES_PER_PAGE;
    return filteredTrades.slice(startIndex, startIndex + TRADES_PER_PAGE);
  }, [filteredTrades, currentPage]);

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsModalOpen(true);
  };

  const handleTraderClick = (traderId: string) => {
    // In a real app, this would navigate to the trader's page
    console.log('Navigate to trader:', traderId);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Glow Effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, hsl(217 91% 60% / 0.08), transparent 50%)',
        }}
      />

      <div className="relative container max-w-6xl py-6 md:py-10">
        {/* Header */}
        <header className="mb-8">
          <TraderHeader trader={mockTrader} />
        </header>

        {/* Trades Section */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'ru' ? 'История сделок' : 'Trade History'}
            </h2>
            <span className="text-sm text-muted-foreground font-mono">
              {filteredTrades.length} {language === 'ru' ? 'из' : 'of'} {mockTrades.length}
            </span>
          </div>

          <TradeFilters
            periodFilter={periodFilter}
            onPeriodChange={setPeriodFilter}
          />

          <TradesTable trades={paginatedTrades} onTradeClick={handleTradeClick} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>

        {/* Other Traders */}
        <OtherTraders
          traders={otherTraders}
          currentTraderId={mockTrader.id}
          onTraderClick={handleTraderClick}
        />

        {/* Footer Note */}
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>{language === 'ru' ? 'Данные получены автоматически из системы симуляции.' : 'Data automatically received from the simulation system.'}</p>
          <p className="mt-1">{language === 'ru' ? 'Историческая доходность не гарантирует будущих результатов.' : 'Past performance does not guarantee future results.'}</p>
        </footer>
      </div>

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default Index;
