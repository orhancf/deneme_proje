import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';
import { NextAuthProvider } from "./NextAuthProvider";
import { ThemeProvider } from '@/components/ThemeProvider';
import { TopBar } from '@/components/TopBar';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Supply Chain Control Tower',
  description: 'Enterprise supply chain reporting & analytics dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} style={{ fontFamily: 'var(--font-sans)' }}>
        <NextAuthProvider>
          <Providers>
            <ThemeProvider>
              <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                <Sidebar />
                <main
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: 'var(--sidebar-width)',
                    transition: 'margin-left var(--duration-slow) var(--ease-default)',
                    background: 'var(--bg-base)',
                  }}
                >
                  <TopBar />
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-8) var(--space-8)' }}>
                    {children}
                  </div>
                </main>
              </div>
            </ThemeProvider>
          </Providers>
        </NextAuthProvider>
      </body>
    </html>
  );
}
