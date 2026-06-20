import slugifyLib from 'slugify'

/**
 * Genera slugs URL-seguros para noticias y eventos.
 * Usa locale 'es' para manejar correctamente caracteres del español.
 * Ejemplo: "¿Qué pasa con Hábbö?" → "que-pasa-con-habbo"
 */
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower:  true,
    strict: true,  // elimina caracteres especiales, conserva solo alfanuméricos y guiones
    locale: 'es',
    trim:   true,
  })
}

/**
 * Genera el slug de un ejército a partir de su sigla.
 * Ejemplo: "F.A.M" → "fam", "G.F.S" → "gfs"
 */
export function siglaToSlug(sigla: string): string {
  return sigla.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')
}
