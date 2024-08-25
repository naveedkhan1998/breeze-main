import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Spinner, Card } from "flowbite-react";
import { useDeleteInstrumentMutation, useGetSubscribedInstrumentsQuery } from "../services/instrumentService";
import { toast } from "react-toastify";
import { Instrument } from "../common-types";
import { HiChartBar, HiRefresh, HiTrash, HiClock, HiCurrencyDollar, HiOfficeBuilding } from "react-icons/hi";

interface InstrumentCardProps {
  instrument: Instrument;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const InstrumentCard: React.FC<InstrumentCardProps> = ({ instrument, onDelete, isDeleting }) => {
  const isLoading = instrument.percentage.some((p) => !p.is_loading);

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
    <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
      <div className="p-5">
        <h3 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white">{instrument.exchange_code}</h3>
        <div className="mb-4">{renderInstrumentDetails()}</div>
        <div className="mb-4">
          {instrument.percentage.length > 0 ? (
            instrument.percentage.map((p, index) => (
              <div key={index} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{p.percentage.toFixed(2)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div className="h-2 transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${p.percentage}%` }}></div>
                </div>
                {!p.is_loading && <Spinner size="sm" className="mt-1" />}
              </div>
            ))
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
  );
};

const getAveragePercentage = (instrument: Instrument): number => {
  if (instrument.percentage.length === 0) return 0;
  const sum = instrument.percentage.reduce((acc, curr) => acc + curr.percentage, 0);
  return sum / instrument.percentage.length;
};

const HomePage: React.FC = () => {
  const { data, refetch } = useGetSubscribedInstrumentsQuery("");
  const [deleteInstrument] = useDeleteInstrumentMutation();
  const [deletingRowIds, setDeletingRowIds] = useState<number[]>([]);
  const [isHealthChecking, setIsHealthChecking] = useState(false);

  const sortedInstruments = React.useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => getAveragePercentage(b) - getAveragePercentage(a));
  }, [data]);

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
            autoClose: 3000,
          });
        } else {
          toast.update(toastIds[index], {
            render: `${worker.name}: Unhealthy`,
            type: "error",
            isLoading: false,
            autoClose: 3000,
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
          autoClose: 3000,
        });
      });
    } finally {
      setIsHealthChecking(false);
    }
  };

  useEffect(() => {
    performHealthCheck();
    const interval = setInterval(performHealthCheck, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const allLoaded = data?.data.every((instrument: Instrument) => instrument.percentage.length > 0 && instrument.percentage.every((p) => p.is_loading));

      if (!allLoaded) {
        await refetch();
      } else {
        clearInterval(interval);
      }
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [data, refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-8 mx-auto">
        <Card className="mb-8 shadow-lg">
          <div className="flex flex-col items-center justify-between p-6 md:flex-row">
            <h1 className="mb-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 md:mb-0">Subscribed Instruments</h1>
            <div className="flex flex-col w-full space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:w-auto">
              <Button onClick={performHealthCheck} disabled={isHealthChecking} color="light" size="sm" className="w-full transition-all duration-300 hover:shadow-lg md:w-auto">
                <HiRefresh className={`mr-2 h-4 w-4 ${isHealthChecking ? "animate-spin" : ""}`} />
                {isHealthChecking ? "Checking..." : "Check Worker Health"}
              </Button>
              <Button onClick={() => refetch()} color="light" size="sm" className="w-full transition-all duration-300 hover:shadow-lg md:w-auto">
                Refresh Data
              </Button>
            </div>
          </div>
        </Card>

        {data ? (
          <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedInstruments.map((instrument: Instrument) => (
              <InstrumentCard key={instrument.id} instrument={instrument} onDelete={handleDelete} isDeleting={deletingRowIds.includes(instrument.id)} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <Spinner size="xl" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
