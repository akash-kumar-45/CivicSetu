import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "CivicSetu | Hyperlocal Direct Hiring & ₹0-Commission Work Portal",
  description:
    "Government-backed hyperlocal civic portal connecting verified citizens and local workers with ₹0 commission, two-stage privacy, and direct settlement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-pureWhite text-darkText antialiased selection:bg-saffron selection:text-pureWhite font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
