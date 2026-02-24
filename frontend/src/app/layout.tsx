import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';
import { NextAuthProvider } from "./NextAuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'Supply Chain Control Tower',
  description: 'Enterprise supply chain reporting & analytics dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <NextAuthProvider>
          <Providers>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-[#0a0f1c]">
                {children}
              </main>
            </div>
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}
