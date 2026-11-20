import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Cooperative Time-Bank Platform | Community & Household Services",
  description:
    "An egalitarian time-credit cooperative platform for mutual exchange of household and community services. 1 Hour = 1 Credit.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-midnight-950 text-pureWhite antialiased selection:bg-lime-neon selection:text-midnight-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
