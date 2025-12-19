import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getComponent, getAllComponents } from "@/lib/components";
import { CopyButton } from "@/components/copy-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComponentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const component = getComponent(id);
  
  if (!component) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link 
        href="/components"
        className="text-sm mb-6 inline-block hover:underline"
        style={{ color: 'var(--text-muted)' }}
      >
        ← Back to components
      </Link>
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={`aesthetic-dot ${component.aesthetic_family}`} style={{ width: '16px', height: '16px' }} />
          <Link 
            href={`/aesthetics/${component.aesthetic_family}`}
            className="text-sm hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            {formatName(component.aesthetic_family)}
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {component.screen_type}
          </span>
        </div>
        
        <h1 
          className="text-3xl font-semibold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          {component.name}
        </h1>
        
        <p style={{ color: 'var(--text-secondary)' }}>
          {component.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image */}
          <div className="card overflow-hidden">
            <div className="aspect-video relative" style={{ background: 'var(--bg-inset)' }}>
              <Image
                src={component.source.image_url}
                alt={component.name}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <div 
              className="p-3 flex items-center justify-between text-sm border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <a 
                href={component.source.arena_url}
                target="_blank"
                rel="noopener"
                className="hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                View on Are.na →
              </a>
            </div>
          </div>

          {/* CSS Code */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                CSS
              </h2>
              <CopyButton text={component.code.css} label="Copy CSS" />
            </div>
            <div className="code-block">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {component.code.css}
              </pre>
            </div>
          </section>

          {/* Tailwind */}
          {component.code.tailwind && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Tailwind Classes
                </h2>
                <CopyButton text={component.code.tailwind} label="Copy" />
              </div>
              <div className="code-block">
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {component.code.tailwind}
                </pre>
              </div>
            </section>
          )}

          {/* Atoms */}
          {component.atoms.length > 0 && (
            <section>
              <h2 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Extractable Atoms
              </h2>
              <div className="space-y-4">
                {component.atoms.map((atom, i) => (
                  <div key={i} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-xs px-2 py-0.5 rounded capitalize"
                            style={{ background: 'var(--bg-inset)', color: 'var(--text-muted)' }}
                          >
                            {atom.type}
                          </span>
                          <h3 
                            className="font-medium text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {atom.name}
                          </h3>
                        </div>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {atom.description}
                        </p>
                      </div>
                      <CopyButton text={atom.css} label="Copy" />
                    </div>
                    <div className="code-block mt-3">
                      <pre className="font-mono text-xs whitespace-pre-wrap">
                        {atom.css}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Tokens */}
          <div className="card p-5">
            <h3 
              className="font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Design Tokens
            </h3>
            
            {/* Colors */}
            <div className="mb-4">
              <div 
                className="text-xs font-medium uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Colors
              </div>
              <div className="space-y-2">
                <TokenRow 
                  label="Background" 
                  value={component.tokens.colors.background} 
                  isColor 
                />
                <TokenRow 
                  label="Surface" 
                  value={component.tokens.colors.surface} 
                  isColor 
                />
                <TokenRow 
                  label="Text Primary" 
                  value={component.tokens.colors.text_primary} 
                  isColor 
                />
                <TokenRow 
                  label="Accent" 
                  value={component.tokens.colors.accent} 
                  isColor 
                />
              </div>
            </div>

            {/* Radius */}
            <div className="mb-4">
              <div 
                className="text-xs font-medium uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Border Radius
              </div>
              <div className="space-y-2">
                <TokenRow label="Containers" value={component.tokens.radius.containers} />
                <TokenRow label="Buttons" value={component.tokens.radius.buttons} />
              </div>
            </div>

            {/* Shadow */}
            <div className="mb-4">
              <div 
                className="text-xs font-medium uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Shadow
              </div>
              <TokenRow label="Default" value={component.tokens.shadows.default} />
            </div>

            {/* Typography */}
            <div>
              <div 
                className="text-xs font-medium uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Typography
              </div>
              <div className="space-y-2">
                <TokenRow label="Heading" value={`${component.tokens.typography.heading_size} / ${component.tokens.typography.heading_weight}`} />
                <TokenRow label="Body" value={`${component.tokens.typography.body_size} / ${component.tokens.typography.body_weight}`} />
                <TokenRow label="Style" value={component.tokens.typography.font_style} />
              </div>
            </div>
          </div>

          {/* Component Types */}
          <div className="card p-5">
            <h3 
              className="font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Component Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {component.component_types.map(type => (
                <Link
                  key={type}
                  href={`/components?type=${type}`}
                  className="pill hover:border-[var(--border-strong)]"
                >
                  {type}
                </Link>
              ))}
            </div>
          </div>

          {/* Usage */}
          <div className="card p-5">
            <h3 
              className="font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Use When
            </h3>
            <ul className="space-y-2 mb-4">
              {component.usage.best_for.map((item, i) => (
                <li 
                  key={i} 
                  className="text-sm flex items-start gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: 'green' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            
            <h3 
              className="font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Avoid When
            </h3>
            <ul className="space-y-2">
              {component.usage.avoid_for.map((item, i) => (
                <li 
                  key={i} 
                  className="text-sm flex items-start gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: 'var(--accent)' }}>✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          {component.tags.length > 0 && (
            <div className="card p-5">
              <h3 
                className="font-semibold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {component.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'var(--bg-inset)', color: 'var(--text-muted)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TokenRow({ label, value, isColor }: { label: string; value: string; isColor?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex items-center gap-2">
        {isColor && !value.includes('gradient') && (
          <span 
            className="w-3 h-3 rounded border"
            style={{ 
              background: value, 
              borderColor: 'var(--border)' 
            }}
          />
        )}
        <code 
          className="font-mono"
          style={{ color: 'var(--text-secondary)' }}
        >
          {value.length > 30 ? value.slice(0, 30) + '...' : value}
        </code>
      </div>
    </div>
  );
}

// Generate static params
export async function generateStaticParams() {
  const components = getAllComponents();
  return components.map(c => ({ id: c.id }));
}

function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

