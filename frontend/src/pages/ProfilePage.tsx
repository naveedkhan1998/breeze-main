import { useState } from "react";
import { useGetLoggedUserQuery } from "../services/userAuthService";

const ProfilePage = () => {
  const { data } = useGetLoggedUserQuery("");
  const [activeTab, setActiveTab] = useState("profile");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-gray-900">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "profile"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400"
            } font-semibold`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "settings"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400"
            } font-semibold`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <button
            className={`flex-1 p-4 text-center ${
              activeTab === "notifications"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400"
            } font-semibold`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <div className="flex items-center space-x-6">
              <img
                src={data.avatar}
                alt="User Avatar"
                className="w-24 h-24 border-4 border-blue-500 rounded-full"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {data.name}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Email: {data.email}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Role: {data.is_admin ? "Admin" : "User"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
                Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Here you can adjust your personal settings.
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

export default ProfilePage;
