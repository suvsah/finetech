import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmFlow | Farmer Dashboard",
  description: "A simple Next.js app to help farmers plan crops, weather, and tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
