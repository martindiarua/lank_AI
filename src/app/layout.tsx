import type { Metadata } from "next";
import "./globals.css";
import OfflineBanner from "../components/shared/OfflineBanner";

export const metadata: Metadata = {
  title: "LANK AI",
  description: "Real-Time Multilingual Voice AI Interpreter Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}