/**
 * WERELDKLASSE CURSUS SLUG MANAGEMENT
 *
 * Dit bestand bevat alle slug alias logic voor backwards compatibility
 * en SEO-friendly URL management.
 *
 * Waarom deze aanpak:
 * - Single source of truth voor slug mappings
 * - Backwards compatible met oude links
 * - Makkelijk uitbreidbaar voor nieuwe aliases
 * - Type-safe met TypeScript
 */

/**
 * Slug alias mapping: oude/alternatieve slug -> canonical slug in database
 */
export const CURSUS_SLUG_ALIASES: Record<string, string> = {
  'profielfoto': 'profielfoto-5-stappen',
  // Add more aliases here as needed
  // 'oude-slug': 'nieuwe-canonical-slug',
};

/**
 * Resolve een slug naar de canonical versie
 *
 * @param slug - De slug die ge-resolved moet worden
 * @returns De canonical slug voor database queries
 *
 * @example
 * resolveSlug('profielfoto') // returns 'profielfoto-5-stappen'
 * resolveSlug('profielfoto-5-stappen') // returns 'profielfoto-5-stappen'
 */
export function resolveSlug(slug: string): string {
  return CURSUS_SLUG_ALIASES[slug] || slug;
}

/**
 * Check of een slug een alias is (niet-canonical)
 *
 * @param slug - De slug om te checken
 * @returns true als dit een alias is die moet redirecten
 */
export function isAliasSlug(slug: string): boolean {
  return slug in CURSUS_SLUG_ALIASES;
}

/**
 * Get de canonical slug voor een gegeven slug
 *
 * @param slug - De input slug
 * @returns Object met canonical slug en of het een alias was
 */
export function getCanonicalSlug(slug: string): { canonical: string; wasAlias: boolean } {
  const canonical = resolveSlug(slug);
  return {
    canonical,
    wasAlias: canonical !== slug
  };
}
