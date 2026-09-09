import type { Metadata } from 'next';
import { Fredoka, Geist, Geist_Mono, Manrope } from 'next/font/google';
import './globals.css';
import './demo.css';
import './public-flows.css';
import './portal/portal.css';
import './staff/staff.css';
import './demo-polish.css';
import { RevealMotion } from '../components/motion';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-home-body',
  subsets: ['latin'],
});

const fredoka = Fredoka({
  variable: '--font-home-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rookie Rackets | Free Badminton Workshops in NC',
  description: 'Free, inclusive badminton workshops for all ages in North Carolina.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${fredoka.variable} antialiased`}>
        <RevealMotion />
        {children}
      </body>
    </html>
  );
}
