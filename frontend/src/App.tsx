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

import { checkEnvironment } from "./utils/environment.ts";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "@/components/ui/toaster"

const HEALTH_CHECK_INTERVAL = 120000; // 2 minutes

// PrivateRoute Component
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const accessToken = useAppSelector(getCurrentToken);
  return accessToken ? element : <Navigate to="/login" />;
};

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const { isLoading, refetch } = useHealthCheckQuery("");

  useEffect(() => {
    checkEnvironment();

    if (!isLoading && !isLoadingComplete) {
      setIsLoadingComplete(true);
    }
  }, [isLoading, isLoadingComplete]);

  useEffect(() => {
    const intervalId = setInterval(refetch, HEALTH_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [refetch]);

  if (isLoading && !isLoadingComplete) {
    return <LoadingScreen />;
  }

  const routes = [
    { path: "/", element: <HomePage />, private: true },
    { path: "/about", element: <AboutPage />, private: true },
    { path: "/profile", element: <ProfilePage />, private: true },
    { path: "/dashboard", element: <DashBoardPage />, private: true },
    { path: "/instruments", element: <InstrumentsPage />, private: true },
    { path: "/graphs/:id", element: <GraphsPage />, private: true },
    { path: "/accounts", element: <AccountsPage />, private: true },
    { path: "/contact", element: <ContactPage />, private: true },
    { path: "/login", element: <LoginRegPage />, private: false },
    { path: "*", element: <NotFoundPage />, private: false },
  ];

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Flowbite>
          <Navbar />
          <AnnouncementBanner />
          <Routes>
            {routes.map(({ path, element, private: isPrivate }) => (
              <Route key={path} path={path} element={isPrivate ? <PrivateRoute element={element} /> : element} />
            ))}
          </Routes>
          <Toast />
          <Toaster />
        </Flowbite>
      </ThemeProvider>
    </BrowserRouter>
  );
}
