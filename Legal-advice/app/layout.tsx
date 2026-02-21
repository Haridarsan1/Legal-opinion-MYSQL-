import './globals.css';
import type { Metadata } from 'next';
// import { Manrope } from 'next/font/google' // Disabled due to build fetch error
import { ToastProvider } from '@/components/providers/ToastProvider';

// const manrope = Manrope({
//     subsets: ['latin'],
//     variable: '--font-manrope',
//     display: 'swap',
// })

export const metadata: Metadata = {
  title: 'Legal Opinion - Expert Legal Advice',
  description:
    'Secure platform for requesting, reviewing, and managing legal opinions. Connect with verified lawyers globally.',
  keywords: [
    'legal opinion',
    'lawyer consultation',
    'legal advice',
    'law firm',
    'legal services',
    'document review',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`font-display antialiased`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
