import Link from "next/link";
import { getComponentIndex, getComponentsByAesthetic } from "@/lib/components";

// Descriptions for each aesthetic family
const AESTHETIC_DESCRIPTIONS: Record<string, string> = {
  'soft-gradient': 'Light, airy designs with subtle color gradients and very rounded corners. Creates a calm, premium feel.',
  'dark-premium': 'Dark backgrounds with high contrast text and sleek, minimal styling. Sophisticated and modern.',
  'flat-minimal': 'Clean designs with lots of white space, minimal shadows, and simple shapes. Content-focused.',
  'neo-skeuomorphic': 'Layered shadows creating depth, tactile buttons, and a physical/material feel.',
  'playful-colorful': 'Bold saturated colors, illustrations, rounded shapes. Fun and energetic.',
  'editorial': 'Typography-driven layouts with magazine-like sophistication and refined font pairing.',
  'technical-dense': 'Compact spacing for data-heavy interfaces. Functional over decorative.',
  'glass-morphism': 'Frosted glass effects with blur and translucent overlays. Modern and layered.',
  'warm-organic': 'Earth tones with natural textures. Warm and inviting.',
  'brutalist': 'Raw, stark designs with unconventional layouts and bold contrasts.',
};

export default function AestheticsPage() {
  const index = getComponentIndex();
  
  // Get aesthetics sorted by count
  const aesthetics = Object.entries(index.by_aesthetic)
    .map(([name, ids]) => ({ name, count: ids.length }))
    .sort((a, b) => b.count - a.count);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 
          className="text-3xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Aesthetic Families
        </h1>
        <p className="max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
          Your components grouped by visual style. Each aesthetic has a distinct vibe 
          and works best in specific contexts.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aesthetics.map(({ name, count }) => (
          <AestheticCard 
            key={name} 
            name={name} 
            count={count}
            description={AESTHETIC_DESCRIPTIONS[name] || 'A distinct visual style.'}
          />
        ))}
      </div>
    </div>
  );
}

function AestheticCard({ 
  name, 
  count, 
  description 
}: { 
  name: string; 
  count: number; 
  description: string;
}) {
  // Get sample components for preview
  const components = getComponentsByAesthetic(name).slice(0, 3);
  
  return (
    <Link 
      href={`/aesthetics/${name}`}
      className="card p-6 hover:border-[var(--border-strong)] group"
    >
      <div className="flex items-start gap-4 mb-4">
        <div 
          className={`aesthetic-dot ${name}`} 
          style={{ width: '24px', height: '24px' }}
        />
        <div>
          <h2 
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatName(name)}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {count} component{count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <p 
        className="text-sm mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
      
      {/* Preview thumbnails */}
      {components.length > 0 && (
        <div className="flex gap-2">
          {components.map(component => (
            <div
              key={component.id}
              className="w-16 h-12 rounded overflow-hidden"
              style={{ background: 'var(--bg-inset)' }}
            >
              <img
                src={component.source.image_url}
                alt=""
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

