import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, WifiOff, Wifi, AlertCircle } from "lucide-react";
import { useCheckBreezeStatusQuery } from "@/api/breezeServices";

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
    refetch,
  } = useCheckBreezeStatusQuery(undefined, {
    pollingInterval: 5000,
    refetchOnFocus: true,
  }) as {
    data: BreezeStatusData;
    error: { data?: { data: string } };
    isLoading: boolean;
    refetch: () => void;
  };

  // Derived state for error message
  const errorMessage = React.useMemo(() => {
    if (!error) return null;
    return "data" in error
      ? error.data?.data
      : "Unable to fetch status. Please try again later.";
  }, [error]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <CardTitle className="text-xl font-semibold">
          Breeze Status Monitor
        </CardTitle>
        <div className="flex items-center gap-4">
          {isLoading && (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
          <button
            onClick={() => refetch()}
            className="text-sm transition-colors text-muted-foreground hover:text-foreground"
            disabled={isLoading}
            aria-label="Refresh status"
          >
            Refresh
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage ? (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="ml-2">{errorMessage}</AlertDescription>
          </Alert>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            role="region"
            aria-label="Status indicators"
          >
            <StatusItem
              title="Session Status"
              status={breezeStatusData?.data.session_status ?? false}
              isLoading={isLoading}
              icon={breezeStatusData?.data.session_status ? Wifi : WifiOff}
              description="Indicates if your session is active"
            />
            <StatusItem
              title="Live Feed Status"
              status={breezeStatusData?.data.websocket_status ?? false}
              isLoading={isLoading}
              icon={breezeStatusData?.data.websocket_status ? Wifi : WifiOff}
              description="Shows real-time connection status"
            />
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
  description: string;
}

const StatusItem: React.FC<StatusItemProps> = ({
  title,
  status,
  isLoading,
  icon: Icon,
  description,
}) => {
  const bgColor = status
    ? "bg-green-50 dark:bg-green-900/20"
    : "bg-red-50 dark:bg-red-900/20";
  const textColor = status
    ? "text-green-700 dark:text-green-400"
    : "text-red-700 dark:text-red-400";
  const borderColor = status
    ? "border-green-100 dark:border-green-800"
    : "border-red-100 dark:border-red-800";

  return (
    <div
      className={`p-6 rounded-lg border transition-all duration-200 ${bgColor} ${borderColor} ${
        isLoading ? "opacity-50" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-label={`${title}: ${status ? "Connected" : "Disconnected"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-foreground">{title}</h3>
        <Icon className={`h-5 w-5 ${textColor}`} aria-hidden="true" />
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <div className="flex items-center space-x-2">
        <div
          className={`h-2 w-2 rounded-full ${
            status ? "bg-green-500" : "bg-red-500"
          } ${status ? "animate-pulse" : ""}`}
          aria-hidden="true"
        />
        <Badge
          variant={status ? "success" : "destructive"}
          className="text-xs font-medium"
        >
          {status ? "Connected" : "Disconnected"}
        </Badge>
      </div>
    </div>
  );
};

export default BreezeStatusCard;
