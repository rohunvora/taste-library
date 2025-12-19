import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Component Library | Built from Are.na",
  description: "A personal component library extracted from curated UI/UX inspiration",
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
          {/* Header */}
          <header 
            className="sticky top-0 z-50 border-b"
            style={{ 
              background: 'var(--bg-base)', 
              borderColor: 'var(--border)' 
            }}
          >
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center gap-2 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="text-lg">⬡</span>
                <span>Components</span>
              </Link>
              
              <nav className="flex items-center gap-1">
                <NavLink href="/components">Browse</NavLink>
                <NavLink href="/aesthetics">Aesthetics</NavLink>
                <NavLink href="/atoms">Atoms</NavLink>
                <NavLink href="/export">Export</NavLink>
              </nav>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer 
            className="border-t py-8"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                <span>
                  Built from <a href="https://are.na" target="_blank" rel="noopener" className="underline hover:opacity-70">Are.na</a> inspiration
                </span>
                <span>
                  Powered by AI extraction
                </span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-[var(--bg-inset)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </Link>
  );
}
