import { RefreshCw, ExternalLink } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BreezeAccount } from '@/types/common-types';

interface AccountDetailsCardProps {
  account: BreezeAccount;
  lastUpdatedHours: number | null;
  onUpdateSession: () => void;
  onOpenLink: (apiKey: string) => void;
}

const AccountDetailsCard = ({
  account,
  lastUpdatedHours,
  onUpdateSession,
  onOpenLink,
}: AccountDetailsCardProps) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Account Details</span>
        <Badge variant={account.is_active ? 'success' : 'destructive'}>
          {account.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <span className="font-medium">Account Name</span>
          <span>{account.name}</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <span className="font-medium">Session Token</span>
          <span>{account.session_token ? '••••••' : 'Not set'}</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <span className="font-medium">Last Updated</span>
          <span>
            {lastUpdatedHours !== null
              ? `${lastUpdatedHours.toFixed(1)} hours ago`
              : 'N/A'}
          </span>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex flex-col space-y-3">
      <Button className="w-full" onClick={onUpdateSession}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Update Session Token
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => onOpenLink(account.api_key)}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open ICICI Breeze Portal
      </Button>
    </CardFooter>
  </Card>
);

export default AccountDetailsCard;
