"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header and footer on auth pages, artist dashboard, booking pages, and video rooms
  const isAuthPage = pathname?.startsWith("/auth/");
  const isArtistDashboard = pathname?.startsWith("/artist/dashboard");
  const isBookingPage = pathname?.includes("/artists/") && pathname?.includes("/book");
  const isVideoRoom = pathname?.includes("/consultation/") && pathname?.includes("/join");
  const isArtistVideoRoom = pathname?.includes("/consultation/") && pathname?.includes("/host");
  const isVideoTestRoom = pathname === "/video-test/room";
  const isAppointmentConfirmation = pathname?.includes("/appointments/") && pathname?.includes("/confirmation");
  const hideNavigation = isAuthPage || isArtistDashboard || isBookingPage || isVideoRoom || isArtistVideoRoom || isVideoTestRoom || isAppointmentConfirmation;

  return (
    <>
      {!hideNavigation && <Header />}
      <main>{children}</main>
      {!hideNavigation && <Footer />}
    </>
  );
}