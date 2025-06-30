import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, WifiOff, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { useCheckBreezeStatusQuery } from '@/api/breezeServices';

type BreezeStatusData = {
  data: {
    session_status: boolean;
    websocket_status: boolean;
  };
};

const iconVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
  },
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
    return 'data' in error
      ? error.data?.data
      : 'Unable to fetch status. Please try again later.';
  }, [error]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <Card className="w-full overflow-hidden shadow-lg bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="p-6 bg-muted/50">
          <motion.div
            variants={iconVariants}
            className="flex items-center justify-between"
          >
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Breeze Status Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent className="p-6">
          {errorMessage ? (
            <motion.div variants={iconVariants}>
              <Alert variant="destructive">
                <AlertCircle className="w-5 h-5" />
                <AlertDescription className="ml-3">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : (
            <motion.div
              variants={iconVariants}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <StatusItem
                title="Session Status"
                status={breezeStatusData?.data.session_status ?? false}
                isLoading={isLoading}
                icon={breezeStatusData?.data.session_status ? Wifi : WifiOff}
                description="Your session connection status"
              />
              <StatusItem
                title="Live Feed Status"
                status={breezeStatusData?.data.websocket_status ?? false}
                isLoading={isLoading}
                icon={breezeStatusData?.data.websocket_status ? Wifi : WifiOff}
                description="Real-time data connection"
              />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
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
  return (
    <div
      className={`p-4 space-y-4 rounded-lg bg-background/50 ${
        isLoading ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center font-semibold text-muted-foreground">
          <Icon
            className={`w-5 h-5 mr-3 ${status ? 'text-green-500' : 'text-red-500'}`}
          />
          {title}
        </h3>
        <Badge
          variant={status ? 'success' : 'destructive'}
          className="flex items-center gap-1"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              status ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          {status ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default BreezeStatusCard;
