import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { Trade, getTradeSymbol } from '@/types/trader';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface SignalThumbnailProps {
  trade: Trade;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showStatusBadge?: boolean;
}

export const SignalThumbnail = ({ 
  trade, 
  size = 'md', 
  onClick,
  showStatusBadge = true 
}: SignalThumbnailProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16 md:w-20 md:h-20',
    lg: 'w-24 h-24 md:w-28 md:h-28',
  };

  const getStatusBadge = () => {
    switch (trade.executionStatus) {
      case 'active':
        return (
          <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-active/90 text-[10px] font-medium text-background shadow-lg shadow-active/30">
            <span className="w-1.5 h-1.5 rounded-full bg-background animate-pulse" />
            {t('status.live')}
          </span>
        );
      case 'closed':
        return (
          <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
        );
      case 'expired':
        return (
          <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-loss/70 border-2 border-background" />
        );
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`
            relative ${sizeClasses[size]} rounded-lg overflow-hidden cursor-pointer
            bg-muted/50 border border-border/50 
            transition-all duration-300 ease-out
            hover:border-primary/50 hover:scale-105
            group
          `}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {/* Skeleton loader */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Image */}
          <img
            src={trade.originalPost.screenshotUrl}
            alt={`Signal ${getTradeSymbol(trade)}`}
            loading="lazy"
            className={`
              w-full h-full object-cover object-center
              transition-all duration-300
              group-hover:scale-110 group-hover:brightness-50
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
          />

          {/* Error fallback */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs">
              TG
            </div>
          )}

          {/* Hover overlay with zoom icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-foreground" />
            </div>
          </div>

          {/* Status badge */}
          {showStatusBadge && getStatusBadge()}

          {/* Corner accent */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-tl from-primary/30 to-transparent" />
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-[200px] text-center bg-popover border-border"
      >
        <p className="text-xs">
          {t('signal.tooltip')}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
