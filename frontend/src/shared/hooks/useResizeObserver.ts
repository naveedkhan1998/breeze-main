// hooks/useResizeObserver.ts
import { useState, useEffect } from 'react';

interface Size {
  width: number;
  height: number;
}

const useResizeObserver = (ref: React.RefObject<HTMLElement>): Size => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      // eslint-disable-next-line prefer-const
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(ref.current);

    // Initialize size
    const { width, height } = ref.current.getBoundingClientRect();
    setSize({ width, height });

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
};

export default useResizeObserver;
