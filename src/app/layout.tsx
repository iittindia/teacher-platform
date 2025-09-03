import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/AppProviders";
import RazorpayScript from "@/components/RazorpayScript";
import dynamic from 'next/dynamic';
import { ChatProvider } from '@/contexts/ChatContext';

// Import the client-side ChatWidget component
import ChatWidgetClient from '@/components/ai-counselor/ChatWidgetClient';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

// Viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Teacher Lead Platform",
  description: "Premium Lead Generation and AI Counselling Platform for Teachers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <RazorpayScript />
        <Providers>
          <ChatProvider>
            {children}
            <ChatWidgetClient />
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}
