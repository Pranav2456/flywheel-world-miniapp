import { auth } from '@/auth';
import ClientProviders from '@/providers';
import '@worldcoin/mini-apps-ui-kit-react/styles.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Flywheel Mini App',
  description: 'Coordinate leverage missions between requesters and resolvers',
  icons: {
    icon: '/flywheel-logo.png',
    shortcut: '/flywheel-logo.png',
    apple: '/flywheel-logo.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <head>
        {/* Prevent iOS input zoom by setting initial-scale and viewport-fitting */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} `}>
        <ClientProviders session={session}>
          <div className="min-h-dvh grid grid-rows-[1fr_auto]">
            <div className="overflow-x-hidden">
              {children}
            </div>
            <nav className="sticky bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white">
              <div className="mx-auto max-w-md px-3 py-2">
                <Navigation />
              </div>
            </nav>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
