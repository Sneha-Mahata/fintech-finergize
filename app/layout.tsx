import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/chatbot-animations.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext"; // Add this import
import NextAuthProvider from "@/components/providers/session-provider";
import ChatbotProvider from "@/components/providers/ChatbotProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finergise - Digital Banking for Rural Communities",
  description: "Access banking services right from your community with secure and easy-to-use digital banking solutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <AuthProvider>
            <UserProvider> {/* Add the UserProvider here */}
              <Navbar />
              <ChatbotProvider>
                {children}
              </ChatbotProvider>
              <Toaster />
            </UserProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}