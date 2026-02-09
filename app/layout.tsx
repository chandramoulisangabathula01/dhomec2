import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dhomec Solutions | Industrial Automation & Access Control",
  description: "Dhomec Solutions - Professional industrial automation and access control providers. Trusted technology for growth and reliability.",
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
          <CartProvider>
            {children}
            <FloatingWhatsApp />
            <CartDrawer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
