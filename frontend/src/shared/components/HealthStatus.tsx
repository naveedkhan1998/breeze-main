import type React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  AlertTriangle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAppSelector } from 'src/app/hooks';
import { selectHealthStatus } from 'src/features/health/healthSlice';
import type { HealthStatus } from 'src/features/health/healthSlice';

const StatusIndicator = ({
  status,
  size = 'sm',
}: {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (status === 'ok') {
    return <CheckCircle className={`${sizeClasses[size]} text-success`} />;
  }

  if (status === 'pending') {
    return (
      <Clock className={`${sizeClasses[size]} text-warning animate-pulse`} />
    );
  }

  return <XCircle className={`${sizeClasses[size]} text-destructive`} />;
};

const StatusBadge = ({ status }: { status: HealthStatus }) => {
  const variants = {
    ok: {
      variant: 'default' as const,
      className:
        'bg-success/10 text-success-foreground hover:bg-success/10 border-success/20',
      text: 'Healthy',
    },
    pending: {
      variant: 'secondary' as const,
      className:
        'bg-warning/10 text-warning-foreground hover:bg-warning/10 border-warning/20',
      text: 'Checking',
    },
    error: {
      variant: 'destructive' as const,
      className:
        'bg-destructive/10 text-destructive-foreground hover:bg-destructive/10 border-destructive/20',
      text: 'Error',
    },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.text}
    </Badge>
  );
};

const OverallStatusDisplay = ({
  status,
  serviceCount,
}: {
  status: HealthStatus;
  serviceCount: number;
}) => {
  const statusConfig = {
    ok: {
      icon: <Wifi className="w-5 h-5 text-success" />,
      text: 'All Systems Operational',
      description: `${serviceCount} services running normally`,
      bgColor: 'bg-success/5',
      borderColor: 'border-success/20',
    },
    pending: {
      icon: <Activity className="w-5 h-5 text-warning animate-pulse" />,
      text: 'System Check in Progress',
      description: 'Monitoring service health...',
      bgColor: 'bg-warning/5',
      borderColor: 'border-warning/20',
    },
    error: {
      icon: <WifiOff className="w-5 h-5 text-destructive" />,
      text: 'Service Issues Detected',
      description: 'Some services may be experiencing problems',
      bgColor: 'bg-destructive/5',
      borderColor: 'border-destructive/20',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-center gap-3">
        {config.icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{config.text}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {config.description}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
};

const ServiceStatusItem = ({
  name,
  status,
}: {
  name: string;
  status: HealthStatus;
}) => {
  const formatServiceName = (name: string) => {
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex items-center justify-between px-1 py-2 transition-colors rounded-md hover:bg-accent/50">
      <div className="flex items-center flex-1 min-w-0 gap-3">
        <StatusIndicator status={status} size="sm" />
        <span className="text-sm font-medium truncate text-foreground">
          {formatServiceName(name)}
        </span>
      </div>
      <StatusBadge status={status} />
    </div>
  );
};

const HealthStatusComponent: React.FC = () => {
  const healthStatus = useAppSelector(selectHealthStatus);

  const getOverallStatus = (): HealthStatus => {
    const statuses = Object.values(healthStatus);
    if (statuses.length === 0) return 'pending';
    if (statuses.some(status => status === 'pending')) return 'pending';
    if (statuses.some(status => status === 'error')) return 'error';
    return 'ok';
  };

  const overallStatus = getOverallStatus();
  const serviceCount = Object.keys(healthStatus).length;
  const healthyCount = Object.values(healthStatus).filter(
    status => status === 'ok'
  ).length;
  const errorCount = Object.values(healthStatus).filter(
    status => status === 'error'
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-colors hover:bg-accent"
          aria-label={`System status: ${overallStatus}`}
        >
          <StatusIndicator status={overallStatus} size="md" />
          {errorCount > 0 && (
            <span className="absolute flex items-center justify-center w-3 h-3 rounded-full -top-1 -right-1 bg-destructive">
              <span className="text-xs font-bold text-destructive-foreground">
                {errorCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-0 w-80" align="end">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">System Health</h3>
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <OverallStatusDisplay
            status={overallStatus}
            serviceCount={serviceCount}
          />

          {serviceCount > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Service Details
                </span>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    {healthyCount}
                  </span>
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                      {errorCount}
                    </span>
                  )}
                </div>
              </div>

              <Separator className="mb-2" />

              <div className="space-y-1 overflow-y-auto max-h-60">
                {Object.entries(healthStatus).length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <div className="text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                      <p className="text-sm">No services configured</p>
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        Add services to monitor their health
                      </p>
                    </div>
                  </div>
                ) : (
                  Object.entries(healthStatus)
                    .sort(([, a], [, b]) => {
                      const order = { error: 0, pending: 1, ok: 2 };
                      return order[a] - order[b];
                    })
                    .map(([name, status]) => (
                      <ServiceStatusItem
                        key={name}
                        name={name}
                        status={status}
                      />
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HealthStatusComponent;
