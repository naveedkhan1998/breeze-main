import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 1));
    }, 900);

    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Brand Text */}
      <div className="absolute z-50 text-white top-8 left-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-lg font-medium">System</span>
        </div>
        <div className="max-w-sm mt-8">
          <h2 className="mb-2 text-xl font-semibold">
            Initializing Application
          </h2>
          <p className="text-sm text-gray-400">
            Please wait while we prepare everything →
          </p>
        </div>
      </div>

      {/* Loading Text */}
      <div className="absolute text-sm tracking-wider text-gray-400 top-8 right-8">
        → APPLICATION LOADING
      </div>

      {/* Animated Blocks */}
      <AnimatedBlock
        initialX={-200}
        y={80}
        width={120}
        height={80}
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        pattern="solid"
        duration={8}
        delay={0}
      />

      <AnimatedBlock
        initialX={-150}
        y={300}
        width={100}
        height={100}
        colors={['#8B5CF6', '#10B981', '#06D6A0']}
        pattern="pixelated"
        duration={10}
        delay={1}
      />

      <AnimatedBlock
        initialX={-180}
        y={500}
        width={140}
        height={60}
        colors={['#8B5CF6', '#A855F7']}
        pattern="striped"
        duration={9}
        delay={2}
      />

      <AnimatedBlock
        initialX={-160}
        y={200}
        width={80}
        height={120}
        colors={['#8B5CF6', '#C084FC', '#DDD6FE']}
        pattern="blocks"
        duration={7}
        delay={0.5}
      />

      <AnimatedBlock
        initialX={-220}
        y={400}
        width={110}
        height={90}
        colors={['#8B5CF6', '#10B981']}
        pattern="mixed"
        duration={11}
        delay={1.5}
      />

      <AnimatedBlock
        initialX={-140}
        y={600}
        width={90}
        height={70}
        colors={['#A855F7', '#C084FC', '#10B981']}
        pattern="gradient"
        duration={8.5}
        delay={2.5}
      />

      {/* Progress Card */}
      <div className="absolute z-10 transform -translate-x-1/2 bottom-8 left-1/2">
        <Card className="w-full max-w-md mx-4 border border-gray-700 bg-gray-900/80 backdrop-blur-xl">
          <div className="p-6 space-y-4">
            {/* Text and progress */}
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Initializing System{dots}
              </h2>
              <div className="space-y-2">
                <div className="relative w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full transition-all duration-300 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">{progress}% Complete</p>
              </div>
            </div>
            {/* Status messages */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Estimated time remaining: {Math.ceil((100 - progress) * 0.9)}{' '}
                seconds
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

interface AnimatedBlockProps {
  initialX: number;
  y: number;
  width: number;
  height: number;
  colors: string[];
  pattern: 'solid' | 'striped' | 'pixelated' | 'blocks' | 'mixed' | 'gradient';
  duration: number;
  delay: number;
}

function AnimatedBlock({
  initialX,
  y,
  width,
  height,
  colors,
  pattern,
  duration,
  delay,
}: AnimatedBlockProps) {
  const renderPattern = () => {
    switch (pattern) {
      case 'solid':
        return (
          <div
            className="w-full h-full"
            style={{ backgroundColor: colors[0] }}
          />
        );

      case 'striped':
        return (
          <div className="flex flex-col w-full h-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
            ))}
          </div>
        );

      case 'pixelated':
        return (
          <div className="grid w-full h-full grid-cols-4 grid-rows-4 gap-0">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-full"
                style={{
                  backgroundColor:
                    Math.random() > 0.3
                      ? colors[i % colors.length]
                      : 'transparent',
                }}
              />
            ))}
          </div>
        );

      case 'blocks':
        return (
          <div className="grid w-full h-full grid-cols-2 grid-rows-3 gap-1 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
            ))}
          </div>
        );

      case 'mixed':
        return (
          <div className="flex w-full h-full">
            <div
              className="w-1/2 h-full"
              style={{ backgroundColor: colors[0] }}
            />
            <div className="flex flex-col w-1/2 h-full">
              <div className="h-1/3" style={{ backgroundColor: colors[1] }} />
              <div className="h-1/3" style={{ backgroundColor: colors[0] }} />
              <div className="h-1/3" style={{ backgroundColor: colors[1] }} />
            </div>
          </div>
        );

      case 'gradient':
        return (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(45deg, ${colors[0]}, ${colors[1]}, ${colors[2] || colors[0]})`,
            }}
          />
        );

      default:
        return (
          <div
            className="w-full h-full"
            style={{ backgroundColor: colors[0] }}
          />
        );
    }
  };

  return (
    <motion.div
      className="absolute"
      style={{
        width,
        height,
        top: y,
      }}
      initial={{ x: initialX }}
      animate={{
        x: typeof window !== 'undefined' ? window.innerWidth + 200 : 1400,
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      }}
    >
      {renderPattern()}
    </motion.div>
  );
}

export default LoadingScreen;
