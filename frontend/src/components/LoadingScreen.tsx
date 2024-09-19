import React from "react";
import { motion } from "framer-motion";

const LoadingScreen: React.FC = () => {
  const containerVariants = {
    start: { opacity: 0, scale: 0.8 },
    end: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const circleVariants = {
    start: { scale: 0 },
    end: { scale: 1, transition: { duration: 0.5, delay: 0.2 } },
  };

  const dotVariants = {
    start: { y: 0 },
    end: { y: -10, transition: { duration: 0.4, yoyo: Infinity } },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div className="p-8 bg-white rounded-lg shadow-xl dark:bg-gray-800" variants={containerVariants} initial="start" animate="end">
        <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Backend Starting Up</h2>
        <motion.div className="flex items-center justify-center mb-6" variants={circleVariants}>
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite" />
            </circle>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <p className="mb-4 text-lg text-center text-gray-600 dark:text-gray-300">Please wait while we set things up for you</p>
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div key={index} className="w-3 h-3 bg-blue-500 rounded-full dark:bg-purple-400" variants={dotVariants} initial="start" animate="end" transition={{ delay: index * 0.2 }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
