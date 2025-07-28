"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header and footer on auth pages and artist dashboard
  const isAuthPage = pathname?.startsWith("/auth/");
  const isArtistDashboard = pathname === "/artist/dashboard";
  const hideNavigation = isAuthPage || isArtistDashboard;

  return (
    <>
      {!hideNavigation && <Header />}
      <main>{children}</main>
      {!hideNavigation && <Footer />}
    </>
  );
}