"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

interface ExportClientProps {
  stats: {
    totalComponents: number;
    totalAtoms: number;
  };
  cursorrules: string;
  cssVariables: string;
  tailwindConfig: string;
  jsonExport: string;
}

export function ExportClient({ 
  stats, 
  cursorrules, 
  cssVariables, 
  tailwindConfig, 
  jsonExport 
}: ExportClientProps) {
  const [activeTab, setActiveTab] = useState<'cursorrules' | 'css' | 'tailwind' | 'json'>('cursorrules');
  
  const tabs = [
    { id: 'cursorrules' as const, label: '.cursorrules', content: cursorrules },
    { id: 'css' as const, label: 'CSS Variables', content: cssVariables },
    { id: 'tailwind' as const, label: 'Tailwind Config', content: tailwindConfig },
    { id: 'json' as const, label: 'JSON Export', content: jsonExport },
  ];
  
  const activeContent = tabs.find(t => t.id === activeTab)?.content || '';
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-3xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Export Design System
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Generate code from your {stats.totalComponents} components and {stats.totalAtoms} atoms
        </p>
      </div>

      {/* Tabs */}
      <div 
        className="flex gap-1 p-1 rounded-lg mb-6"
        style={{ background: 'var(--bg-inset)' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <div 
        className="rounded-lg p-4 mb-6"
        style={{ background: 'var(--bg-inset)' }}
      >
        {activeTab === 'cursorrules' && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Add this to your project&apos;s <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'var(--bg-elevated)' }}>.cursorrules</code> file 
            to guide AI towards your design preferences.
          </p>
        )}
        {activeTab === 'css' && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            CSS custom properties aggregated from your most common design tokens. 
            Add to your <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'var(--bg-elevated)' }}>globals.css</code>.
          </p>
        )}
        {activeTab === 'tailwind' && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Extend your Tailwind config with colors and spacing from your collection.
          </p>
        )}
        {activeTab === 'json' && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Raw JSON export of all components for custom integrations.
          </p>
        )}
      </div>

      {/* Code */}
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <CopyButton text={activeContent} label="Copy All" />
        </div>
        <div 
          className="code-block overflow-auto"
          style={{ maxHeight: '70vh' }}
        >
          <pre className="font-mono text-sm whitespace-pre">
            {activeContent}
          </pre>
        </div>
      </div>
    </div>
  );
}

