import React, { useEffect, useState, useMemo } from "react";
import { useDeleteInstrumentMutation, useGetSubscribedInstrumentsQuery } from "../services/instrumentService";
import { useStartWebsocketMutation } from "../services/breezeServices";
import { toast } from "react-toastify";
import { HiRefresh, HiSearch } from "react-icons/hi";
import { AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BreezeStatusCard from "@/components/BreezeStatusCard";
import { InstrumentCard } from "@/components/InstrumentCard";
import { Instrument } from "../common-types";

// Utility functions remain unchanged
const getAveragePercentage = (instrument: Instrument): number => {
  return instrument.percentage?.percentage || 0;
};

const isLocalhost = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || /^localhost:\d+$/.test(hostname);
};

const HomePage: React.FC = () => {
  const { data, refetch } = useGetSubscribedInstrumentsQuery("");
  const [deleteInstrument] = useDeleteInstrumentMutation();
  const [startWebsocket] = useStartWebsocketMutation();

  const [deletingRowIds, setDeletingRowIds] = useState<number[]>([]);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<"percentage" | "name">("percentage");

  // Memoized sorting and filtering logic remains unchanged
  const sortedAndFilteredInstruments = useMemo(() => {
    if (!data?.data) return [];
    const filtered = data.data.filter((instrument: Instrument) => [instrument.exchange_code, instrument.company_name].some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase())));
    return filtered.sort((a: Instrument, b: Instrument) => {
      return sortOption === "percentage" ? getAveragePercentage(b) - getAveragePercentage(a) : a.exchange_code?.localeCompare(b.exchange_code || "");
    });
  }, [data, searchTerm, sortOption]);

  // Handler functions remain unchanged
  const handleDelete = async (id: number) => {
    setDeletingRowIds((prev) => [...prev, id]);
    try {
      await deleteInstrument({ id });
      await refetch();
      toast.success("Instrument successfully deleted");
    } catch (error) {
      console.error("Error deleting instrument:", error);
      toast.error("Failed to delete instrument");
    } finally {
      setDeletingRowIds((prev) => prev.filter((rowId) => rowId !== id));
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
        workers.map((worker) =>
          fetch(worker.url)
            .then((response) => ({ worker, status: response.ok ? "Healthy" : "Unhealthy" }))
            .catch(() => ({ worker, status: "Error" }))
        )
      );

      responses.forEach(({ worker, status }, index) => {
        toast.update(toastIds[index], {
          render: `${worker.name}: ${status}`,
          type: status === "Healthy" ? "success" : "error",
          isLoading: false,
          autoClose: 1000,
        });
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

  // Effects remain unchanged
  useEffect(() => {
    if (!isLocalhost()) {
      performHealthCheck();
      const interval = setInterval(performHealthCheck, 120000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data?.data?.some((instrument: Instrument) => instrument.percentage?.is_loading)) {
        refetch();
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [data, refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container px-4 py-8 mx-auto">
        <BreezeStatusCard />
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Subscribed Instruments</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex space-y-2 md:space-y-0 md:space-x-2">
              {!isLocalhost() && (
                <Button onClick={performHealthCheck} disabled={isHealthChecking} variant="outline" size="sm">
                  <HiRefresh className={`mr-2 h-4 w-4 ${isHealthChecking ? "animate-spin" : ""}`} />
                  {isHealthChecking ? "Checking..." : "Check Worker Health"}
                </Button>
              )}
              <Button onClick={refetch} variant="outline" size="sm">
                <HiRefresh className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button onClick={() => startWebsocket({})} variant="outline" size="sm">
                <HiRefresh className="w-4 h-4 mr-2" />
                Start Live Feed
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-between mb-6 space-y-4 md:flex-row md:space-y-0">
          <div className="relative w-full md:w-64">
            <Input type="text" placeholder="Search instruments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            <HiSearch className="absolute w-5 h-5 text-muted-foreground left-3 top-2.5" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as "percentage" | "name")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          </div>
        )}

        {sortedAndFilteredInstruments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64">
            <HiSearch className="w-16 h-16 mb-4 text-muted-foreground" />
            <p className="text-xl font-medium text-muted-foreground">No instruments found</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Badge variant="secondary" className="px-4 py-2 text-lg">
            Total Instruments: {sortedAndFilteredInstruments.length}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
