import { useEffect, useState } from "react";

// Define the breakpoint that matches your Tailwind lg breakpoint
const MOBILE_BREAKPOINT = 1024; // This matches Tailwind's 'lg' breakpoint

export const useDeviceType = () => {
  // Initialize state with null to prevent hydration mismatch
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    // Helper function to check window width
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    };

    // Set initial value
    checkIsDesktop();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsDesktop);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  // Return isDesktop and a mobile flag
  return {
    isDesktop,
    isMobile: isDesktop === false, // Only false when isDesktop is false (not null)
  };
};
