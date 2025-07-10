import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { getCurrentToken } from './features/auth/authSlice';
import { useBreezeAccount } from './features/auth/hooks/useBreezeAccount';
import {
  checkHealth as checkWorkersHealth,
  setServiceStatus,
} from './features/health/healthSlice';
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

import { checkEnvironment, GOOGLE_CLIENT_ID } from './shared/lib/environment';
import { ThemeProvider } from './shared/components/ThemeProvider';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';

const HEALTH_CHECK_INTERVAL = 120000; // 2 minutes
const clientId = GOOGLE_CLIENT_ID || '';
// PrivateRoute Component
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const accessToken = useAppSelector(getCurrentToken);
  return accessToken ? element : <Navigate to="/login" />;
};

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [hasInitialApiHealthCheck, setHasInitialApiHealthCheck] =
    useState(false);
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(getCurrentToken);

  // Initialize Breeze account when user is logged in
  const { isBreezeAccountLoading } = useBreezeAccount();

  const {
    data: healthCheckData,
    isLoading: isHealthCheckLoading,
    error: healthCheckError,
    isSuccess: isHealthCheckSuccess,
  } = useHealthCheckQuery('', {
    // Start polling only after initial health check succeeds
    pollingInterval: hasInitialApiHealthCheck ? HEALTH_CHECK_INTERVAL : 0,
    skip: false,
  });

  useEffect(() => {
    checkEnvironment();

    // Only mark loading as complete when initial API health check is done and breeze account (if user is logged in) is done
    if (
      hasInitialApiHealthCheck &&
      !isLoadingComplete &&
      (!accessToken || !isBreezeAccountLoading)
    ) {
      setIsLoadingComplete(true);
    }
  }, [
    hasInitialApiHealthCheck,
    isLoadingComplete,
    accessToken,
    isBreezeAccountLoading,
  ]);

  // Start worker health checks only after initial API health check succeeds
  useEffect(() => {
    if (hasInitialApiHealthCheck) {
      dispatch(checkWorkersHealth());
      const intervalId = setInterval(
        () => dispatch(checkWorkersHealth()),
        HEALTH_CHECK_INTERVAL
      );
      return () => clearInterval(intervalId);
    }
  }, [dispatch, hasInitialApiHealthCheck]);

  useEffect(() => {
    if (isHealthCheckLoading) {
      dispatch(
        setServiceStatus({
          name: 'API',
          status: 'pending',
        })
      );
    } else if (healthCheckError) {
      dispatch(
        setServiceStatus({
          name: 'API',
          status: 'error',
        })
      );
      // Set this to true even on error so we don't stay in loading forever
      if (!hasInitialApiHealthCheck) {
        setHasInitialApiHealthCheck(true);
      }
    } else if (healthCheckData && isHealthCheckSuccess) {
      dispatch(
        setServiceStatus({
          name: 'API',
          status: 'ok',
        })
      );
      if (!hasInitialApiHealthCheck) {
        setHasInitialApiHealthCheck(true);
      }
    }
  }, [
    healthCheckData,
    isHealthCheckLoading,
    healthCheckError,
    isHealthCheckSuccess,
    dispatch,
    hasInitialApiHealthCheck,
  ]);

  if (!hasInitialApiHealthCheck) {
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
      <Analytics />
      <GoogleOAuthProvider clientId={clientId}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AnnouncementBanner />
          <Routes>
            {routes.map(({ path, element, private: isPrivate }) => (
              <Route
                key={path}
                path={path}
                element={
                  isPrivate ? <PrivateRoute element={element} /> : element
                }
              />
            ))}
          </Routes>

          <Toaster />
        </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}
