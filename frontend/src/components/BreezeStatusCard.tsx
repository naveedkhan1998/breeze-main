import React from "react";
import { Spinner, Badge, Card } from "flowbite-react";
import { useCheckBreezeStatusQuery } from "../services/breezeServices";

type BreezeStatusData = {
  data: {
    session_status: boolean;
    websocket_status: boolean;
  };
};

const BreezeStatusCard: React.FC = () => {
  const {
    data: breezeStatusData,
    error,
    isLoading,
  } = useCheckBreezeStatusQuery(undefined, {
    pollingInterval: 5000, // Poll every 5 seconds for real-time updates
  }) as {
    data: BreezeStatusData;
    error: { data?: { data: string } };
    isLoading: boolean;
  };

  return (
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
            <p>{"data" in error ? error.data?.data : "An unexpected error occurred."}</p>
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
  );
};

export default BreezeStatusCard;
