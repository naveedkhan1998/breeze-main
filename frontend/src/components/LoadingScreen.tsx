import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 900);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />

        {/* Animated circles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"
            style={{
              width: Math.random() * 200 + 50 + "px",
              height: Math.random() * 200 + 50 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 2 + "s",
              animationDuration: Math.random() * 3 + 2 + "s",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4 border border-gray-800 bg-black/40 backdrop-blur-xl">
          <div className="p-8 space-y-8">
            {/* Central loading animation */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-2 rounded-full border-purple-500/20 animate-ping" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-2 rounded-full border-blue-500/20 animate-ping" style={{ animationDelay: "0.5s" }} />
              </div>
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            </div>

            {/* Text and progress */}
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Initializing System{dots}</h2>

              <div className="space-y-2">
                <div className="relative w-full h-1 overflow-hidden bg-gray-800 rounded-full">
                  <div className="absolute top-0 left-0 h-full transition-all duration-300 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-400">{progress}% Complete</p>
              </div>
            </div>

            {/* Status messages */}
            <div className="text-center">
              <p className="text-sm text-gray-500">Estimated time remaining: {Math.ceil((100 - progress) * 0.9)} seconds</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoadingScreen;
