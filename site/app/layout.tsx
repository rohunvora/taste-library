import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design System | Your Taste, Extracted",
  description: "A personal component library extracted from curated UI/UX inspiration. Browse live components, not screenshots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <div className="min-h-screen flex flex-col">
          {/* Header - refined with backdrop blur */}
          <header 
            className="sticky top-0 z-50 border-b backdrop-blur-xl header-blur"
            style={{ 
              borderColor: 'var(--border)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center gap-2.5 font-semibold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                <span 
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                  style={{ 
                    background: 'var(--text-primary)',
                    color: 'var(--bg-base)',
                  }}
                >
                  ⬡
                </span>
                <span>Your Design System</span>
              </Link>
              
              <nav className="flex items-center gap-0.5">
                <NavLink href="/components">Browse</NavLink>
                <NavLink href="/atoms">Atoms</NavLink>
                <NavLink href="/aesthetics">Aesthetics</NavLink>
                <div className="w-px h-4 mx-2" style={{ background: 'var(--border)' }} />
                <NavLink href="/export" accent>Export</NavLink>
              </nav>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer - minimal and refined */}
          <footer 
            className="border-t py-10"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="max-w-7xl mx-auto px-4">
              <div 
                className="flex items-center justify-between text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <div className="flex items-center gap-6">
                  <span>
                    Built from{' '}
                    <a 
                      href="https://are.na" 
                      target="_blank" 
                      rel="noopener" 
                      className="underline hover:opacity-70 transition-opacity"
                    >
                      Are.na
                    </a>
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">
                    AI-powered extraction
                  </span>
                </div>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener"
                  className="hover:opacity-70 transition-opacity"
                >
                  GitHub
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

function NavLink({ 
  href, 
  children,
  accent = false,
}: { 
  href: string; 
  children: React.ReactNode;
  accent?: boolean;
}) {
  if (accent) {
    return (
      <Link
        href={href}
        className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
        style={{ 
          background: 'var(--text-primary)',
          color: 'var(--bg-base)',
        }}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-inset)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </Link>
  );
}
