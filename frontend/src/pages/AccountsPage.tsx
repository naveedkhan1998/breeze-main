import { ChangeEvent, useEffect, useState } from "react";
import { useGetBreezeQuery, useLazySetupQuery, useUpdateBreezeMutation } from "../services/breezeServices";
import { BreezeAccount } from "../common-types";
import { Button, Card, Modal, Spinner, TextInput } from "flowbite-react";
import { toast } from "react-toastify";
import CreateBreezeForm from "../components/CreateBreeze";
import { RefreshCw, ExternalLink, Plus } from "lucide-react";

const AccountsPage = () => {
  const { data, isSuccess, refetch, isLoading } = useGetBreezeQuery("");
  const [lastUpdatedHours, setLastUpdatedHours] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BreezeAccount | null>(null);
  const [sessionToken, setSessionToken] = useState("");

  const [updateBreeze, { isLoading: isUpdating }] = useUpdateBreezeMutation();
  const [triggerSetup, { isLoading: isSetupLoading }] = useLazySetupQuery();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSessionToken(e.target.value);
  };

  const handleOpenLink = (key: string) => {
    window.open(`https://api.icicidirect.com/apiuser/login?api_key=${key}`, "_blank");
  };

  const sendToken = async () => {
    if (selectedAccount) {
      const updatedAccount = { ...selectedAccount, session_token: sessionToken };
      try {
        await updateBreeze({ data: updatedAccount });
        toast.success("Session token updated successfully");
        refetch();
        setOpenModal(false);
        setSessionToken("");
      } catch (error) {
        toast.error("Failed to update session token");
      }
    }
  };

  const handleSetup = async () => {
    try {
      await triggerSetup("");
      toast.success("Setup completed successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to complete setup");
    }
  };

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
        <Spinner className="w-12 h-12 text-blue-500" />
      </div>
    );
  }

  if (!isSuccess || !data || data.data.length === 0) {
    return <CreateBreezeForm />;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-800 dark:text-white">Breeze Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your ICICI Direct Breeze account</p>
        </header>

        <div className="flex items-center justify-between mb-6">
          <Button onClick={handleSetup} disabled={isSetupLoading} className="text-white bg-gradient-to-r from-blue-500 to-teal-400">
            {isSetupLoading ? <Spinner className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Initial Server Data Setup
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: {lastUpdatedHours !== null ? `${lastUpdatedHours.toFixed(1)} hours ago` : "N/A"}</p>
        </div>

        <div className="flex justify-center">
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
            <div className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => {
                  setSelectedAccount(data.data[0]);
                  setOpenModal(true);
                }}
                outline
                gradientDuoTone="purpleToBlue"
                className="flex-1 mr-2"
              >
                <RefreshCw className="inline w-4 h-4 mr-2" />
                Update Token
              </Button>
              <Button onClick={() => handleOpenLink(data.data[0].api_key)} outline gradientDuoTone="purpleToBlue" className="flex-1">
                <ExternalLink className="inline w-4 h-4 mr-2" />
                ICICI Breeze
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Update Session Token</Modal.Header>
        <Modal.Body>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p className="">Follow these steps to update your session token:</p>
            <ol className="ml-4 space-y-2 list-decimal">
              <li>Click the button below to open the ICICI Breeze login page</li>
              <li>Log in to your account</li>
              <li>Copy the session token from the URL</li>
              <li>Paste the token in the input field below</li>
            </ol>
            <Button onClick={() => handleOpenLink(selectedAccount?.api_key || "")} outline gradientDuoTone="purpleToBlue" className="w-full">
              <ExternalLink className="inline w-4 h-4 mr-2" />
              Open ICICI BREEZE
            </Button>
            <TextInput id="sessionToken" type="text" placeholder="Enter Session Token" value={sessionToken} onChange={handleChange} required />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={sendToken} disabled={isUpdating} outline gradientDuoTone="tealToLime">
            {isUpdating ? <Spinner className="w-4 h-4 mr-2" /> : "Update Token"}
          </Button>
          <Button onClick={() => setOpenModal(false)} className="ml-2" outline gradientDuoTone="pinkToOrange">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AccountsPage;
