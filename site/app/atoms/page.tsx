import Link from "next/link";
import { getAllAtoms, getAtomTypes } from "@/lib/components";
import { 
  SurfacePreview, 
  ButtonPreview, 
  CardPreview,
} from "@/components/previews";

// Atom type metadata
const ATOM_META: Record<string, { description: string; icon: string }> = {
  surface: { 
    description: 'Background treatments - gradients, solid colors, textures',
    icon: '◼',
  },
  button: { 
    description: 'Interactive button styles with hover states',
    icon: '▢',
  },
  card: { 
    description: 'Container patterns - shadows, borders, padding',
    icon: '▣',
  },
  typography: { 
    description: 'Text styling - weights, sizes, colors',
    icon: 'Aa',
  },
  color: { 
    description: 'Color palettes and usage patterns',
    icon: '●',
  },
  spacing: { 
    description: 'Margin, padding, and gap systems',
    icon: '⊞',
  },
  navigation: { 
    description: 'Nav patterns - menus, tabs, breadcrumbs',
    icon: '≡',
  },
  input: { 
    description: 'Form input styles - borders, focus states',
    icon: '▭',
  },
  icon: { 
    description: 'Icon treatment - sizes, colors, containers',
    icon: '✦',
  },
  shadow: { 
    description: 'Shadow and depth systems',
    icon: '◩',
  },
};

export default function AtomsPage() {
  const allAtoms = getAllAtoms();
  const atomTypes = getAtomTypes();
  
  // Group atoms by type
  const atomsByType: Record<string, typeof allAtoms> = {};
  for (const type of atomTypes) {
    atomsByType[type] = allAtoms.filter(a => a.type === type);
  }
  
  // Sort types by count
  const sortedTypes = atomTypes.sort((a, b) => 
    (atomsByType[b]?.length || 0) - (atomsByType[a]?.length || 0)
  );
  
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section 
        className="py-16 px-4"
        style={{ background: 'var(--bg-inset)' }}
      >
        <div className="max-w-5xl mx-auto">
          <h1 
            className="text-4xl font-semibold tracking-tight mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Design Atoms
          </h1>
          <p 
            className="text-lg max-w-2xl"
            style={{ color: 'var(--text-secondary)' }}
          >
            {allAtoms.length} composable pieces extracted from your references.
            Mix surfaces from one design with buttons from another.
          </p>
        </div>
      </section>

      {/* Atom sections */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        {sortedTypes.map(type => {
          const atoms = atomsByType[type] || [];
          const meta = ATOM_META[type] || { description: '', icon: '•' };
          
          if (atoms.length === 0) return null;
          
          return (
            <AtomSection 
              key={type}
              type={type}
              atoms={atoms}
              meta={meta}
            />
          );
        })}
      </div>
    </div>
  );
}

interface AtomSectionProps {
  type: string;
  atoms: Array<{
    type: string;
    name: string;
    description: string;
    css: string;
    componentId: string;
    componentName: string;
  }>;
  meta: { description: string; icon: string };
}

function AtomSection({ type, atoms, meta }: AtomSectionProps) {
  return (
    <section id={type}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <span 
            className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ 
              background: 'var(--bg-inset)',
              color: 'var(--text-muted)',
            }}
          >
            {meta.icon}
          </span>
          <div>
            <h2 
              className="text-xl font-semibold capitalize"
              style={{ color: 'var(--text-primary)' }}
            >
              {type}
            </h2>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {meta.description}
            </p>
          </div>
        </div>
        <span 
          className="text-sm px-3 py-1 rounded-full"
          style={{ 
            background: 'var(--bg-inset)',
            color: 'var(--text-muted)',
          }}
        >
          {atoms.length}
        </span>
      </div>

      {/* Live rendered atoms */}
      <AtomGrid type={type} atoms={atoms} />
    </section>
  );
}

