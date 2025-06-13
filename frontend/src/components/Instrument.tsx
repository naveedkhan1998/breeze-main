import React, { useEffect, useState, useCallback } from "react";
import { ChevronDown, Plus, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import {
  useGetInstrumentsQuery,
  useGetSubscribedInstrumentsQuery,
  useSubscribeInstrumentMutation,
} from "@/services/instrumentService";
import { Instrument as InstrumentType } from "@/common-types";
import { Spinner } from "./ui/spinner";

// Types
interface Props {
  exchange: string;
  searchTerm: string;
}

interface InstrumentItemProps {
  instrument: InstrumentType;
  onSubscribe: (id: number, duration: number) => Promise<void>;
  isSubscribing: boolean;
}

interface InstrumentDetailProps {
  label: string;
  value: string | number | null;
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
const InstrumentDetail: React.FC<InstrumentDetailProps> = ({
  label,
  value,
}) => {
  if (value === null || value === undefined) return null;

  return (
    <span>
      <span className="font-medium">{label}:</span> {value}
    </span>
  );
};

// Subscription duration selector component
const DurationSelector: React.FC<{
  duration: number;
  onDurationChange: (duration: number) => void;
}> = ({ duration, onDurationChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="w-40">
        {duration} weeks
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {SUBSCRIPTION_DURATIONS.map((weeks) => (
        <DropdownMenuItem key={weeks} onClick={() => onDurationChange(weeks)}>
          {weeks} weeks
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

// Individual instrument item component
const InstrumentItem: React.FC<InstrumentItemProps> = ({
  instrument,
  onSubscribe,
  isSubscribing,
}) => {
  const [duration, setDuration] = useState<number>(4);

  return (
    <motion.div
      {...fadeInUp}
      className="flex flex-col justify-between p-4 transition-colors duration-150 ease-in-out border-b sm:flex-row sm:items-center border-border hover:bg-accent/5"
    >
      <div className="flex-grow mb-3 sm:mb-0">
        <h3 className="text-lg font-semibold text-foreground">
          {instrument.exchange_code}
        </h3>
        <div className="mt-1 space-y-1 text-sm text-muted-foreground">
          <p>
            <InstrumentDetail
              label="Symbol"
              value={instrument.stock_token || instrument.token}
            />
            {" | "}
            <InstrumentDetail label="Series" value={instrument.series} />
          </p>
          <p>
            <InstrumentDetail
              label="Exchange"
              value={instrument.exchange_code}
            />
            {" | "}
            <InstrumentDetail
              label="Expiry"
              value={instrument.expiry || "N/A"}
            />
          </p>
          {instrument.strike_price !== null && instrument.option_type && (
            <p>
              <InstrumentDetail
                label="Strike"
                value={instrument.strike_price}
              />
              {" | "}
              <InstrumentDetail label="Type" value={instrument.option_type} />
            </p>
          )}
          <p>
            <InstrumentDetail
              label="Company Name"
              value={instrument.company_name}
            />
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <DurationSelector duration={duration} onDurationChange={setDuration} />
        <Button
          variant="default"
          size="sm"
          onClick={() => onSubscribe(instrument.id, duration)}
          disabled={isSubscribing}
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
};

// Main Instrument component
const Instrument: React.FC<Props> = ({ exchange, searchTerm }) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [subscribingIds, setSubscribingIds] = useState<number[]>([]);

  const [subscribeInstrument] = useSubscribeInstrumentMutation();
  const { refetch } = useGetSubscribedInstrumentsQuery("");

  const { data, isLoading, isError } = useGetInstrumentsQuery(
    {
      exchange,
      search: debouncedSearchTerm,
    },
    {
      skip: debouncedSearchTerm.length < 3,
    },
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSubscribe = useCallback(
    async (id: number, duration: number) => {
      setSubscribingIds((prev) => [...prev, id]);
      try {
        await subscribeInstrument({ id, duration }).unwrap();
        await refetch();
        toast.success("Instrument Subscribed");
      } catch {
        toast.error("Failed to subscribe to instrument");
      } finally {
        setSubscribingIds((prev) => prev.filter((subId) => subId !== id));
      }
    },
    [subscribeInstrument, refetch],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <AlertCircle className="w-8 h-8 mr-2" />
        Error loading instruments
      </div>
    );
  }

  return (
    <Card className="border-0 rounded-none shadow-none">
      <AnimatePresence>
        {data?.data?.map((instrument: InstrumentType) => (
          <InstrumentItem
            key={instrument.id}
            instrument={instrument}
            onSubscribe={handleSubscribe}
            isSubscribing={subscribingIds.includes(instrument.id)}
          />
        ))}
      </AnimatePresence>

      {(!data || data.data?.length === 0) && (
        <motion.p
          {...fadeIn}
          className="py-8 text-center text-muted-foreground"
        >
          No instruments found. Try adjusting your search.
        </motion.p>
      )}
    </Card>
  );
};

export default Instrument;
