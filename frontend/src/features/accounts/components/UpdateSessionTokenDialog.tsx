import { ChangeEvent } from 'react';
import { ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UpdateSessionTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionToken: string;
  onSessionTokenChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onUpdate: () => void;
  isUpdating: boolean;
  apiKey: string;
  onOpenLink: (apiKey: string) => void;
}

const UpdateSessionTokenDialog = ({
  open,
  onOpenChange,
  sessionToken,
  onSessionTokenChange,
  onUpdate,
  isUpdating,
  apiKey,
  onOpenLink,
}: UpdateSessionTokenDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Update Session Token</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        <Alert variant="default" className="bg-blue-50 dark:bg-blue-950/50">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Update Instructions</AlertTitle>
          <AlertDescription>
            <ol className="ml-4 space-y-2 list-decimal">
              <li>
                Click the button below to open the ICICI Breeze login page
              </li>
              <li>Log in to your account</li>
              <li>Copy the session token from the URL</li>
              <li>Paste the token in the input field below</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => onOpenLink(apiKey)}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open ICICI BREEZE
        </Button>

        <Input
          placeholder="Enter Session Token"
          value={sessionToken}
          onChange={onSessionTokenChange}
          className="w-full"
        />
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={onUpdate}
          disabled={isUpdating}
          className="w-full sm:w-auto"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Token'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default UpdateSessionTokenDialog;