interface AtomGridProps {
  type: string;
  atoms: Array<{
    name: string;
    css: string;
    componentId: string;
    componentName: string;
  }>;
}

function AtomGrid({ type, atoms }: AtomGridProps) {
  switch (type) {
    case 'surface':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {atoms.map((atom, i) => (
            <AtomCard key={i} atom={atom}>
              <SurfacePreview 
                css={atom.css} 
                showLabel={false}
                size="lg"
                className="w-full h-32"
              />
            </AtomCard>
          ))}
        </div>
      );
    
    case 'button':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {atoms.map((atom, i) => (
            <AtomCard key={i} atom={atom} padded>
              <div className="flex items-center justify-center h-20">
                <ButtonPreview 
                  css={atom.css} 
                  showLabel={false}
                  label="Button"
                  size="md"
                />
              </div>
            </AtomCard>
          ))}
        </div>
      );
    
    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {atoms.map((atom, i) => (
            <AtomCard key={i} atom={atom} noBg>
              <CardPreview 
                css={atom.css} 
                showLabel={false}
                size="lg"
                className="w-full"
              />
            </AtomCard>
          ))}
        </div>
      );
    
    case 'typography':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {atoms.map((atom, i) => (
            <AtomCard key={i} atom={atom} padded>
              <TypographyAtomPreview css={atom.css} />
            </AtomCard>
          ))}
        </div>
      );
    
    default:
      // Generic grid for other atom types
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {atoms.map((atom, i) => (
            <AtomCard key={i} atom={atom} padded>
              <GenericAtomPreview atom={atom} />
            </AtomCard>
          ))}
        </div>
      );
  }
}

interface AtomCardProps {
  atom: {
    name: string;
    componentId: string;
    componentName: string;
  };
  children: React.ReactNode;
  padded?: boolean;
  noBg?: boolean;
}

function AtomCard({ atom, children, padded, noBg }: AtomCardProps) {
  return (
    <Link 
      href={`/components/${atom.componentId}`}
      className="group block"
    >
      <div 
        className={`
          rounded-xl overflow-hidden
          transition-all duration-200
          group-hover:scale-[1.02]
          ${!noBg ? 'border' : ''}
        `}
        style={{ 
          borderColor: noBg ? 'transparent' : 'var(--border)',
          background: noBg ? 'transparent' : 'var(--bg-elevated)',
        }}
      >
        <div className={padded ? 'p-4' : ''}>
          {children}
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-3">
        <div 
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {atom.name}
        </div>
        <div 
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          from {atom.componentName}
        </div>
      </div>
    </Link>
  );
}

// Typography atom live preview
function TypographyAtomPreview({ css }: { css: string }) {
  // Parse the CSS to apply styles
  const style = parseCSSToStyle(css);
  
  return (
    <div className="space-y-2">
      <div style={style}>
        The quick brown fox
      </div>
      <div 
        className="text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        Aa Bb Cc Dd Ee Ff Gg
      </div>
    </div>
  );
}

// Generic atom preview for unhandled types
function GenericAtomPreview({ atom }: { atom: { css: string; name: string } }) {
  const style = parseCSSToStyle(atom.css);
  
  return (
    <div 
      className="h-20 rounded-lg flex items-center justify-center"
      style={{
        ...style,
        minHeight: '80px',
      }}
    >
      <span 
        className="text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        Preview
      </span>
    </div>
  );
}

// Simple CSS parser for inline styles
function parseCSSToStyle(css: string): React.CSSProperties {
  if (!css) return {};
  
  const style: Record<string, string> = {};
  const properties = css.split(/[;\n]/).filter(p => p.trim());
  
  for (const prop of properties) {
    const colonIndex = prop.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = prop.slice(0, colonIndex).trim();
    const value = prop.slice(colonIndex + 1).trim();
    
    // Convert kebab-case to camelCase
    const camelKey = key.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
    style[camelKey] = value;
  }
  
  return style as React.CSSProperties;
}
