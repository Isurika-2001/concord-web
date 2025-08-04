import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Concord Tech Solutions - Innovative Web Development & Academy",
  description: "Concord Tech Solutions provides interactive, cost-effective web-based solutions using React, Next.js, and modern technologies. We also offer Concord Academy for developer training.",
  icons: {
    icon: [
      {
        url: "/concord-logo-icon.png?v=2",
        type: "image/png",
      },
      {
        url: "/favicon.ico?v=2",
        type: "image/x-icon",
      },
    ],
    shortcut: "/concord-logo-icon.png?v=2",
    apple: "/concord-logo-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/concord-logo-icon.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/concord-logo-icon.png?v=2" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
