"use client";

import AOS from "aos";
import "aos/dist/aos.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Initialize AOS (Animate On Scroll) library
  useEffect(() => {
    AOS.init({
      duration: 450,
      offset: 100,
      once: true,
    });
  }, []);

  return <>{children}</>;
}