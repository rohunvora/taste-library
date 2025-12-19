/**
 * Data loading utilities for component library
 */

import fs from 'fs';
import path from 'path';

// Types matching our extraction schema
export interface DesignTokens {
  colors: {
    background: string;
    surface: string;
    text_primary: string;
    text_secondary: string;
    accent: string;
  };
  radius: {
    containers: string;
    buttons: string;
  };
  shadows: {
    default: string;
  };
  spacing: {
    base_unit: string;
    container_padding: string;
    element_gap: string;
  };
  typography: {
    heading_weight: string;
    body_weight: string;
    heading_size: string;
    body_size: string;
    line_height: string;
    font_style: string;
  };
}

export interface ExtractedAtom {
  type: string;
  name: string;
  description: string;
  css: string;
  tailwind?: string;
}

export interface ExtractedComponent {
  id: string;
  name: string;
  description: string;
  screen_type: string;
  component_types: string[];
  aesthetic_family: string;
  tags: string[];
  tokens: DesignTokens;
  atoms: ExtractedAtom[];
  code: {
    css: string;
    tailwind?: string;
  };
  usage: {
    best_for: string[];
    avoid_for: string[];
  };
  source: {
    arena_id: number;
    arena_url: string;
    image_url: string;
    title: string | null;
  };
  extracted_at: string;
  extraction_version: string;
}

export interface ComponentIndex {
  version: string;
  generated_at: string;
  total_components: number;
  by_aesthetic: Record<string, string[]>;
  by_type: Record<string, string[]>;
  by_screen: Record<string, string[]>;
  components: string[];
}

// Path to components directory (inside site)
const COMPONENTS_DIR = path.join(process.cwd(), 'data');

/**
 * Load the component index
 */
export function getComponentIndex(): ComponentIndex {
  const indexPath = path.join(COMPONENTS_DIR, 'index.json');
  const data = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Load a single component by ID
 */
export function getComponent(id: string): ExtractedComponent | null {
  try {
    const filePath = path.join(COMPONENTS_DIR, `${id}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Load all components
 */
export function getAllComponents(): ExtractedComponent[] {
  const index = getComponentIndex();
  const components: ExtractedComponent[] = [];
  
  for (const id of index.components) {
    const component = getComponent(id);
    if (component) {
      components.push(component);
    }
  }
  
  // Sort by extracted_at (most recent first)
  return components.sort((a, b) => 
    new Date(b.extracted_at).getTime() - new Date(a.extracted_at).getTime()
  );
}

/**
 * Get components by aesthetic family
 */
export function getComponentsByAesthetic(aesthetic: string): ExtractedComponent[] {
  const index = getComponentIndex();
  const ids = index.by_aesthetic[aesthetic] || [];
  
  return ids
    .map(id => getComponent(id))
    .filter((c): c is ExtractedComponent => c !== null);
}

/**
 * Get components by component type
 */
export function getComponentsByType(type: string): ExtractedComponent[] {
  const index = getComponentIndex();
  const ids = index.by_type[type] || [];
  
  return ids
    .map(id => getComponent(id))
    .filter((c): c is ExtractedComponent => c !== null);
}

/**
 * Get components by screen type
 */
export function getComponentsByScreen(screen: string): ExtractedComponent[] {
  const index = getComponentIndex();
  const ids = index.by_screen[screen] || [];
  
  return ids
    .map(id => getComponent(id))
    .filter((c): c is ExtractedComponent => c !== null);
}

/**
 * Get all atoms across all components
 */
export function getAllAtoms(): Array<ExtractedAtom & { componentId: string; componentName: string }> {
  const components = getAllComponents();
  const atoms: Array<ExtractedAtom & { componentId: string; componentName: string }> = [];
  
  for (const component of components) {
    for (const atom of component.atoms) {
      atoms.push({
        ...atom,
        componentId: component.id,
        componentName: component.name,
      });
    }
  }
  
  return atoms;
}

/**
 * Get atoms by type
 */
export function getAtomsByType(type: string): Array<ExtractedAtom & { componentId: string; componentName: string }> {
  return getAllAtoms().filter(atom => atom.type === type);
}

/**
 * Get statistics for the library
 */
export function getStats() {
  const index = getComponentIndex();
  const components = getAllComponents();
  const atoms = getAllAtoms();
  
  // Count aesthetics
  const aestheticCounts = Object.entries(index.by_aesthetic)
    .map(([name, ids]) => ({ name, count: ids.length }))
    .sort((a, b) => b.count - a.count);
  
  // Count component types
  const typeCounts = Object.entries(index.by_type)
    .map(([name, ids]) => ({ name, count: ids.length }))
    .sort((a, b) => b.count - a.count);
  
  // Count atom types
  const atomTypeCounts: Record<string, number> = {};
  for (const atom of atoms) {
    atomTypeCounts[atom.type] = (atomTypeCounts[atom.type] || 0) + 1;
  }
  
  const atomTypes = Object.entries(atomTypeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalComponents: index.total_components,
    totalAtoms: atoms.length,
    aesthetics: aestheticCounts,
    types: typeCounts,
    atomTypes,
    generatedAt: index.generated_at,
  };
}

/**
 * Get unique aesthetic families
 */
export function getAestheticFamilies(): string[] {
  const index = getComponentIndex();
  return Object.keys(index.by_aesthetic).sort();
}

/**
 * Get unique component types
 */
export function getComponentTypes(): string[] {
  const index = getComponentIndex();
  return Object.keys(index.by_type).sort();
}

/**
 * Get unique atom types
 */
export function getAtomTypes(): string[] {
  const atoms = getAllAtoms();
  return [...new Set(atoms.map(a => a.type))].sort();
}

