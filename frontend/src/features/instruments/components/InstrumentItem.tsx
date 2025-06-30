import React, { useState, useCallback, memo } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import type { Instrument as InstrumentType } from '@/types/common-types';
import { Spinner } from '@/components/ui/spinner';
import DurationSelector from './DurationSelector';

interface InstrumentItemProps {
  instrument: InstrumentType;
  onSubscribe: (id: number, duration: number) => Promise<void>;
  isSubscribing: boolean;
}

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

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

export default InstrumentItem;
