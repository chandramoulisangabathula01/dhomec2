import type { ReactNode } from "react";

export default function SellerLayout({ children }: { children: ReactNode }) {
  // Pass-through layout to allow the main AdminLayout to handle the chrome (Sidebar/Header)
  // This prevents double sidebars/headers while preserving the route structure
  return <>{children}</>;
}
