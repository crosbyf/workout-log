import './globals.css';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import ServiceWorker from '@/components/shared/ServiceWorker';

export const metadata = {
  title: 'GORS LOG',
  description: 'Workout tracking PWA for bodyweight and resistance training',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GORS LOG',
  },
};

export const viewport = {
  themeColor: '#0f0f14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GORS LOG" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=7" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=7" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <ServiceWorker />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
