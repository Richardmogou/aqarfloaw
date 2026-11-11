import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "AqarFlow | Property in Pakistan", template: "%s | AqarFlow" },
  description: "Buy, rent and sell property in Islamabad, Lahore and Karachi with agencies you can reach directly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <I18nProvider locale={locale}>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}