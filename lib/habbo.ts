// lib/habbo.ts
// Helpers para URLs de avatares de Habbo

/** Avatar completo — caminando en diagonal, saludando */
export function habboAvatarFull(username: string): string {
  return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=l&direction=2&head_direction=2&action=wlk,wav&gesture=sml&headonly=0`
}

/** Solo cabeza — para menús y avatares pequeños */
export function habboAvatarHead(username: string): string {
  return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=l&direction=1&head_direction=2&gesture=sml&headonly=1`
}
