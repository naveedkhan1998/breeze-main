"use client";

import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Flowbite } from "flowbite-react";
import { useAppSelector } from "./app/hooks";
import { getCurrentToken } from "./features/authSlice";
import { useHealthCheckQuery } from "./services/baseApi";
import Navbar from "./components/Navbar";
import Toast from "./components/ToastContainer";
import LoadingScreen from "./components/LoadingScreen";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import InstrumentsPage from "./pages/InstrumentsPage";
import GraphsPage from "./pages/GraphsPage";
import AccountsPage from "./pages/AccountsPage";
import ContactPage from "./pages/ContactPage";
import LoginRegPage from "./pages/LoginRegPage";
import NotFoundPage from "./pages/NotFoundPage";
import AnnouncementBanner from "./components/AnnouncementBanner";
import ProfilePage from "./pages/ProfilePage";
import DashBoardPage from "./pages/DashBoardPage";

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const accessToken = useAppSelector(getCurrentToken);
  return accessToken ? element : <Navigate to="/login" />;
};

const HEALTH_CHECK_INTERVAL = 120000; // 2 minutes in milliseconds

export default function App() {
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const { isLoading, refetch } = useHealthCheckQuery("");

  useEffect(() => {
    const checkEnvironment = () => {
      const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      localStorage.setItem("isLocalhost", JSON.stringify(isLocalhost));
    };

    checkEnvironment();

    if (!isLoading && !initialCheckComplete) {
      setInitialCheckComplete(true);
    }
  }, [isLoading, initialCheckComplete]);

  useEffect(() => {
    const intervalId = setInterval(refetch, HEALTH_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [refetch]);

  if (isLoading && !initialCheckComplete) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Flowbite>
        <Navbar />
        <AnnouncementBanner />
        <Routes>
          <Route path="/" element={<PrivateRoute element={<HomePage />} />} />
          <Route path="/about" element={<PrivateRoute element={<AboutPage />} />} />
          <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
          <Route path="/dashboard" element={<PrivateRoute element={<DashBoardPage />} />} />
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
}
