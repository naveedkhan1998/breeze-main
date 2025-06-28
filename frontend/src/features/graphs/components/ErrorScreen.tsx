import { Card } from '@/components/ui/card';
import { Button } from 'react-day-picker';
import { HiRefresh, HiX } from 'react-icons/hi';

const ErrorScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-destructive/5">
      <Card className="max-w-md p-10 mx-auto shadow-2xl glass-card border-destructive/20">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/20">
            <HiX className="w-10 h-10 text-destructive" />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-destructive">
              Connection Error
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Unable to fetch chart data. Please check your connection.
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 action-button bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
            >
              <HiRefresh className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ErrorScreen;
