export const palettes = [
  { id: 'lavender', title: 'Лаванда', description: 'Лилово-серый фон и фиолетовый акцент' },
  { id: 'ocean', title: 'Океан', description: 'Холодный серый фон и синий акцент' },
  { id: 'forest', title: 'Лес', description: 'Серо-зелёный фон и изумрудный акцент' },
  { id: 'graphite', title: 'Графит', description: 'Нейтральные серые оттенки без яркого акцента' },
  { id: 'ruby', title: 'Роза', description: 'Тёплый серый фон и розово-красный акцент' },
  { id: 'rose', title: 'Орхидея', description: 'Приглушённый сливовый фон и розово-малиновый акцент' },
  { id: 'scarlet', title: 'Алый', description: 'Тёплые нейтральные оттенки и выразительный красный акцент' },
  { id: 'amber', title: 'Янтарь', description: 'Песочно-серый фон и оранжево-золотистый акцент' },
] as const;

export type Palette = typeof palettes[number]['id'];
export function isPalette(value: unknown): value is Palette {
  return palettes.some(palette => palette.id === value);
}
