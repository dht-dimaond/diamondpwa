"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <TonConnectUIProvider manifestUrl="https://moccasin-implicit-eel-888.mypinata.cloud/ipfs/bafkreifrznbmai6mnl3lse3lw5evmcll6ekh2vyjpfozewuxbj2f677mva">
            {children}
            <Analytics />
          </TonConnectUIProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}