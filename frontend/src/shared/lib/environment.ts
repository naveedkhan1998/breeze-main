export const checkEnvironment = () => {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(
    window.location.hostname
  );
  localStorage.setItem('isLocalhost', JSON.stringify(isLocalhost));
};

const getEnvironmentMode = () => {
  // Check for manual override via environment variable
  const forceEnv = import.meta.env.VITE_FORCE_ENV;
  if (forceEnv === 'development' || forceEnv === 'production') {
    return forceEnv;
  }

  // Fall back to Vite's default mode
  return import.meta.env.MODE as 'development' | 'production';
};

export const getCurrentEnvironment = getEnvironmentMode;
export const isDevelopment = getEnvironmentMode() === 'development';
export const isProduction = getEnvironmentMode() === 'production';

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
};

export const getCeleryWorkerUrls = () => {
  return [
    {
      name: 'Worker 1',
      url: import.meta.env.VITE_CELERY_WORKER_1_URL || 'http://localhost:8001/',
    },
    {
      name: 'Worker 2',
      url: import.meta.env.VITE_CELERY_WORKER_2_URL || 'http://localhost:8002/',
    },
    {
      name: 'Worker 3',
      url: import.meta.env.VITE_CELERY_WORKER_3_URL || 'http://localhost:8003/',
    },
  ];
};
