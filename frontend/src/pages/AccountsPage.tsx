import { ChangeEvent, useEffect, useState, useCallback } from "react";
import { RefreshCw, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useGetBreezeQuery,
  useUpdateBreezeMutation,
} from "../services/breezeServices";
import { BreezeAccount } from "../common-types";
import CreateBreezeForm from "../components/CreateBreeze";
import BreezeStatusCard from "@/components/BreezeStatusCard";
import { Badge } from "@/components/ui/badge";

const AccountsPage = () => {
  const { data, isSuccess, refetch, isLoading } = useGetBreezeQuery("");
  const [lastUpdatedHours, setLastUpdatedHours] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BreezeAccount | null>(
    null,
  );
  const [sessionToken, setSessionToken] = useState("");

  const [updateBreeze, { isLoading: isUpdating }] = useUpdateBreezeMutation();

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSessionToken(e.target.value);
  }, []);

  const handleOpenLink = useCallback((key: string) => {
    window.open(
      `https://api.icicidirect.com/apiuser/login?api_key=${key}`,
      "_blank",
    );
  }, []);

  const sendToken = useCallback(async () => {
    if (selectedAccount) {
      const updatedAccount = {
        ...selectedAccount,
        session_token: sessionToken,
      };
      try {
        await updateBreeze({ data: updatedAccount }).unwrap();
        toast.success("Session token updated successfully");
        refetch();
        setOpenModal(false);
        setSessionToken("");
      } catch {
        toast.error("Failed to update session token");
      }
    }
  }, [selectedAccount, sessionToken, updateBreeze, refetch]);

  useEffect(() => {
    if (isSuccess && data.data.length > 0) {
      const lastUpdatedTime = new Date(data.data[0].last_updated);
      const currentTime = new Date();
      const timeDifferenceInHours =
        (currentTime.getTime() - lastUpdatedTime.getTime()) / (1000 * 60 * 60);
      setLastUpdatedHours(timeDifferenceInHours);
    }
  }, [isSuccess, data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">
            Loading your account details...
          </p>
        </div>
      </div>
    );
  }

  if (!isSuccess || !data || data.data.length === 0) {
    return <CreateBreezeForm />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-muted/50"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-4 text-center">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold md:text-5xl"
          >
            <span className=" bg-gradient-to-r from-primary to-accent bg-clip-text">
              Breeze Account
            </span>
          </motion.h1>
          <p className="text-lg text-muted-foreground">
            Manage your ICICI Direct Breeze account
          </p>
        </header>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BreezeStatusCard />
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Account Details</span>
                  <Badge
                    variant={data.data[0].is_active ? "success" : "destructive"}
                  >
                    {data.data[0].is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <span className="font-medium">Account Name</span>
                    <span>{data.data[0].name}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <span className="font-medium">Session Token</span>
                    <span>
                      {data.data[0].session_token ? "••••••" : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <span className="font-medium">Last Updated</span>
                    <span>
                      {lastUpdatedHours !== null
                        ? `${lastUpdatedHours.toFixed(1)} hours ago`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedAccount(data.data[0]);
                    setOpenModal(true);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Session Token
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOpenLink(data.data[0].api_key)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open ICICI Breeze Portal
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-white/80 dark:bg-background/80">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="ml-2">
                    Remember to update your session token daily for
                    uninterrupted trading.
                  </AlertDescription>
                </Alert>
                {/* Add more quick actions or information cards here */}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
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
              onClick={() => handleOpenLink(selectedAccount?.api_key || "")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open ICICI BREEZE
            </Button>

            <Input
              placeholder="Enter Session Token"
              value={sessionToken}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setOpenModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={sendToken}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Token"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AccountsPage;
