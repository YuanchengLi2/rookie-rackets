import type { Metadata } from 'next';
import { Geist, Geist_Mono, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { RevealMotion } from '../components/motion';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const nunitoSans = Nunito_Sans({
  variable: '--font-home-sans',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunitoSans.variable} antialiased`}
      >
        <RevealMotion />
        {children}
      </body>
    </html>
  );
}
