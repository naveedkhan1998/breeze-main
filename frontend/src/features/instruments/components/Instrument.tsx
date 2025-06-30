import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FixedSizeList as List } from 'react-window';

import type { Instrument as InstrumentType } from '@/types/common-types';
import { Spinner } from '@/components/ui/spinner';
import {
  useGetInstrumentsQuery,
  useGetSubscribedInstrumentsQuery,
  useSubscribeInstrumentMutation,
} from '@/api/instrumentService';
import InstrumentItem from './InstrumentItem';

// Custom hook to calculate available height
const useContainerHeight = () => {
  const [height, setHeight] = useState(500);

  useEffect(() => {
    const updateHeight = () => {
      // Use dynamic viewport height for better mobile support
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      // Calculate available height:
      // Total viewport - navbar (~60px) - page padding (~48px) - header (~80px) - filters (~120px) - padding (~32px)
      const reservedHeight = 340;
      const availableHeight = window.innerHeight - reservedHeight;
      setHeight(Math.max(300, availableHeight));
    };

    // Initial calculation
    updateHeight();

    // Add event listeners
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return height;
};

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

// Constants

const SEARCH_DEBOUNCE_DELAY = 500;

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Component for displaying instrument details
// No longer used - removed for cleaner code

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
  const containerHeight = useContainerHeight();
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
  const useVirtualization = instrumentsCount > 0; // Always use virtualization when there are items

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
      <div className="flex flex-col items-center justify-center h-full bg-muted/50">
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
      <div className="flex flex-col items-center justify-center h-full bg-destructive/5">
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
        className="flex flex-col items-center justify-center h-full bg-muted/30"
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
    <div className="flex flex-col h-full">
      {/* Performance indicator for large datasets */}
      {useVirtualization && (
        <div className="flex-shrink-0 px-4 py-2 text-xs border-b text-muted-foreground bg-muted/30 border-border">
          Displaying {instrumentsCount} instruments with performance
          optimization
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {useVirtualization ? (
          <List
            height={containerHeight}
            width="100%"
            itemCount={instrumentsCount}
            itemSize={ITEM_HEIGHT}
            itemData={virtualizationData}
            overscanCount={5}
          >
            {VirtualizedInstrumentItem}
          </List>
        ) : (
          <div className="h-full overflow-auto">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Instrument;
