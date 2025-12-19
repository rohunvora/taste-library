import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getComponent, getAllComponents, type DesignTokens } from "@/lib/components";
import { CopyButton } from "@/components/copy-button";
import { 
  ComponentComposition,
  AtomBreakdown,
  ColorPalette,
  ThemePreview,
} from "@/components/previews";
import { cssToStyleObject, getContrastingTextColor } from "@/lib/css-parser";

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
    <div className="min-h-screen">
      {/* Live Hero Composition */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          {/* Back link */}
          <Link 
            href="/components"
            className="text-sm mb-6 inline-block hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back to components
          </Link>
        </div>

        {/* Full-width live preview */}
        <div 
          className="py-12 px-4"
          style={{ background: 'var(--bg-inset)' }}
        >
          <div className="max-w-5xl mx-auto">
            <ComponentComposition 
              component={component}
              showLabels
              className="shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-3">
          <span 
            className={`w-4 h-4 rounded-sm aesthetic-dot ${component.aesthetic_family}`}
          />
          <Link 
            href={`/aesthetics/${component.aesthetic_family}`}
            className="text-sm hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            {formatName(component.aesthetic_family)}
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {formatName(component.screen_type)}
          </span>
        </div>
        
        <h1 
          className="text-4xl font-semibold tracking-tight mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          {component.name}
        </h1>
        
        <p 
          className="text-lg max-w-2xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          {component.description}
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Live Atoms Breakdown */}
            {component.atoms.length > 0 && (
              <section>
                <h2 
                  className="text-xl font-semibold mb-6"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Component Atoms
                </h2>
                <div className="space-y-6">
                  {component.atoms.map((atom, i) => (
                    <LiveAtomCard key={i} atom={atom} tokens={component.tokens} />
                  ))}
                </div>
              </section>
            )}

            {/* Code Section */}
            <section>
              <h2 
                className="text-xl font-semibold mb-6"
                style={{ color: 'var(--text-primary)' }}
              >
                Implementation
              </h2>
              
              <div className="space-y-6">
                {/* CSS Code */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      CSS
                    </h3>
                    <CopyButton text={component.code.css} label="Copy CSS" />
                  </div>
                  <div className="code-block">
                    <pre className="font-mono text-sm whitespace-pre-wrap">
                      {component.code.css}
                    </pre>
                  </div>
                </div>

                {/* Tailwind */}
                {component.code.tailwind && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Tailwind Classes
                      </h3>
                      <CopyButton text={component.code.tailwind} label="Copy" />
                    </div>
                    <div className="code-block">
                      <pre className="font-mono text-sm whitespace-pre-wrap">
                        {component.code.tailwind}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Original Reference (collapsed by default) */}
            <section>
              <details className="group">
                <summary 
                  className="flex items-center justify-between cursor-pointer py-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span className="text-sm font-medium">Original Reference</span>
                  <svg 
                    className="w-4 h-4 transition-transform group-open:rotate-180" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="pt-4">
                  <div className="card overflow-hidden">
                    <div className="aspect-video relative" style={{ background: 'var(--bg-inset)' }}>
                      <Image
                        src={component.source.image_url}
                        alt={component.name}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div 
                      className="p-3 flex items-center justify-between text-sm border-t"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>
                        {component.source.title || 'Untitled'}
                      </span>
                      <a 
                        href={component.source.arena_url}
                        target="_blank"
                        rel="noopener"
                        className="hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        View on Are.na →
                      </a>
                    </div>
                  </div>
                </div>
              </details>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Color Palette Preview */}
            <div className="card p-5">
              <h3 
                className="font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Color Palette
              </h3>
              <ThemePreview tokens={component.tokens} className="mb-4" />
              <ColorPalette tokens={component.tokens} />
            </div>

            {/* Design Tokens */}
            <div className="card p-5">
              <h3 
                className="font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Design Tokens
              </h3>
              
              {/* Radius */}
              <div className="mb-5">
                <TokenSectionHeader label="Border Radius" />
                <div className="space-y-2">
                  <TokenRow label="Containers" value={component.tokens.radius.containers} />
                  <TokenRow label="Buttons" value={component.tokens.radius.buttons} />
                </div>
              </div>

              {/* Shadow */}
              <div className="mb-5">
                <TokenSectionHeader label="Shadow" />
                <TokenRow label="Default" value={component.tokens.shadows.default} />
              </div>

              {/* Spacing */}
              <div className="mb-5">
                <TokenSectionHeader label="Spacing" />
                <div className="space-y-2">
                  <TokenRow label="Base Unit" value={component.tokens.spacing.base_unit} />
                  <TokenRow label="Container Padding" value={component.tokens.spacing.container_padding} />
                  <TokenRow label="Element Gap" value={component.tokens.spacing.element_gap} />
                </div>
              </div>

              {/* Typography */}
              <div>
                <TokenSectionHeader label="Typography" />
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
                className="font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                When to Use
              </h3>
              <ul className="space-y-2 mb-5">
                {component.usage.best_for.map((item, i) => (
                  <li 
                    key={i} 
                    className="text-sm flex items-start gap-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="mt-0.5" style={{ color: '#22c55e' }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <h4 
                className="font-semibold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                When to Avoid
              </h4>
              <ul className="space-y-2">
                {component.usage.avoid_for.map((item, i) => (
                  <li 
                    key={i} 
                    className="text-sm flex items-start gap-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="mt-0.5" style={{ color: 'var(--accent)' }}>✗</span>
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
    </div>
  );
}

// Live rendered atom card
function LiveAtomCard({ 
  atom, 
  tokens 
}: { 
  atom: { type: string; name: string; description: string; css: string };
  tokens: DesignTokens;
}) {
  const style = cssToStyleObject(atom.css);
  
  return (
    <div className="card overflow-hidden">
      {/* Live preview */}
      <div 
        className="p-6 flex items-center justify-center"
        style={{ 
          background: 'var(--bg-inset)',
          minHeight: '120px',
        }}
      >
        {atom.type === 'surface' && (
          <div 
            className="w-full h-24 rounded-lg"
            style={style}
          />
        )}
        {atom.type === 'button' && (
          <button 
            className="transition-opacity hover:opacity-90"
            style={{ ...style, cursor: 'pointer' }}
          >
            Button Text
          </button>
        )}
        {atom.type === 'card' && (
          <div 
            className="w-3/4 p-4"
            style={style}
          >
            <div 
              className="h-3 rounded w-1/2 mb-2"
              style={{ 
                background: getContrastingTextColor(
                  (style.background as string) || tokens.colors.surface
                ),
                opacity: 0.3,
              }}
            />
            <div 
              className="h-2 rounded w-full"
              style={{ 
                background: getContrastingTextColor(
                  (style.background as string) || tokens.colors.surface
                ),
                opacity: 0.2,
              }}
            />
          </div>
        )}
        {atom.type === 'typography' && (
          <span style={style}>
            Sample Typography
          </span>
        )}
        {!['surface', 'button', 'card', 'typography'].includes(atom.type) && (
          <div 
            className="w-24 h-24 rounded-lg"
            style={style}
          />
        )}
      </div>
      
      {/* Info and CSS */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span 
                className="text-xs px-2 py-0.5 rounded capitalize"
                style={{ background: 'var(--bg-inset)', color: 'var(--text-muted)' }}
              >
                {atom.type}
              </span>
              <h3 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {atom.name}
              </h3>
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {atom.description}
            </p>
          </div>
          <CopyButton text={atom.css} label="Copy" />
        </div>
        
        <details className="group">
          <summary 
            className="text-xs cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            View CSS
          </summary>
          <div className="code-block mt-2">
            <pre className="font-mono text-xs whitespace-pre-wrap">
              {atom.css}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}

function TokenSectionHeader({ label }: { label: string }) {
  return (
    <div 
      className="text-xs font-medium uppercase tracking-wide mb-2"
      style={{ color: 'var(--text-muted)' }}
    >
      {label}
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
          {value.length > 25 ? value.slice(0, 25) + '...' : value}
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
