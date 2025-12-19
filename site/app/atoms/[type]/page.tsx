import Link from "next/link";
import { notFound } from "next/navigation";
import { getAtomsByType, getAtomTypes } from "@/lib/components";
import { CopyButton } from "@/components/copy-button";

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function AtomTypePage({ params }: PageProps) {
  const { type } = await params;
  const atoms = getAtomsByType(type);
  
  if (atoms.length === 0) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/atoms"
          className="text-sm mb-4 inline-block hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back to atoms
        </Link>
        
        <h1 
          className="text-3xl font-semibold capitalize mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {type} Atoms
        </h1>
        
        <p style={{ color: 'var(--text-secondary)' }}>
          {atoms.length} {type} pattern{atoms.length !== 1 ? 's' : ''} extracted from your components
        </p>
      </div>

      {/* Atoms list */}
      <div className="space-y-6">
        {atoms.map((atom, i) => (
          <AtomCard key={i} atom={atom} />
        ))}
      </div>
    </div>
  );
}

function AtomCard({ atom }: { 
  atom: { 
    name: string; 
    description: string; 
    css: string; 
    componentId: string;
    componentName: string;
  } 
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 
            className="font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {atom.name}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            from{' '}
            <Link 
              href={`/components/${atom.componentId}`}
              className="hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              {atom.componentName}
            </Link>
          </p>
        </div>
        <CopyButton text={atom.css} label="Copy CSS" />
      </div>
      
      <p 
        className="text-sm mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        {atom.description}
      </p>
      
      {/* CSS code */}
      <div className="code-block">
        <pre className="font-mono text-sm whitespace-pre-wrap">
          {atom.css}
        </pre>
      </div>
    </div>
  );
}

// Generate static params for all atom types
export async function generateStaticParams() {
  const atomTypes = getAtomTypes();
  return atomTypes.map(type => ({ type }));
}
