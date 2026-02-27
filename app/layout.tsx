import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../providers/theme-provider";
import { AuthProvider } from "../providers/auth-provider";
import Sidebar from "../components/Sidebar/sidebar.tsx"; // Adjust path if needed
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Organon",
  description: "Organize your life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
	<AuthProvider>
          {/* Flex container to hold the app layout */}
          <div className="flex min-h-screen bg-background text-text-primary">
            
            {/* The Sidebar is fixed, so it doesn't take up normal document flow space */}
            <Sidebar />

            {/* Main content area dynamically pads itself so it doesn't hide behind the sidebar */}
            <main className="flex-1 pb-16 md:pb-0 md:pl-20 transition-all duration-300">
              {children}
            </main>

          </div>
	  </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
