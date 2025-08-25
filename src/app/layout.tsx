import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "UPSC Mock Evaluation | Fast Answer Sheet Checking with Expert Feedback",
  description:
    "Get your UPSC mains answers evaluated by interview-appeared faculty. Fixed-time evaluation, credit-based system, and detailed feedback to boost your performance.",
  keywords: [
    "UPSC mock evaluation",
    "UPSC mains answer checking",
    "UPSC mock test feedback",
    "UPSC mains preparation",
    "UPSC answer writing practice",
  ],
  authors: [{ name: "MainsCracker" }],
  creator: "MainsCracker",
  publisher: "MainsCracker",
  openGraph: {
    title: "UPSC Mock Evaluation | Expert Answer Checking",
    description:
      "Submit your answers, get feedback in fixed time, and improve your UPSC Mains preparation with expert evaluations.",
    url: "https://mainscracker.com",
    siteName: "MainsCracker",
    images: [
      {
        url: "https://mainscracker.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "UPSC Mock Evaluation Preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UPSC Mock Evaluation | Expert Answer Checking",
    description:
      "Fixed-time UPSC mains answer evaluation with credit system & interview-level feedback.",
    images: ["https://mainscracker.com/og-image.png"],
    creator: "@mainscracker",
  },
  alternates: {
    canonical: "https://mainscracker.com",
  },
  category: "Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Analytics */}
        <script
          defer
          src="https://analytics.mainscracker.com/script.js"
          data-website-id="e41d1225-576a-44d9-b6de-4bf0c967cad4"
        ></script>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
