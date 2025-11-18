/**
 * Punto de entrada único para todas las constantes
 */
export * from './dbValues';
export * from './translations';

// Helper function para traducir valores DB
export function getTranslationKey(dbValue: string): string | null {
  // @ts-ignore - dynamic lookup
  return DB_TO_TRANSLATION_KEY[dbValue] || null;
}