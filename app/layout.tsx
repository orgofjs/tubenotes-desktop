import type { Metadata } from "next";
import "./globals.css";
import I18nProvider from '../components/I18nProvider';
import MainLayout from '../components/MainLayout';

// Using system fonts instead of Google Fonts for better offline support in Electron

export const metadata: Metadata = {
  title: "TubeNotes - Visual Video Knowledge Base",
  description: "Your personal YouTube video knowledge management system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TubeNotes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
  ],
};

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Initialize theme before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('tubenotes_theme') || 'cyberpunk-dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'cyberpunk-dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <I18nProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </I18nProvider>
      </body>
    </html>
  );
}

export default RootLayout;
