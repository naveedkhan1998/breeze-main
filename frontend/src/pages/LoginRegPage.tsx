import React from "react";
import { Tabs, Card } from "flowbite-react";
import { HiUser, HiUserAdd } from "react-icons/hi";
import Login from "../components/Login";
import Registration from "../components/Registration";

const LoginRegPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-2xl shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome to ICICI Breeze Client</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Your gateway to the Breeze API</p>
        </div>
        <Tabs aria-label="Login and Registration tabs" style="underline" className="w-full">
          <Tabs.Item title="Login" icon={HiUser}>
            <Login />
          </Tabs.Item>
          <Tabs.Item title="Registration" icon={HiUserAdd}>
            <Registration />
          </Tabs.Item>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginRegPage;
