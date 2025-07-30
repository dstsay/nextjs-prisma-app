"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header and footer on auth pages, artist dashboard, and booking pages
  const isAuthPage = pathname?.startsWith("/auth/");
  const isArtistDashboard = pathname === "/artist/dashboard";
  const isBookingPage = pathname?.includes("/artists/") && pathname?.includes("/book");
  const hideNavigation = isAuthPage || isArtistDashboard || isBookingPage;

  return (
    <>
      {!hideNavigation && <Header />}
      <main>{children}</main>
      {!hideNavigation && <Footer />}
    </>
  );
}