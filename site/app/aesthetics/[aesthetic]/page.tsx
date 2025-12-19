import Link from "next/link";
import { notFound } from "next/navigation";
import { getComponentsByAesthetic, getAestheticFamilies } from "@/lib/components";
import { ComponentCard } from "@/components/component-card";

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

interface PageProps {
  params: Promise<{ aesthetic: string }>;
}

export default async function AestheticDetailPage({ params }: PageProps) {
  const { aesthetic } = await params;
  const components = getComponentsByAesthetic(aesthetic);
  
  if (components.length === 0) {
    notFound();
  }
  
  const description = AESTHETIC_DESCRIPTIONS[aesthetic] || 'A distinct visual style.';
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/aesthetics"
          className="text-sm mb-4 inline-block hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back to aesthetics
        </Link>
        
        <div className="flex items-center gap-4 mb-4">
          <div 
            className={`aesthetic-dot ${aesthetic}`}
            style={{ width: '32px', height: '32px' }}
          />
          <h1 
            className="text-3xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatName(aesthetic)}
          </h1>
        </div>
        
        <p className="max-w-2xl mb-2" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
        
        <p style={{ color: 'var(--text-muted)' }}>
          {components.length} component{components.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Design characteristics */}
      <AestheticCharacteristics aesthetic={aesthetic} components={components} />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map(component => (
          <ComponentCard key={component.id} component={component} showAesthetic={false} />
        ))}
      </div>
    </div>
  );
}

function AestheticCharacteristics({ aesthetic, components }: { aesthetic: string; components: any[] }) {
  // Aggregate common tokens from this aesthetic
  const radiusValues: Record<string, number> = {};
  const colorPatterns: string[] = [];
  
  for (const comp of components) {
    const radius = comp.tokens?.radius?.containers;
    if (radius) {
      radiusValues[radius] = (radiusValues[radius] || 0) + 1;
    }
    
    const bg = comp.tokens?.colors?.background;
    if (bg && bg.includes('gradient')) {
      colorPatterns.push('Gradients');
    } else if (bg) {
      colorPatterns.push('Solid backgrounds');
    }
  }
  
  const mostCommonRadius = Object.entries(radiusValues)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  
  const usesGradients = colorPatterns.filter(p => p === 'Gradients').length > components.length / 2;
  
  return (
    <div 
      className="rounded-xl p-6 mb-8"
      style={{ background: 'var(--bg-inset)' }}
    >
      <h3 
        className="font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Common Characteristics
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {mostCommonRadius && (
          <span className="pill">
            Border radius: {mostCommonRadius}
          </span>
        )}
        {usesGradients && (
          <span className="pill">
            Uses gradients
          </span>
        )}
        <span className="pill">
          {components.length} examples
        </span>
      </div>
    </div>
  );
}

// Generate static params for all aesthetics
export async function generateStaticParams() {
  const aesthetics = getAestheticFamilies();
  return aesthetics.map(aesthetic => ({ aesthetic }));
}

function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

