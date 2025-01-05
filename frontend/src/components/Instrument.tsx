"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useGetInstrumentsQuery, useGetSubscribedInstrumentsQuery, useSubscribeInstrumentMutation } from "@/services/instrumentService";
import { Instrument as InstrumentType } from "@/common-types";
import { Spinner } from "./ui/spinner";

type Props = {
  exchange: string;
  searchTerm: string;
};

interface InstrumentItemProps {
  instrument: InstrumentType;
  onSubscribe: (id: number, duration: number) => void;
  isSubscribing: boolean;
}

const InstrumentItem: React.FC<InstrumentItemProps> = ({ instrument, onSubscribe, isSubscribing }) => {
  const [duration, setDuration] = useState(4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-between p-4 transition-colors duration-150 ease-in-out border-b sm:flex-row sm:items-center border-border hover:bg-accent/5"
    >
      <div className="flex-grow mb-3 sm:mb-0">
        <h3 className="text-lg font-semibold text-foreground">{instrument.exchange_code}</h3>
        <div className="mt-1 space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium">Symbol:</span> {instrument.stock_token || instrument.token} |<span className="ml-2 font-medium">Series:</span> {instrument.series}
          </p>
          <p>
            <span className="font-medium">Exchange:</span> {instrument.exchange_code} |<span className="ml-2 font-medium">Expiry:</span> {instrument.expiry || "N/A"}
          </p>
          {instrument.strike_price !== null && instrument.option_type && (
            <p>
              <span className="font-medium">Strike:</span> {instrument.strike_price} |<span className="ml-2 font-medium">Type:</span> {instrument.option_type}
            </p>
          )}
          <p>
            <span className="font-medium">Company Name:</span> <span>{instrument.company_name}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-40">
              {duration} weeks
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[4, 5, 6, 7, 8, 52, 104].map((weeks) => (
              <DropdownMenuItem key={weeks} onClick={() => setDuration(weeks)}>
                {weeks} weeks
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="default" size="sm" onClick={() => onSubscribe(instrument.id, duration)} disabled={isSubscribing}>
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

const Instrument = ({ exchange, searchTerm }: Props) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [subscribeInstrument] = useSubscribeInstrumentMutation();
  const { refetch } = useGetSubscribedInstrumentsQuery("");
  const [subscribingIds, setSubscribingIds] = useState<number[]>([]);

  const { data, isLoading, isError } = useGetInstrumentsQuery(
    {
      exchange,
      search: debouncedSearchTerm,
    },
    {
      skip: debouncedSearchTerm.length < 3,
    }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSubscribe = async (id: number, duration: number) => {
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
  };

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
        {data &&
          data.data?.map((instrument: InstrumentType) => (
            <InstrumentItem key={instrument.id} instrument={instrument} onSubscribe={handleSubscribe} isSubscribing={subscribingIds.includes(instrument.id)} />
          ))}
      </AnimatePresence>
      {(!data || data.data?.length === 0) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center text-muted-foreground">
          No instruments found. Try adjusting your search.
        </motion.p>
      )}
    </Card>
  );
};

export default Instrument;
