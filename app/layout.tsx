import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastProvider } from "@/components/ui/toast";
import { CookieConsent } from "@/components/CookieConsent";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dhomec Solutions | Industrial Automation & Access Control",
    template: "%s | Dhomec Solutions",
  },
  description: "Dhomec Solutions - India's trusted provider of industrial automation, gate automation, traffic control, boom barriers, and access control systems. Quality products with expert installation support.",
  keywords: ["industrial automation", "access control", "boom barriers", "gate automation", "traffic control", "Motorline", "India", "security systems"],
  authors: [{ name: "Dhomec Solutions" }],
  openGraph: {
    title: "Dhomec Solutions | Industrial Automation & Access Control",
    description: "India's trusted provider of industrial automation, gate automation, traffic control, and access control systems.",
    type: "website",
    locale: "en_IN",
    siteName: "Dhomec Solutions",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased font-sans bg-background text-foreground`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
          <ToastProvider>
            <CartProvider>
              {children}
              <FloatingWhatsApp />
              <CartDrawer />
              <CookieConsent />
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
