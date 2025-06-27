import React from 'react';
import { ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast: React.FC = () => {
  const toastOptions: ToastOptions = {
    autoClose: 1000,
    theme: 'colored',
    position: 'bottom-right',
  };

  return <ToastContainer {...toastOptions} />;
};

export default Toast;
