import type { Metadata } from "next";
import config from "@/config/config.json";
import theme from "@/config/theme.json";
import TwSizeIndicator from "@/layouts/helpers/TwSizeIndicator";
import ConditionalLayout from "@/layouts/partials/ConditionalLayout";
import Providers from "@/layouts/partials/Providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: config.site.title,
  description: config.metadata.meta_description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pf = theme.fonts.font_family.primary || "DM Sans:wght@400;500;700";
  const fontHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(pf)}&display=swap`;

  return (
    <html suppressHydrationWarning={true} lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <link rel="shortcut icon" href={config.site.favicon} />
        <meta name="theme-name" content="NextSpace" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#fff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#000"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={fontHref} rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true} className="font-primary">
        <TwSizeIndicator />
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}