import React, { useEffect, useState, useMemo } from "react";
import {
  useDeleteInstrumentMutation,
  useGetSubscribedInstrumentsQuery,
} from "../app/api/instrumentService";
import { useStartWebsocketMutation } from "../app/api/breezeServices";
import { toast } from "react-toastify";
import { HiRefresh, HiSearch, HiChartBar, HiClock } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstrumentCard } from "@/components/InstrumentCard";
import { Instrument } from "../lib/common-types";
import BreezeStatusCard from "@/components/BreezeStatusCard";
import {
  PageLayout,
  PageHeader,
  PageSubHeader,
  PageActions,
  PageContent,
} from "@/components/layout/page-layout.component";

const HomePage: React.FC = () => {
  const { data, refetch } = useGetSubscribedInstrumentsQuery("");
  const [deleteInstrument] = useDeleteInstrumentMutation();
  const [startWebsocket] = useStartWebsocketMutation();
  const [deletingRowIds, setDeletingRowIds] = useState<number[]>([]);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<"percentage" | "name">(
    "percentage",
  );
  const [activeTab, setActiveTab] = useState("all");

  const sortedAndFilteredInstruments = useMemo(() => {
    if (!data?.data) return [];
    let filtered = data.data.filter((instrument: Instrument) =>
      [instrument.exchange_code, instrument.company_name].some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (instrument: Instrument) =>
          instrument.series === activeTab.toUpperCase(),
      );
    }
    return filtered.sort((a: Instrument, b: Instrument) => {
      return sortOption === "percentage"
        ? (a.percentage?.percentage || 0) - (b.percentage?.percentage || 0)
        : (a.exchange_code || "").localeCompare(b.exchange_code || "");
    });
  }, [data, searchTerm, sortOption, activeTab]);

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
      {
        name: "Worker 2",
        url: "https://breeze-backend-celery-2.onrender.com/",
      },
      {
        name: "Worker 3",
        url: "https://breeze-backend-celery-3.onrender.com/",
      },
    ];

    const toastIds = workers.map((worker) =>
      toast.loading(`Checking ${worker.name}...`, { position: "bottom-right" }),
    );

    try {
      const responses = await Promise.all(
        workers.map((worker) =>
          fetch(worker.url)
            .then((response) => ({
              worker,
              status: response.ok ? "Healthy" : "Unhealthy",
            }))
            .catch(() => ({ worker, status: "Error" })),
        ),
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

  useEffect(() => {
    if (window.location.hostname !== "localhost") {
      performHealthCheck();
      const interval = setInterval(performHealthCheck, 120000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        data?.data?.some(
          (instrument: Instrument) => !instrument.percentage?.is_loading,
        )
      ) {
        refetch();
      } else {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [data, refetch]);

  return (
    <PageLayout
      header={
        <PageHeader>
          <span className="bg-clip-text bg-gradient-to-r from-primary to-accent">
            Instrument Dashboard
          </span>
        </PageHeader>
      }
      subheader={
        <PageSubHeader>
          Monitor and manage your subscribed instruments in real-time
        </PageSubHeader>
      }
      actions={
        <PageActions>
          {window.location.hostname !== "localhost" && (
            <Button
              onClick={performHealthCheck}
              disabled={isHealthChecking}
              variant="outline"
              size="sm"
            >
              <HiRefresh
                className={`mr-2 h-4 w-4 ${
                  isHealthChecking ? "animate-spin" : ""
                }`}
              />
              {isHealthChecking ? "Checking..." : "Health Check"}
            </Button>
          )}
          <Button onClick={refetch} variant="outline" size="sm">
            <HiRefresh className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => startWebsocket({})}
            variant="default"
            size="sm"
          >
            <HiRefresh className="w-4 h-4 mr-2" />
            Live Feed
          </Button>
        </PageActions>
      }
    >
      <PageContent>
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          <BreezeStatusCard />
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Instruments</CardTitle>
              <HiChartBar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sortedAndFilteredInstruments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active instruments
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Last Update</CardTitle>
              <HiClock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date().toLocaleTimeString()}
              </div>
              <p className="text-xs text-muted-foreground">Updates every 2s</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="equity">Equity</TabsTrigger>
              <TabsTrigger value="future">Future</TabsTrigger>
              <TabsTrigger value="option">Option</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              type="text"
              placeholder="Search instruments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
            <Select
              value={sortOption}
              onValueChange={(value) =>
                setSortOption(value as "percentage" | "name")
              }
            >
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

        <AnimatePresence>
          {data ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {sortedAndFilteredInstruments.map((instrument: Instrument) => (
                <motion.div
                  key={instrument.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <InstrumentCard
                    instrument={instrument}
                    onDelete={handleDelete}
                    isDeleting={deletingRowIds.includes(instrument.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </AnimatePresence>

        {sortedAndFilteredInstruments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64">
            <HiSearch className="w-16 h-16 mb-4 text-muted-foreground" />
            <p className="text-xl font-medium text-muted-foreground">
              No instruments found
            </p>
          </div>
        )}
      </PageContent>
    </PageLayout>
  );
};

export default HomePage;
