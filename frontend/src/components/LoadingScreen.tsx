// LoadingScreen.tsx
import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Backend Starting Up</h2>
        <div className="flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-center text-gray-600">Please wait while we set things up for you...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
