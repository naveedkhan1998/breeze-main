import { useEffect, useState, useCallback } from "react";
import { Button, Spinner } from "flowbite-react";
import { useGetInstrumentsQuery, useGetSubscribedInstrumentsQuery, useSubscribeInstrumentMutation } from "../services/instrumentService";
import { Instrument as InstrumentType } from "../common-types";
import { HiPlus, HiChevronDown, HiOutlineExclamationCircle } from "react-icons/hi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-start justify-between p-4 transition-colors duration-150 ease-in-out border-b border-gray-200 sm:flex-row sm:items-center hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <div className="flex-grow mb-3 sm:mb-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{instrument.exchange_code}</h3>
        <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-semibold">Symbol:</span> {instrument.stock_token || instrument.token} |<span className="ml-2 font-semibold">Series:</span> {instrument.series}
          </p>
          <p>
            <span className="font-semibold">Exchange:</span> {instrument.exchange_code} |<span className="ml-2 font-semibold">Expiry:</span> {instrument.expiry || "N/A"}
          </p>
          {instrument.strike_price !== null && instrument.option_type && (
            <p>
              <span className="font-semibold">Strike:</span> {instrument.strike_price} |<span className="ml-2 font-semibold">Type:</span> {instrument.option_type}
            </p>
          )}
          <p>
            <span className="font-semibold">Company Name:</span> <span>{instrument.company_name}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={handleToggle}
            className="flex items-center justify-between w-40 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <span>{duration} weeks</span>
            <HiChevronDown className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 z-10 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700"
              >
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {[4, 5, 6, 7, 8, 52, 104].map((weeks) => (
                    <button
                      key={weeks}
                      onClick={() => {
                        setDuration(weeks);
                        setIsOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      role="menuitem"
                    >
                      {weeks} weeks
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button size="sm" outline gradientDuoTone="cyanToBlue" onClick={() => onSubscribe(instrument.id, duration)} disabled={isSubscribing}>
          {isSubscribing ? (
            <Spinner size="sm" />
          ) : (
            <>
              <HiPlus className="w-4 h-4 mr-2" />
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
    } catch (error) {
      toast.error("Failed to subscribe to instrument");
    } finally {
      setSubscribingIds((prev) => prev.filter((subId) => subId !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <HiOutlineExclamationCircle className="w-8 h-8 mr-2" />
        Error loading instruments
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto">
      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
        <AnimatePresence>
          {data &&
            data.data?.map((instrument: InstrumentType) => (
              <InstrumentItem key={instrument.id} instrument={instrument} onSubscribe={handleSubscribe} isSubscribing={subscribingIds.includes(instrument.id)} />
            ))}
        </AnimatePresence>
      </div>
      {(!data || data.data?.length === 0) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-center text-gray-500 dark:text-gray-400">
          No instruments found. Try adjusting your search.
        </motion.p>
      )}
    </div>
  );
};

export default Instrument;
