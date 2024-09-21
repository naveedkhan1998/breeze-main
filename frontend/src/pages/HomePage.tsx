import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDeleteInstrumentMutation, useGetSubscribedInstrumentsQuery } from "../services/instrumentService";
import { toast } from "react-toastify";
import { Instrument } from "../common-types";
import { HiChartBar, HiRefresh, HiTrash, HiClock, HiCurrencyDollar, HiOfficeBuilding, HiSearch } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Card, Spinner } from "flowbite-react";
import { useCheckBreezeStatusQuery, useStartWebsocketMutation } from "../services/breezeServices";

interface InstrumentCardProps {
  instrument: Instrument;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const InstrumentCard: React.FC<InstrumentCardProps> = ({ instrument, onDelete, isDeleting }) => {
  const isLoading = !instrument.percentage.is_loading;

  const renderInstrumentDetails = () => {
    const commonDetails = (
      <>
        <div className="flex items-center mb-2">
          <HiOfficeBuilding className="w-5 h-5 mr-2 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{instrument.company_name}</span>
        </div>
        <div className="flex items-center mb-2">
          <HiCurrencyDollar className="w-5 h-5 mr-2 text-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{instrument.exchange_code}</span>
        </div>
      </>
    );

    switch (true) {
      case instrument.series === "OPTION":
        return (
          <div>
            {commonDetails}
            <div className="flex items-center mb-2">
              <HiClock className="w-5 h-5 mr-2 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {instrument.strike_price} {instrument.option_type} (Expires: {instrument.expiry})
              </span>
            </div>
          </div>
        );
      case instrument.series === "FUTURE":
        return (
          <div>
            {commonDetails}
            <div className="flex items-center mb-2">
              <HiClock className="w-5 h-5 mr-2 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Future (Expires: {instrument.expiry})</span>
            </div>
          </div>
        );
      default:
        return (
          <div>
            {commonDetails}
            <div className="flex items-center mb-2">
              <HiCurrencyDollar className="w-5 h-5 mr-2 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Equity</span>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <div className="p-5">
          <h3 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white">{instrument.exchange_code}</h3>
          <div className="mb-4">{renderInstrumentDetails()}</div>
          <div className="mb-4">
            {instrument.percentage ? (
              <div key={instrument.id} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{instrument.percentage.percentage.toFixed(2)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${instrument.percentage.percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                {!instrument.percentage.percentage && <Spinner size="sm" className="mt-1" />}
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">No data available</span>
            )}
          </div>
        </div>
        <div className="flex justify-between gap-2 p-4 bg-gray-50 dark:bg-gray-800">
          <Link to={`/graphs/${instrument.id}`} state={{ obj: instrument }} className="w-full">
            <Button disabled={isLoading} size="sm" gradientDuoTone="cyanToBlue" className="w-full transition-all duration-300 hover:shadow-lg">
              <HiChartBar className="w-4 h-4 mr-2" />
              View Graph
            </Button>
          </Link>
          <Button size="sm" gradientDuoTone="pinkToOrange" onClick={() => onDelete(instrument.id)} className="w-full transition-all duration-300 hover:shadow-lg" disabled={isDeleting}>
            <HiTrash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

const getAveragePercentage = (instrument: Instrument): number => {
  if (!instrument.percentage) return 0;
  const sum = instrument.percentage.percentage;
  return sum;
};

const HomePage: React.FC = () => {
  const { data, refetch } = useGetSubscribedInstrumentsQuery("");
  const [deleteInstrument] = useDeleteInstrumentMutation();
  const [startWebsocket] = useStartWebsocketMutation();
  const [deletingRowIds, setDeletingRowIds] = useState<number[]>([]);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<"percentage" | "name">("percentage");
  const {
    data: breezeStatusData,
    error,
    isLoading,
  } = useCheckBreezeStatusQuery(undefined, {
    pollingInterval: 5000,
  });

  const isLocalhost = () => {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "[::1]" || /^localhost:\d+$/.test(window.location.hostname);
  };

  const sortedAndFilteredInstruments = useMemo(() => {
    if (!data?.data) return [];
    const filtered = data.data.filter(
      (instrument: Instrument) => instrument?.exchange_code?.toLowerCase().includes(searchTerm.toLowerCase()) || instrument?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a: Instrument, b: Instrument) => {
      if (sortOption === "percentage") {
        return getAveragePercentage(b) - getAveragePercentage(a);
      } else {
        return a.exchange_code?.localeCompare(b.exchange_code ?? "100%");
      }
    });
  }, [data, searchTerm, sortOption]);

  const handleDelete = async (id: number) => {
    setDeletingRowIds((prevIds) => [...prevIds, id]);
    try {
      await deleteInstrument({ id });
      await refetch();
      toast.success("Instrument successfully deleted");
    } catch (error) {
      console.error("Error deleting instrument:", error);
      toast.error("Failed to delete instrument");
    } finally {
      setDeletingRowIds((prevIds) => prevIds.filter((rowId) => rowId !== id));
    }
  };

  const performHealthCheck = async () => {
    setIsHealthChecking(true);
    const workers = [
      { name: "Worker 1", url: "https://breeze-backend-celery.onrender.com/" },
      { name: "Worker 2", url: "https://breeze-backend-celery-2.onrender.com/" },
      { name: "Worker 3", url: "https://breeze-backend-celery-3.onrender.com/" },
    ];

    const toastIds = workers.map((worker) => toast.loading(`Checking ${worker.name}...`, { position: "bottom-right" }));

    try {
      const responses = await Promise.all(
        workers.map((worker, index) =>
          fetch(worker.url)
            .then((response) => ({ worker, status: response.status, index }))
            .catch(() => ({ worker, status: "error", index }))
        )
      );

      responses.forEach(({ worker, status, index }) => {
        if (status === 200) {
          toast.update(toastIds[index], {
            render: `${worker.name}: Healthy`,
            type: "success",
            isLoading: false,
            autoClose: 1000,
          });
        } else {
          toast.update(toastIds[index], {
            render: `${worker.name}: Unhealthy`,
            type: "error",
            isLoading: false,
            autoClose: 1000,
          });
        }
      });
    } catch (error) {
      console.error("Error during health checks:", error);
      workers.forEach((worker, index) => {
        toast.update(toastIds[index], {
          render: `${worker.name}: Check failed`,
          type: "error",
          isLoading: false,
          autoClose: 1000,
        });
      });
    } finally {
      setIsHealthChecking(false);
    }
  };

  useEffect(() => {
    if (!isLocalhost()) {
      performHealthCheck();
      const interval = setInterval(performHealthCheck, 120000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const allLoaded = data?.data.every((instrument: Instrument) => instrument.percentage && instrument.percentage.is_loading);

      if (!allLoaded) {
        await refetch();
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [data, refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-8 mx-auto">
        <Card className="mb-8 shadow-lg">
          <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Breeze Session Status</h2>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-md">
                <p className="font-bold">Error:</p>
                <p>{error.data || "An unexpected error occurred."}</p>
              </div>
            ) : breezeStatusData ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                  <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">Session Status</h3>
                  <Badge color={breezeStatusData.data.session_status ? "success" : "danger"} size="lg">
                    {breezeStatusData.data.session_status ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                  <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">Live Feed Status</h3>
                  <Badge color={breezeStatusData.data.websocket_status ? "success" : "danger"} size="lg">
                    {breezeStatusData.data.websocket_status ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
        <Card className="mb-8 shadow-lg">
          <div className="flex flex-col items-center justify-between p-6 md:flex-row">
            <h1 className="mb-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 md:mb-0">Subscribed Instruments</h1>

            <div className="flex flex-col w-full space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:w-auto">
              {!isLocalhost() && (
                <Button onClick={performHealthCheck} disabled={isHealthChecking} color="light" size="sm" className="w-full transition-all duration-300 hover:shadow-lg md:w-auto">
                  <HiRefresh className={`mr-2 h-4 w-4 ${isHealthChecking ? "animate-spin" : ""}`} />
                  {isHealthChecking ? "Checking..." : "Check Worker Health"}
                </Button>
              )}
              <Button onClick={() => refetch()} color="light" size="sm" className="w-full transition-all duration-300 hover:shadow-lg md:w-auto">
                <HiRefresh className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button onClick={() => startWebsocket({})} color="light" size="sm" className="w-full transition-all duration-300 hover:shadow-lg md:w-auto">
                <HiRefresh className="w-4 h-4 mr-2" />
                Start Live Feed
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col items-center justify-between mb-6 space-y-4 md:flex-row md:space-y-0">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search instruments..."
              className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <HiSearch className="absolute w-5 h-5 text-gray-400 left-3 top-2.5" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <select
              className="px-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as "percentage" | "name")}
            >
              <option value="percentage">Percentage</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {data ? (
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
              {sortedAndFilteredInstruments.map((instrument: Instrument) => (
                <InstrumentCard key={instrument.id} instrument={instrument} onDelete={handleDelete} isDeleting={deletingRowIds.includes(instrument.id)} />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="flex items-center justify-center h-64">
            <Spinner size="xl" />
          </div>
        )}

        {sortedAndFilteredInstruments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64">
            <HiSearch className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-xl font-medium text-gray-600 dark:text-gray-400">No instruments found</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Badge color="info" size="xl">
            Total Instruments: {sortedAndFilteredInstruments.length}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
