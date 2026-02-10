import { Quicksand } from "next/font/google";
import "./globals.css";
import React from "react";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata = {
  title: "Paws & Pixels | Cute Animal Search",
  description: "Find your daily dose of cute.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} font-sans antialiased bg-[#fdf6f0]`}>
        {children}
      </body>
    </html>
  );
}
