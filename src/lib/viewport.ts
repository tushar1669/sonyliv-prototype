import { useState, useEffect } from 'react';

/**
 * Hook to detect if viewport is desktop (≥1024px)
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Check on mount
    checkViewport();

    // Listen for resize
    window.addEventListener('resize', checkViewport);
    
    return () => {
      window.removeEventListener('resize', checkViewport);
    };
  }, []);

  return isDesktop;
}