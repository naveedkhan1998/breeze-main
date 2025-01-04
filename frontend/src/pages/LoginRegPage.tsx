import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import Login from "../components/Login";
import Registration from "../components/Registration";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginRegPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-gray-800 dark:to-gray-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
        <Card className="p-6 overflow-hidden shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">Welcome to ICICI Breeze Client</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Your gateway to the Breeze API</p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex justify-center gap-4">
              <TabsTrigger
                value="login"
                className={`${activeTab === "login" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"} focus:outline-none focus:ring-2 ring-offset-2 ring-blue-500`}
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="registration"
                className={`${activeTab === "registration" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"} focus:outline-none focus:ring-2 ring-offset-2 ring-blue-500`}
              >
                Registration
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
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginRegPage;
