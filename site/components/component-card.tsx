"use client";

import Link from "next/link";
import Image from "next/image";
import type { ExtractedComponent } from "@/lib/components";

interface ComponentCardProps {
  component: ExtractedComponent;
  showAesthetic?: boolean;
}

export function ComponentCard({ component, showAesthetic = true }: ComponentCardProps) {
  return (
    <Link href={`/components/${component.id}`} className="card group">
      {/* Image */}
      <div className="image-container">
        <Image
          src={component.source.image_url}
          alt={component.name}
          width={600}
          height={375}
          className="transition-transform group-hover:scale-105"
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 
            className="font-semibold text-sm leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {component.name}
          </h3>
          {showAesthetic && (
            <span className={`aesthetic-dot ${component.aesthetic_family} flex-shrink-0`} />
          )}
        </div>
        
        <p 
          className="text-xs line-clamp-2 mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {component.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {component.component_types.slice(0, 3).map(type => (
            <span 
              key={type}
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                background: 'var(--bg-inset)', 
                color: 'var(--text-muted)' 
              }}
            >
              {type}
            </span>
          ))}
          {component.component_types.length > 3 && (
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                background: 'var(--bg-inset)', 
                color: 'var(--text-muted)' 
              }}
            >
              +{component.component_types.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact version for lists
export function ComponentCardCompact({ component }: { component: ExtractedComponent }) {
  return (
    <Link 
      href={`/components/${component.id}`} 
      className="card flex gap-4 p-3 hover:border-[var(--border-strong)]"
    >
      {/* Thumbnail */}
      <div 
        className="w-20 h-14 rounded overflow-hidden flex-shrink-0"
        style={{ background: 'var(--bg-inset)' }}
      >
        <Image
          src={component.source.image_url}
          alt={component.name}
          width={80}
          height={56}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
      
      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`aesthetic-dot ${component.aesthetic_family}`} />
          <h4 
            className="font-medium text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {component.name}
          </h4>
        </div>
        <p 
          className="text-xs truncate"
          style={{ color: 'var(--text-muted)' }}
        >
          {component.component_types.join(', ')}
        </p>
      </div>
    </Link>
  );
}

