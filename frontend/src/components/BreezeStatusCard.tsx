import React from "react";
import { useCheckBreezeStatusQuery } from "../services/breezeServices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Breeze Session Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{"data" in error ? error.data?.data : "An unexpected error occurred."}</AlertDescription>
          </Alert>
        ) : breezeStatusData ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <StatusItem title="Session Status" status={breezeStatusData.data.session_status} />
            <StatusItem title="Live Feed Status" status={breezeStatusData.data.websocket_status} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

interface StatusItemProps {
  title: string;
  status: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({ title, status }) => (
  <div className="p-4 border rounded-lg">
    <h3 className="mb-2 text-sm font-semibold">{title}</h3>
    <Badge variant={status ? "success" : "destructive"}>{status ? "Connected" : "Disconnected"}</Badge>
  </div>
);

export default BreezeStatusCard;
