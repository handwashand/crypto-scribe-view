import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export type FilterPeriod = 7 | 30 | 90 | 'all';

interface TradeFiltersProps {
  periodFilter: FilterPeriod;
  onPeriodChange: (period: FilterPeriod) => void;
}

export const TradeFilters = ({
  periodFilter,
  onPeriodChange,
}: TradeFiltersProps) => {
  const { t } = useLanguage();

  const getPeriodLabel = (period: FilterPeriod) => {
    if (period === 'all') return t('filter.allTime');
    if (period === 7) return t('filter.week');
    if (period === 30) return t('filter.month');
    return `${period}d`;
  };

  return (
    <div className="flex gap-1.5 p-1 bg-muted/50 rounded-lg w-fit mb-6">
      {([7, 30, 90, 'all'] as FilterPeriod[]).map((period) => (
        <Button
          key={String(period)}
          variant={periodFilter === period ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onPeriodChange(period)}
          className={`text-xs ${periodFilter === period ? '' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {getPeriodLabel(period)}
        </Button>
      ))}
    </div>
  );
};
