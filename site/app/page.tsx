import Link from "next/link";
import { getAllComponents, getStats, getAestheticFamilies, getComponentTypes } from "@/lib/components";
import { ComponentCard } from "@/components/component-card";

export default function HomePage() {
  const components = getAllComponents();
  const stats = getStats();
  const aesthetics = getAestheticFamilies();
  const types = getComponentTypes();
  
  // Get 6 most recent components
  const recentComponents = components.slice(0, 6);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="mb-16">
        <h1 
          className="text-4xl font-semibold mb-4 tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Your Component Library
        </h1>
        <p 
          className="text-lg max-w-2xl mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          {stats.totalComponents} UI patterns extracted from Are.na, 
          auto-organized by aesthetic and type. 
          Copy CSS, browse atoms, or export your design system.
        </p>
        
        {/* Quick stats */}
        <div className="flex gap-8 flex-wrap">
          <Stat label="Components" value={stats.totalComponents} />
          <Stat label="Atoms" value={stats.totalAtoms} />
          <Stat label="Aesthetics" value={stats.aesthetics.length} />
          <Stat label="Types" value={stats.types.length} />
        </div>
      </section>

      {/* Aesthetics Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            By Aesthetic
          </h2>
          <Link 
            href="/aesthetics" 
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View all →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.aesthetics.map(({ name, count }) => (
            <Link
              key={name}
              href={`/aesthetics/${name}`}
              className="card p-4 flex items-center gap-3 hover:border-[var(--border-strong)]"
            >
              <span className={`aesthetic-dot ${name}`} />
              <div className="min-w-0">
                <div 
                  className="font-medium text-sm truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatAesthetic(name)}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {count} {count === 1 ? 'component' : 'components'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Component Types */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            By Component Type
          </h2>
          <Link 
            href="/components" 
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View all →
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {stats.types.slice(0, 15).map(({ name, count }) => (
            <Link
              key={name}
              href={`/components?type=${name}`}
              className="pill hover:border-[var(--border-strong)]"
            >
              {name} <span style={{ color: 'var(--text-muted)' }}>({count})</span>
            </Link>
          ))}
          {stats.types.length > 15 && (
            <Link href="/components" className="pill pill-accent">
              +{stats.types.length - 15} more
            </Link>
          )}
        </div>
      </section>

      {/* Recent Components */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Components
          </h2>
          <Link 
            href="/components" 
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View all →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentComponents.map(component => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      </section>

      {/* Atom Types */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Extractable Atoms
          </h2>
          <Link 
            href="/atoms" 
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Browse atoms →
          </Link>
        </div>
        
        <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Mix and match design atoms from different components
        </p>
        
        <div className="flex flex-wrap gap-2">
          {stats.atomTypes.map(({ name, count }) => (
            <Link
              key={name}
              href={`/atoms/${name}`}
              className="pill hover:border-[var(--border-strong)]"
            >
              {name} <span style={{ color: 'var(--text-muted)' }}>({count})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section 
        className="rounded-xl p-8 text-center"
        style={{ background: 'var(--bg-inset)' }}
      >
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Export Your Design System
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Generate .cursorrules, CSS variables, or a full Tailwind config from your collection
        </p>
        <Link
          href="/export"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          Export Options →
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div 
        className="text-3xl font-semibold tabular-nums"
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

function formatAesthetic(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
