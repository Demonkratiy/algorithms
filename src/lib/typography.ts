export const textSizes = [
  { id: 'small', title: 'Маленький' },
  { id: 'medium', title: 'Средний' },
  { id: 'large', title: 'Большой' },
] as const;
export type TextSize = typeof textSizes[number]['id'];
export const editorFontSizes: Record<TextSize, number> = { small: 12, medium: 14, large: 16 };
export const uiFonts = [
  { id: 'system', title: 'Системный', family: '"Segoe UI", system-ui, sans-serif', webFamily: '' },
  { id: 'inter', title: 'Inter', family: '"Inter Variable", sans-serif', webFamily: 'Inter Variable' },
  { id: 'source-sans', title: 'Source Sans 3', family: '"Source Sans 3 Variable", sans-serif', webFamily: 'Source Sans 3 Variable' },
  { id: 'roboto', title: 'Roboto', family: '"Roboto Variable", sans-serif', webFamily: 'Roboto Variable' },
  { id: 'manrope', title: 'Manrope', family: '"Manrope Variable", sans-serif', webFamily: 'Manrope Variable' },
  { id: 'noto-serif', title: 'Noto Serif', family: '"Noto Serif Variable", serif', webFamily: 'Noto Serif Variable' },
  { id: 'comic-relief', title: 'Comic Relief', family: '"Comic Relief", cursive', webFamily: 'Comic Relief' },
] as const;
export const editorFonts = [
  { id: 'default', title: 'По умолчанию', family: 'Consolas, "Courier New", monospace', webFamily: '' },
  { id: 'jetbrains-mono', title: 'JetBrains Mono', family: '"JetBrains Mono Variable", monospace', webFamily: 'JetBrains Mono Variable' },
  { id: 'source-code', title: 'Source Code Pro', family: '"Source Code Pro Variable", monospace', webFamily: 'Source Code Pro Variable' },
] as const;
export type UiFont = typeof uiFonts[number]['id'];
export type EditorFont = typeof editorFonts[number]['id'];
export const isTextSize = (value: unknown): value is TextSize => textSizes.some(size => size.id === value);
export const isUiFont = (value: unknown): value is UiFont => uiFonts.some(font => font.id === value);
export const isEditorFont = (value: unknown): value is EditorFont => editorFonts.some(font => font.id === value);

export function uiFontDefinition(id: UiFont) {
  const font = uiFonts.find(font => font.id === id);
  if (!font) throw new Error(`Неизвестный шрифт интерфейса: ${id}`);
  return font;
}
export function editorFontDefinition(id: EditorFont) {
  const font = editorFonts.find(font => font.id === id);
  if (!font) throw new Error(`Неизвестный шрифт редактора: ${id}`);
  return font;
}
