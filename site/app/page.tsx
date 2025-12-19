import Link from "next/link";
import { getAllComponents, getStats, getAllAtoms } from "@/lib/components";
import { 
  ComponentCompositionMini,
  SurfacePreview,
  ButtonPreview,
  CardPreview,
  ColorStrip,
} from "@/components/previews";

export default function HomePage() {
  const components = getAllComponents();
  const stats = getStats();
  const allAtoms = getAllAtoms();
  
  // Group atoms by type
  const surfaceAtoms = allAtoms.filter(a => a.type === 'surface').slice(0, 6);
  const buttonAtoms = allAtoms.filter(a => a.type === 'button').slice(0, 6);
  const cardAtoms = allAtoms.filter(a => a.type === 'card').slice(0, 4);
  
  // Get recent components for live preview
  const recentComponents = components.slice(0, 6);
  
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section 
        className="py-20 px-4"
        style={{ background: 'var(--bg-inset)' }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 
            className="text-5xl font-semibold tracking-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Your Design System
          </h1>
          <p 
            className="text-xl max-w-2xl mx-auto mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            {stats.totalComponents} patterns extracted from your taste.
            Browse live components, not screenshots.
          </p>
          
          {/* Quick stats */}
          <div className="flex justify-center gap-12 mb-12">
            <Stat value={stats.totalComponents} label="Components" />
            <Stat value={stats.totalAtoms} label="Atoms" />
            <Stat value={stats.aesthetics.length} label="Aesthetics" />
          </div>
          
          {/* CTA */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/atoms"
              className="px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              Browse Atoms
            </Link>
            <Link
              href="/export"
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              Export System
            </Link>
          </div>
        </div>
      </section>

      {/* Live Surfaces */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <SectionHeader 
          title="Surfaces" 
          subtitle="Background treatments extracted from your references"
          href="/atoms/surface"
        />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {surfaceAtoms.map((atom, i) => (
            <Link 
              key={i} 
              href={`/components/${atom.componentId}`}
              className="group"
            >
              <SurfacePreview 
                css={atom.css} 
                name={atom.name}
                size="sm"
                className="w-full"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Live Buttons */}
      <section 
        className="py-16 px-4"
        style={{ background: 'var(--bg-inset)' }}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="Buttons" 
            subtitle="Interactive button styles ready to use"
            href="/atoms/button"
          />
          
          <div className="flex flex-wrap gap-6 items-end">
            {buttonAtoms.map((atom, i) => (
              <Link 
                key={i} 
                href={`/components/${atom.componentId}`}
                className="group"
              >
                <ButtonPreview 
                  css={atom.css} 
                  name={atom.name}
                  label="Action"
                  size="md"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Cards */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <SectionHeader 
          title="Cards" 
          subtitle="Container patterns with shadows and borders"
          href="/atoms/card"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardAtoms.map((atom, i) => (
            <Link 
              key={i} 
              href={`/components/${atom.componentId}`}
              className="group"
            >
              <CardPreview 
                css={atom.css} 
                name={atom.name}
                size="lg"
                className="w-full"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Component Compositions */}
      <section 
        className="py-16 px-4"
        style={{ background: 'var(--bg-inset)' }}
      >
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="Full Compositions" 
            subtitle="Complete component patterns rendered live"
            href="/components"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentComponents.map(component => (
              <Link 
                key={component.id} 
                href={`/components/${component.id}`}
                className="group"
              >
                <div className="card overflow-hidden">
                  <ComponentCompositionMini 
                    component={component}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ColorStrip 
                        tokens={component.tokens} 
                        className="w-12 h-2"
                      />
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {formatAesthetic(component.aesthetic_family)}
                      </span>
                    </div>
                    <h3 
                      className="font-medium text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {component.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Aesthetics overview */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <SectionHeader 
          title="By Aesthetic" 
          subtitle="Browse by visual style"
          href="/aesthetics"
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.aesthetics.slice(0, 8).map(({ name, count }) => {
            // Get a sample component for this aesthetic
            const sampleComponent = components.find(c => c.aesthetic_family === name);
            
            return (
              <Link 
                key={name} 
                href={`/aesthetics/${name}`}
                className="group"
              >
                <div className="card overflow-hidden">
                  {sampleComponent ? (
                    <ComponentCompositionMini 
                      component={sampleComponent}
                      className="aspect-[3/2]"
                    />
                  ) : (
                    <div 
                      className="aspect-[3/2]"
                      style={{ background: 'var(--bg-inset)' }}
                    />
                  )}
                  <div className="p-3">
                    <div 
                      className="font-medium text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatAesthetic(name)}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {count} pattern{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Export CTA */}
      <section 
        className="py-20 px-4"
        style={{ background: 'var(--bg-inset)' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 
            className="text-2xl font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Export Your Design System
          </h2>
          <p 
            className="mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            Generate .cursorrules, CSS variables, or a Tailwind config 
            from your extracted patterns.
          </p>
          <Link
            href="/export"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Export Options →
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div 
        className="text-4xl font-semibold tabular-nums"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </div>
      <div 
        className="text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
    </div>
  );
}

function SectionHeader({ 
  title, 
  subtitle, 
  href 
}: { 
  title: string; 
  subtitle: string; 
  href: string;
}) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 
          className="text-2xl font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
        <p 
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {subtitle}
        </p>
      </div>
      <Link 
        href={href}
        className="text-sm font-medium hover:underline"
        style={{ color: 'var(--accent)' }}
      >
        View all →
      </Link>
    </div>
  );
}

function formatAesthetic(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
