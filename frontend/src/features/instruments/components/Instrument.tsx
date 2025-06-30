import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { ChevronDown, Plus, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FixedSizeList as List } from 'react-window';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import type { Instrument as InstrumentType } from '@/types/common-types';
import { Spinner } from '@/components/ui/spinner';
import {
  useGetInstrumentsQuery,
  useGetSubscribedInstrumentsQuery,
  useSubscribeInstrumentMutation,
} from '@/api/instrumentService';

// Types
interface Props {
  exchange: string;
  searchTerm: string;
  optionType: string;
  strikePrice: number | null;
  expiryAfter: string;
  expiryBefore: string;
  instrumentType?: 'OPTION' | 'FUTURE';
}

interface InstrumentItemProps {
  instrument: InstrumentType;
  onSubscribe: (id: number, duration: number) => Promise<void>;
  isSubscribing: boolean;
}

// Constants
const SUBSCRIPTION_DURATIONS = [4, 5, 6, 7, 8, 52, 104] as const;
const SEARCH_DEBOUNCE_DELAY = 500;

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Component for displaying instrument details
// No longer used - removed for cleaner code

// Subscription duration selector component
const DurationSelector: React.FC<{
  duration: number;
  onDurationChange: (duration: number) => void;
}> = memo(({ duration, onDurationChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="w-40 border-border bg-background hover:bg-muted"
      >
        {duration} weeks
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-background border-border">
      {SUBSCRIPTION_DURATIONS.map(weeks => (
        <DropdownMenuItem key={weeks} onClick={() => onDurationChange(weeks)}>
          {weeks} weeks
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
));

DurationSelector.displayName = 'DurationSelector';

// Individual instrument item component
const InstrumentItem: React.FC<InstrumentItemProps> = memo(
  ({ instrument, onSubscribe, isSubscribing }) => {
    const [duration, setDuration] = useState<number>(4);

    const getInstrumentTypeIcon = useCallback(() => {
      if (instrument.series === 'OPTION') {
        return instrument.option_type === 'CE' ? '📞' : '📉';
      }
      if (instrument.series === 'FUTURE') return '📊';
      return '🏢';
    }, [instrument.series, instrument.option_type]);

    const getInstrumentTypeBadge = useCallback(() => {
      if (instrument.series === 'OPTION') {
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs">{getInstrumentTypeIcon()}</span>
            <span className="text-xs font-semibold text-accent-foreground">
              {instrument.option_type} Option
            </span>
          </div>
        );
      }
      if (instrument.series === 'FUTURE') {
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs">📊</span>
            <span className="text-xs font-semibold text-primary">Future</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs">🏢</span>
          <span className="text-xs font-semibold text-muted-foreground">
            Equity
          </span>
        </div>
      );
    }, [instrument.series, instrument.option_type, getInstrumentTypeIcon]);

    const handleSubscribeClick = useCallback(() => {
      onSubscribe(instrument.id, duration);
    }, [onSubscribe, instrument.id, duration]);

    return (
      <motion.div
        {...fadeInUp}
        className="flex flex-col justify-between p-6 transition-all duration-200 ease-in-out border-b border-border sm:flex-row sm:items-center hover:bg-muted/50 group"
      >
        <div className="flex-grow mb-4 sm:mb-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold transition-colors text-foreground group-hover:text-primary">
              {instrument.exchange_code}
            </h3>
            {getInstrumentTypeBadge()}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">📊</span>
                <span className="font-medium">Token:</span>
                <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                  {instrument.stock_token || instrument.token}
                </span>
              </div>
              {instrument.series && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Series:</span>
                  <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                    {instrument.series}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-xs">🏢</span>
                <span className="font-medium">Exchange:</span>
                <span>{instrument.exchange_code}</span>
              </div>
              {instrument.expiry && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">📅</span>
                  <span className="font-medium">Expiry:</span>
                  <span className="px-2 py-1 text-xs rounded bg-accent/10 text-accent">
                    {instrument.expiry}
                  </span>
                </div>
              )}
            </div>

            {instrument.strike_price !== null && instrument.option_type && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs">💰</span>
                  <span className="font-medium">Strike:</span>
                  <span className="px-2 py-1 font-mono text-xs rounded bg-primary/10 text-primary">
                    ₹{instrument.strike_price}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">
                    {instrument.option_type === 'CE' ? '📞' : '📉'}
                  </span>
                  <span className="font-medium">Type:</span>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs rounded font-semibold',
                      instrument.option_type === 'CE'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {instrument.option_type}
                  </span>
                </div>
              </div>
            )}

            {instrument.company_name && (
              <div className="flex items-start gap-1 mt-2">
                <span className="text-xs mt-0.5">🏭</span>
                <div>
                  <span className="font-medium">Company:</span>
                  <p className="mt-0.5 text-foreground font-medium">
                    {instrument.company_name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center mt-4 space-x-3 sm:mt-0">
          <DurationSelector
            duration={duration}
            onDurationChange={setDuration}
          />
          <Button
            variant="default"
            size="lg"
            onClick={handleSubscribeClick}
            disabled={isSubscribing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px] action-button"
          >
            {isSubscribing ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }
);

InstrumentItem.displayName = 'InstrumentItem';

// Virtualized list item component for performance
const VirtualizedInstrumentItem = memo(
  ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: {
      instruments: InstrumentType[];
      onSubscribe: (id: number, duration: number) => Promise<void>;
      subscribingIds: number[];
    };
  }) => {
    const { instruments, onSubscribe, subscribingIds } = data;
    const instrument = instruments[index];

    if (!instrument) return null;

    return (
      <div style={style}>
        <InstrumentItem
          instrument={instrument}
          onSubscribe={onSubscribe}
          isSubscribing={subscribingIds.includes(instrument.id)}
        />
      </div>
    );
  }
);

VirtualizedInstrumentItem.displayName = 'VirtualizedInstrumentItem';

// Item height constant for virtualization
const ITEM_HEIGHT = 220;
const Instrument: React.FC<Props> = ({
  exchange,
  searchTerm,
  optionType,
  strikePrice,
  expiryAfter,
  expiryBefore,
  instrumentType,
}) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [debouncedOptionType, setDebouncedOptionType] = useState(optionType);
  const [debouncedStrikePrice, setDebouncedStrikePrice] = useState(strikePrice);
  const [debouncedExpiryAfter, setDebouncedExpiryAfter] = useState(expiryAfter);
  const [debouncedExpiryBefore, setDebouncedExpiryBefore] =
    useState(expiryBefore);
  const [debouncedInstrumentType, setDebouncedInstrumentType] =
    useState(instrumentType);
  const [subscribingIds, setSubscribingIds] = useState<number[]>([]);

  const [subscribeInstrument] = useSubscribeInstrumentMutation();
  const { refetch } = useGetSubscribedInstrumentsQuery('');

  const queryParams = useMemo(
    () => ({
      exchange,
      search: debouncedSearchTerm,
      optionType: debouncedOptionType,
      strikePrice: debouncedStrikePrice,
      expiryAfter: debouncedExpiryAfter,
      expiryBefore: debouncedExpiryBefore,
      instrumentType: debouncedInstrumentType,
    }),
    [
      exchange,
      debouncedSearchTerm,
      debouncedOptionType,
      debouncedStrikePrice,
      debouncedExpiryAfter,
      debouncedExpiryBefore,
      debouncedInstrumentType,
    ]
  );

  const shouldSkipQuery = useMemo(() => {
    return exchange !== 'FON'
      ? debouncedSearchTerm.length < 3
      : debouncedSearchTerm.length < 3 &&
          !debouncedOptionType &&
          !debouncedStrikePrice &&
          !debouncedExpiryAfter &&
          !debouncedExpiryBefore &&
          !debouncedInstrumentType;
  }, [
    exchange,
    debouncedSearchTerm,
    debouncedOptionType,
    debouncedStrikePrice,
    debouncedExpiryAfter,
    debouncedExpiryBefore,
    debouncedInstrumentType,
  ]);

  const { data, isLoading, isError } = useGetInstrumentsQuery(queryParams, {
    skip: shouldSkipQuery,
  });

  // Memoize instruments data to prevent unnecessary re-renders
  const instruments = useMemo(() => data?.data || [], [data?.data]);
  const instrumentsCount = instruments.length;
  const useVirtualization = instrumentsCount > 5; // Use virtualization for large lists

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setDebouncedOptionType(optionType);
      setDebouncedStrikePrice(strikePrice);
      setDebouncedExpiryAfter(expiryAfter);
      setDebouncedExpiryBefore(expiryBefore);
      setDebouncedInstrumentType(instrumentType);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    optionType,
    strikePrice,
    expiryAfter,
    expiryBefore,
    instrumentType,
  ]);

  const handleSubscribe = useCallback(
    async (id: number, duration: number) => {
      setSubscribingIds(prev => [...prev, id]);
      try {
        await subscribeInstrument({ id, duration }).unwrap();
        await refetch();
        toast.success('Instrument Subscribed');
      } catch {
        toast.error('Failed to subscribe to instrument');
      } finally {
        setSubscribingIds(prev => prev.filter(subId => subId !== id));
      }
    },
    [subscribeInstrument, refetch]
  );

  // Memoize virtualization data
  const virtualizationData = useMemo(
    () => ({
      instruments,
      onSubscribe: handleSubscribe,
      subscribingIds,
    }),
    [instruments, handleSubscribe, subscribingIds]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-muted/50">
        <Spinner className="w-12 h-12 text-primary" />
        <p className="mt-4 text-lg font-medium text-foreground">
          Loading instruments...
        </p>
        <p className="text-sm text-muted-foreground">
          Please wait while we fetch the latest data
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-destructive/5">
        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-destructive/10">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-destructive">
          Error Loading Instruments
        </h3>
        <p className="max-w-md text-sm text-center text-muted-foreground">
          We encountered an issue while fetching the instruments. Please try
          refreshing the page or contact support if the problem persists.
        </p>
      </div>
    );
  }

  if (instrumentsCount === 0) {
    return (
      <motion.div
        {...fadeIn}
        className="flex flex-col items-center justify-center h-96 bg-muted/30"
      >
        <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-muted">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          No Instruments Found
        </h3>
        <p className="max-w-md text-center text-muted-foreground">
          Try adjusting your search terms or filters to find the instruments
          you're looking for.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="border-0 rounded-none shadow-none">
      {/* Performance indicator for large datasets */}
      {useVirtualization && (
        <div className="px-4 py-2 text-xs border-b text-muted-foreground bg-muted/30 border-border">
          Displaying {instrumentsCount} instruments with performance
          optimization
        </div>
      )}

      {useVirtualization ? (
        <List
          height={600}
          width="100%"
          itemCount={instrumentsCount}
          itemSize={ITEM_HEIGHT}
          itemData={virtualizationData}
          overscanCount={5}
        >
          {VirtualizedInstrumentItem}
        </List>
      ) : (
        <AnimatePresence>
          {instruments.map((instrument: InstrumentType) => (
            <InstrumentItem
              key={instrument.id}
              instrument={instrument}
              onSubscribe={handleSubscribe}
              isSubscribing={subscribingIds.includes(instrument.id)}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Instrument;
