import { useAppSelector } from "./app/hooks";
import Navbar from "./components/Navbar";
import Toast from "./components/ToastContainer";
import { getCurrentToken } from "./features/authSlice";
import AboutPage from "./pages/AboutPage";
import AccountsPage from "./pages/AccountsPage";
import ContactPage from "./pages/ContactPage";
import GraphsPage from "./pages/GraphsPage";
import HomePage from "./pages/HomePage";
import InstrumentsPage from "./pages/InstrumentsPage";
import LoginRegPage from "./pages/LoginRegPage";
import { Banner, Flowbite } from "flowbite-react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, ReactElement, useState } from "react";
import { useHealthCheckQuery } from "./services/baseApi";
import LoadingScreen from "./components/LoadingScreen";
import NotFoundPage from "./pages/NotFoundPage";
import { MdAnnouncement } from "react-icons/md";
import { HiX } from "react-icons/hi";

// Define the props for PrivateRoute
interface PrivateRouteProps {
  element: ReactElement;
}

// PrivateRoute component to protect routes
const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const access_token = useAppSelector(getCurrentToken);
  return access_token ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const { isLoading, refetch } = useHealthCheckQuery("");

  useEffect(() => {
    const checkEnvironment = () => {
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      localStorage.setItem("isLocalhost", JSON.stringify(isLocalhost));
    };

    checkEnvironment();

    // Mark initial check as complete after the first query
    if (isLoading === false && !initialCheckComplete) {
      setInitialCheckComplete(true);
    }
  }, [isLoading, initialCheckComplete]);

  useEffect(() => {
    // Set up a recurring health check every 2 minutes
    const intervalId = setInterval(() => {
      refetch();
    }, 120000); // 120000 ms = 2 minutes

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [refetch]);

  if (isLoading && !initialCheckComplete) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Flowbite>
        <Navbar />
        <Banner>
          <div className="flex justify-between w-full p-4 border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
            <div className="flex items-center mx-auto">
              <p className="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
                <MdAnnouncement className="w-4 h-4 mr-4" />
                <span className="[&_p]:inline">
                  This deployed version is using free services, so the limit for data being fetched is 1 month. To use, input your Breeze API key and secret in the account section, then follow the
                  instructions to get the access token.
                </span>
              </p>
            </div>
            <Banner.CollapseButton color="gray" className="text-gray-500 bg-transparent border-0 dark:text-gray-400">
              <HiX className="w-4 h-4" />
            </Banner.CollapseButton>
          </div>
        </Banner>

        <Routes>
          <Route path="/" element={<PrivateRoute element={<HomePage />} />} />
          <Route path="/about" element={<PrivateRoute element={<AboutPage />} />} />
          <Route path="/instruments" element={<PrivateRoute element={<InstrumentsPage />} />} />
          <Route path="/graphs/:id" element={<PrivateRoute element={<GraphsPage />} />} />
          <Route path="/accounts" element={<PrivateRoute element={<AccountsPage />} />} />
          <Route path="/contact" element={<PrivateRoute element={<ContactPage />} />} />
          <Route path="/login" element={<LoginRegPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toast />
      </Flowbite>
    </BrowserRouter>
  );
};

export default App;
