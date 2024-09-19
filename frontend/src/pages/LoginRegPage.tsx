import React, { useState } from "react";
import { Tabs, Card } from "flowbite-react";
import { HiUser, HiUserAdd } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../components/Login";
import Registration from "../components/Registration";

const LoginRegPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("login");

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-gray-800 dark:to-gray-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
        <Card className="overflow-hidden shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">Welcome to ICICI Breeze Client</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Your gateway to the Breeze API</p>
          </div>
          <Tabs aria-label="Login and Registration tabs" style="underline" onActiveTabChange={(tab) => setActiveTab(tab === 0 ? "login" : "registration")}>
            <Tabs.Item title="Login" icon={HiUser} active={activeTab === "login"}>
              <AnimatePresence mode="wait">
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Login />
                </motion.div>
              </AnimatePresence>
            </Tabs.Item>
            <Tabs.Item title="Registration" icon={HiUserAdd} active={activeTab === "registration"}>
              <AnimatePresence mode="wait">
                <motion.div key="registration" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <Registration />
                </motion.div>
              </AnimatePresence>
            </Tabs.Item>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginRegPage;
