import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../components/Login";
import Registration from "../components/Registration";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockIcon, UserPlusIcon } from "lucide-react";

const LoginRegPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-purple-900 dark:to-violet-900">
      <div className="w-full max-w-4xl">
        <Card className="grid overflow-hidden bg-white shadow-2xl md:grid-cols-2 dark:bg-gray-800">
          <div className="flex flex-col justify-center p-8 text-white bg-gradient-to-br from-indigo-600 to-purple-700">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="mb-4 text-4xl font-bold">ICICI Breeze Client</h1>
              <p className="mb-8 text-lg">Your gateway to seamless financial management</p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckIcon className="mr-2" /> Real-time market data
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" /> Secure transactions
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" /> Advanced portfolio analytics
                </li>
              </ul>
            </motion.div>
          </div>
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  <LockIcon className="w-4 h-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="registration">
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait">
                <TabsContent value="login" asChild>
                  <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <Login />
                  </motion.div>
                </TabsContent>
                <TabsContent value="registration" asChild>
                  <motion.div key="registration" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <Registration />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default LoginRegPage;
