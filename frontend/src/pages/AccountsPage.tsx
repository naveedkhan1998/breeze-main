import { ChangeEvent, useEffect, useState, useCallback } from "react";
import { useGetBreezeQuery, useUpdateBreezeMutation } from "../services/breezeServices";
import { BreezeAccount } from "../common-types";
import { Button, Card, Modal, Spinner, TextInput, Alert } from "flowbite-react";
import { toast } from "react-toastify";
import CreateBreezeForm from "../components/CreateBreeze";
import { RefreshCw, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AccountsPage = () => {
  const { data, isSuccess, refetch, isLoading } = useGetBreezeQuery("");
  const [lastUpdatedHours, setLastUpdatedHours] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BreezeAccount | null>(null);
  const [sessionToken, setSessionToken] = useState("");

  const [updateBreeze, { isLoading: isUpdating }] = useUpdateBreezeMutation();

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSessionToken(e.target.value);
  }, []);

  const handleOpenLink = useCallback((key: string) => {
    window.open(`https://api.icicidirect.com/apiuser/login?api_key=${key}`, "_blank");
  }, []);

  const sendToken = useCallback(async () => {
    if (selectedAccount) {
      const updatedAccount = { ...selectedAccount, session_token: sessionToken };
      try {
        await updateBreeze({ data: updatedAccount }).unwrap();
        toast.success("Session token updated successfully");
        refetch();
        setOpenModal(false);
        setSessionToken("");
      } catch (error) {
        toast.error("Failed to update session token");
      }
    }
  }, [selectedAccount, sessionToken, updateBreeze, refetch]);

  useEffect(() => {
    if (isSuccess && data.data.length > 0) {
      const lastUpdatedTime = new Date(data.data[0].last_updated);
      const currentTime = new Date();
      const timeDifferenceInHours = (currentTime.getTime() - lastUpdatedTime.getTime()) / (1000 * 60 * 60);
      setLastUpdatedHours(timeDifferenceInHours);
    }
  }, [isSuccess, data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!isSuccess || !data || data.data.length === 0) {
    return <CreateBreezeForm />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Breeze Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your ICICI Direct Breeze account</p>
        </header>

        <div className="flex flex-col items-center justify-between mb-6 space-y-4 sm:flex-row sm:space-y-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: {lastUpdatedHours !== null ? `${lastUpdatedHours.toFixed(1)} hours ago` : "N/A"}</p>
        </div>

        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Card className="w-full overflow-hidden transition-shadow duration-300 hover:shadow-lg">
              <div className="p-6">
                <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">{data.data[0].name}</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">Session Token:</span> {data.data[0].session_token ? "••••••" : "Not set"}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={`font-semibold ${data.data[0].is_active ? "text-green-600" : "text-red-600"}`}>{data.data[0].is_active ? "Active" : "Inactive"}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col p-4 space-y-2 border-t border-gray-200 sm:flex-row sm:space-y-0 sm:space-x-2 dark:border-gray-700">
                <Button
                  onClick={() => {
                    setSelectedAccount(data.data[0]);
                    setOpenModal(true);
                  }}
                  outline
                  gradientDuoTone="purpleToBlue"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Token
                </Button>
                <Button onClick={() => handleOpenLink(data.data[0].api_key)} outline gradientDuoTone="purpleToBlue" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  ICICI Breeze
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Update Session Token</Modal.Header>
        <Modal.Body>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <Alert color="info">
              <p className="font-medium">Follow these steps to update your session token:</p>
              <ol className="ml-4 space-y-2 list-decimal">
                <li>Click the button below to open the ICICI Breeze login page</li>
                <li>Log in to your account</li>
                <li>Copy the session token from the URL</li>
                <li>Paste the token in the input field below</li>
              </ol>
            </Alert>
            <Button onClick={() => handleOpenLink(selectedAccount?.api_key || "")} outline gradientDuoTone="purpleToBlue" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open ICICI BREEZE
            </Button>
            <TextInput id="sessionToken" type="text" placeholder="Enter Session Token" value={sessionToken} onChange={handleChange} required />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={sendToken} disabled={isUpdating} gradientDuoTone="greenToBlue">
            {isUpdating ? <Spinner size="sm" className="mr-2" /> : "Update Token"}
          </Button>
          <Button onClick={() => setOpenModal(false)} className="ml-2" color="gray">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default AccountsPage;
