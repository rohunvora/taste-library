import Link from "next/link";
import { getAllComponents, getComponentTypes, getAestheticFamilies } from "@/lib/components";
import { ComponentCard } from "@/components/component-card";

interface PageProps {
  searchParams: Promise<{ type?: string; aesthetic?: string }>;
}

export default async function ComponentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const allComponents = getAllComponents();
  const types = getComponentTypes();
  const aesthetics = getAestheticFamilies();
  
  // Filter components
  let components = allComponents;
  
  if (params.type) {
    components = components.filter(c => 
      c.component_types.includes(params.type!)
    );
  }
  
  if (params.aesthetic) {
    components = components.filter(c => 
      c.aesthetic_family === params.aesthetic
    );
  }
  
  const activeType = params.type;
  const activeAesthetic = params.aesthetic;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-3xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          All Components
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {components.length} component{components.length !== 1 ? 's' : ''} 
          {activeType && ` with ${activeType}`}
          {activeAesthetic && ` in ${formatName(activeAesthetic)} style`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Type filters */}
        <div>
          <div 
            className="text-xs font-medium uppercase tracking-wide mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Component Type
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill 
              href="/components" 
              active={!activeType}
            >
              All
            </FilterPill>
            {types.map(type => (
              <FilterPill
                key={type}
                href={`/components?type=${type}${activeAesthetic ? `&aesthetic=${activeAesthetic}` : ''}`}
                active={activeType === type}
              >
                {type}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Aesthetic filters */}
        <div>
          <div 
            className="text-xs font-medium uppercase tracking-wide mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Aesthetic
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill 
              href={activeType ? `/components?type=${activeType}` : '/components'} 
              active={!activeAesthetic}
            >
              All
            </FilterPill>
            {aesthetics.map(aesthetic => (
              <FilterPill
                key={aesthetic}
                href={`/components?${activeType ? `type=${activeType}&` : ''}aesthetic=${aesthetic}`}
                active={activeAesthetic === aesthetic}
              >
                <span className={`aesthetic-dot ${aesthetic} mr-1.5`} />
                {formatName(aesthetic)}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {components.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map(component => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      ) : (
        <div 
          className="text-center py-16 rounded-xl"
          style={{ background: 'var(--bg-inset)' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>
            No components match these filters
          </p>
          <Link 
            href="/components" 
            className="inline-block mt-4 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Clear filters →
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterPill({ 
  href, 
  active, 
  children 
}: { 
  href: string; 
  active: boolean; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
      style={{
        background: active ? 'var(--accent-soft)' : 'var(--bg-elevated)',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
      }}
    >
      {children}
    </Link>
  );
}

function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

