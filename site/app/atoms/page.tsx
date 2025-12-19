import Link from "next/link";
import { getAllAtoms, getAtomTypes } from "@/lib/components";

// Descriptions for each atom type
const ATOM_DESCRIPTIONS: Record<string, string> = {
  surface: 'Background and container treatments - gradients, solid colors, textures',
  button: 'Button styles - shapes, colors, hover states',
  card: 'Card and container patterns - borders, shadows, padding',
  typography: 'Text styling approaches - weights, sizes, colors',
  navigation: 'Navigation patterns - menus, tabs, breadcrumbs',
  input: 'Form input styles - borders, focus states, placeholders',
  icon: 'Icon treatment - sizes, colors, containers',
  spacing: 'Spacing systems - margins, padding, gaps',
  color: 'Color usage patterns - palettes, contrast',
  shadow: 'Shadow and depth systems - elevations, focus rings',
  animation: 'Motion patterns - transitions, animations',
};

export default function AtomsPage() {
  const allAtoms = getAllAtoms();
  const atomTypes = getAtomTypes();
  
  // Count atoms by type
  const atomCounts: Record<string, number> = {};
  for (const atom of allAtoms) {
    atomCounts[atom.type] = (atomCounts[atom.type] || 0) + 1;
  }
  
  // Sort by count
  const sortedTypes = atomTypes.sort((a, b) => 
    (atomCounts[b] || 0) - (atomCounts[a] || 0)
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 
          className="text-3xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Extractable Atoms
        </h1>
        <p className="max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
          Design atoms extracted from your components. Mix and match surfaces from 
          one design with buttons from another to create unique combinations.
        </p>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
          {allAtoms.length} atoms across {atomTypes.length} categories
        </p>
      </div>

      {/* Atom type cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTypes.map(type => (
          <AtomTypeCard
            key={type}
            type={type}
            count={atomCounts[type] || 0}
            description={ATOM_DESCRIPTIONS[type] || 'Design atom'}
            atoms={allAtoms.filter(a => a.type === type).slice(0, 3)}
          />
        ))}
      </div>
    </div>
  );
}

function AtomTypeCard({ 
  type, 
  count, 
  description,
  atoms
}: { 
  type: string; 
  count: number; 
  description: string;
  atoms: Array<{ name: string; componentName: string }>;
}) {
  return (
    <Link 
      href={`/atoms/${type}`}
      className="card p-6 hover:border-[var(--border-strong)]"
    >
      <div className="flex items-start justify-between mb-3">
        <h2 
          className="text-lg font-semibold capitalize"
          style={{ color: 'var(--text-primary)' }}
        >
          {type}
        </h2>
        <span 
          className="text-sm px-2 py-0.5 rounded"
          style={{ background: 'var(--bg-inset)', color: 'var(--text-muted)' }}
        >
          {count}
        </span>
      </div>
      
      <p 
        className="text-sm mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
      
      {/* Sample atoms */}
      {atoms.length > 0 && (
        <div className="space-y-2">
          {atoms.map((atom, i) => (
            <div 
              key={i}
              className="text-xs truncate"
              style={{ color: 'var(--text-muted)' }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{atom.name}</span>
              {' '}from {atom.componentName}
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

