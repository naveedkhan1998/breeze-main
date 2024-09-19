import { useState, ChangeEvent, FormEvent, useCallback } from "react";
import { useCreateBreezeMutation } from "../services/breezeServices";
import { Button, Card, Spinner, TextInput, Checkbox, Label } from "flowbite-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

interface FormData {
  name: string;
  api_key: string;
  api_secret: string;
  session_token?: string;
  is_active: boolean;
}

const CreateBreezeForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    api_key: "",
    api_secret: "",
    session_token: "",
    is_active: true,
  });

  const [createBreeze, { isLoading }] = useCreateBreezeMutation();

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createBreeze(formData).unwrap();
      toast.success("Breeze account created successfully!");
      setFormData({
        name: "",
        api_key: "",
        api_secret: "",
        session_token: "",
        is_active: true,
      });
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create breeze account.");
      console.error("Failed to create breeze account:", error);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="w-full max-w-lg p-8 m-4">
        <Card className="p-8 space-y-6 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Create Breeze Account</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Account Name
              </Label>
              <TextInput type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="Account Name" required className="w-full" />
            </div>
            <div>
              <Label htmlFor="api_key" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                API Key
              </Label>
              <TextInput type="text" name="api_key" id="api_key" value={formData.api_key} onChange={handleChange} placeholder="API Key" required className="w-full" />
            </div>
            <div>
              <Label htmlFor="api_secret" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                API Secret
              </Label>
              <TextInput type="password" name="api_secret" id="api_secret" value={formData.api_secret} onChange={handleChange} placeholder="API Secret" required className="w-full" />
            </div>
            <div>
              <Label htmlFor="session_token" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Session Token (Optional)
              </Label>
              <TextInput type="text" name="session_token" id="session_token" value={formData.session_token} onChange={handleChange} placeholder="Session Token (Optional)" className="w-full" />
            </div>
            <div className="flex items-center">
              <Checkbox id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} />
              <Label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                Active
              </Label>
            </div>
            <Button type="submit" gradientDuoTone="purpleToPink" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" className="mr-2" /> : "Create Breeze Account"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateBreezeForm;
