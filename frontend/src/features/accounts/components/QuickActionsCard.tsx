import { AlertCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const QuickActionsCard = () => (
  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Alert className="bg-white/80 dark:bg-background/80">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription className="ml-2">
          Remember to update your session token daily for uninterrupted trading.
        </AlertDescription>
      </Alert>
      {/* Add more quick actions or information cards here */}
    </CardContent>
  </Card>
);

export default QuickActionsCard;
