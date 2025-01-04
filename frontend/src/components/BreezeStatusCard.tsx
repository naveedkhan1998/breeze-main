import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, WifiOff, Wifi, AlertCircle } from "lucide-react";
import { useCheckBreezeStatusQuery } from "@/services/breezeServices";

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
    pollingInterval: 5000,
  }) as {
    data: BreezeStatusData;
    error: { data?: { data: string } };
    isLoading: boolean;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <CardTitle className="text-xl font-semibold">Breeze Status Monitor</CardTitle>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </div>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="ml-2">{"data" in error ? error.data?.data : "Unable to fetch status. Please try again later."}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <StatusItem title="Session Status" status={breezeStatusData?.data.session_status ?? false} isLoading={isLoading} icon={breezeStatusData?.data.session_status ? Wifi : WifiOff} />
            <StatusItem title="Live Feed Status" status={breezeStatusData?.data.websocket_status ?? false} isLoading={isLoading} icon={breezeStatusData?.data.websocket_status ? Wifi : WifiOff} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface StatusItemProps {
  title: string;
  status: boolean;
  isLoading: boolean;
  icon: React.ElementType;
}

const StatusItem: React.FC<StatusItemProps> = ({ title, status, isLoading, icon: Icon }) => {
  const bgColor = status ? "bg-green-50" : "bg-red-50";
  const textColor = status ? "text-green-700" : "text-red-700";

  return (
    <div className={`p-6 rounded-lg border transition-all duration-200 ${bgColor} ${isLoading ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">{title}</h3>
        <Icon className={`h-5 w-5 ${textColor}`} />
      </div>
      <div className="flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${status ? "bg-green-500" : "bg-red-500"} ${status ? "animate-pulse" : ""}`} />
        <Badge variant={status ? "success" : "destructive"} className="text-xs font-medium">
          {status ? "Connected" : "Disconnected"}
        </Badge>
      </div>
    </div>
  );
};

export default BreezeStatusCard;
