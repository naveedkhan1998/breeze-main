import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { useAppSelector } from './app/hooks';
import { getCurrentToken } from './features/auth/authSlice';
import { useHealthCheckQuery } from './shared/api/baseApi';
import LoadingScreen from './shared/components/LoadingScreen';

import HomePage from './features/home';
import AboutPage from './features/about';
import InstrumentsPage from './features/instruments';
import GraphsPage from './features/graphs';
import AccountsPage from './features/accounts';
import ContactPage from './features/contact';
import LoginRegPage from './features/auth';
import NotFoundPage from './features/notFound';
import AnnouncementBanner from './shared/components/AnnouncementBanner';
import ProfilePage from './features/profile';
import DashBoardPage from './features/dashboard';

import { checkEnvironment } from './shared/lib/environment';
import { ThemeProvider } from './shared/components/ThemeProvider';
import { Toaster } from 'sonner';

const HEALTH_CHECK_INTERVAL = 120000; // 2 minutes

// PrivateRoute Component
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const accessToken = useAppSelector(getCurrentToken);
  return accessToken ? element : <Navigate to="/login" />;
};

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const { isLoading, refetch } = useHealthCheckQuery('');

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
    { path: '/', element: <HomePage />, private: true },
    { path: '/about', element: <AboutPage />, private: true },
    { path: '/profile', element: <ProfilePage />, private: true },
    { path: '/dashboard', element: <DashBoardPage />, private: true },
    { path: '/instruments', element: <InstrumentsPage />, private: true },
    { path: '/graphs/:id', element: <GraphsPage />, private: true },
    { path: '/accounts', element: <AccountsPage />, private: true },
    { path: '/contact', element: <ContactPage />, private: true },
    { path: '/login', element: <LoginRegPage />, private: false },
    { path: '*', element: <NotFoundPage />, private: false },
  ];

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AnnouncementBanner />
        <Routes>
          {routes.map(({ path, element, private: isPrivate }) => (
            <Route
              key={path}
              path={path}
              element={isPrivate ? <PrivateRoute element={element} /> : element}
            />
          ))}
        </Routes>

        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}
