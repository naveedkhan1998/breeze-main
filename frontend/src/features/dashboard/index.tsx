import { useState } from "react";
import { Line } from "react-chartjs-2";
import { FaChartLine, FaUser, FaCog, FaBell } from "react-icons/fa";
import "chart.js/auto";

const DashBoardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [10000, 12000, 14000, 13000, 15000, 16000, 17000],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "overview"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400"
            } font-semibold flex items-center justify-center space-x-2`}
            onClick={() => setActiveTab("overview")}
          >
            <FaChartLine className="mr-2" />
            <span>Overview</span>
          </button>
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "profile"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400"
            } font-semibold flex items-center justify-center space-x-2`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser className="mr-2" />
            <span>Profile</span>
          </button>
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "settings"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400"
            } font-semibold flex items-center justify-center space-x-2`}
            onClick={() => setActiveTab("settings")}
          >
            <FaCog className="mr-2" />
            <span>Settings</span>
          </button>
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "notifications"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400"
            } font-semibold flex items-center justify-center space-x-2`}
            onClick={() => setActiveTab("notifications")}
          >
            <FaBell className="mr-2" />
            <span>Notifications</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div>
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
                Portfolio Overview
              </h3>
              <div className="w-full h-80">
                <Line data={data} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
                User Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This section will display the user's profile information.
              </p>
              {/* Profile information UI elements would go here */}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
                Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Here you can adjust your application settings.
              </p>
              {/* Settings form or other UI elements would go here */}
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
                Notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your notification preferences here.
              </p>
              {/* Notification settings UI elements would go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoardPage;
