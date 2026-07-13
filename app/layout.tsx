import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DocFlow AI - AI Powered Business Document Automation Platform',
  description: 'Automate invoices, offer letters, HR documents, certificates, resumes and much more using an intelligent document automation platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-white`}>{children}</body>
    </html>
  );
}
