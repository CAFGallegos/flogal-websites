import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flogal Maintenance',
  description: 'Internal fleet maintenance system',
  manifest: '/maintenance/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Flogal MX' },
};

export const viewport: Viewport = {
  themeColor: '#212528',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/maintenance/sw.js');
            });
          }
        ` }} />
      </body>
    </html>
  );
}
