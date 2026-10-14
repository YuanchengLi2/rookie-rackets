import type { Metadata } from 'next';
import { Geist, Geist_Mono, Manrope } from 'next/font/google';
import './globals.css';
import './demo.css';
import './public-flows.css';
import './portal/portal.css';
import './staff/staff.css';
import './demo-polish.css';
import './signup.css';
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

export const metadata: Metadata = {
  title: 'Rookie Rackets | Free Badminton Workshops in NC',
  description: 'Free badminton workshops for all ages and all abilities across the Triangle, NC.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rookie-rackets.vercel.app'),
  icons: { icon: [{ url: '/images/logo.png', type: 'image/png' }], apple: '/images/logo.png' },
  openGraph: {
    title: 'Rookie Rackets | Free Badminton Workshops',
    description: 'A student-led nonprofit making badminton accessible across the Triangle, NC.',
    type: 'website',
    images: [{ url: '/images/logo.png', width: 1614, height: 1614, alt: 'Rookie Rackets — Where Birdies Take Flight' }],
  },
  twitter: { card: 'summary', title: 'Rookie Rackets', description: 'Free badminton workshops for all ages and all abilities.', images: ['/images/logo.png'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased`}>
        <RevealMotion />
        {children}
      </body>
    </html>
  );
}
