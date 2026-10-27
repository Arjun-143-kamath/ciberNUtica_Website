import type { Metadata } from 'next';
import './globals.css';
import { CTFProvider } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'ciberNUtica // Cybersecurity Club & CTF Arena',
  description: 'Official portal of ciberNUtica: offensive cybersecurity research, live CTFd-spec competitions, threat intelligence dispatches, and club operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#060606] text-neutral-100 selection:bg-[#FCEE09] selection:text-black">
        <CTFProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CTFProvider>
      </body>
    </html>
  );
}
