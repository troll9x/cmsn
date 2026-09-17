export const DISPLAY_FONT = '"Lora", serif';
export const BODY_FONT = '"Be Vietnam Pro", sans-serif';

// Canvas text must use the loaded faces, rather than rasterizing a fallback.
export function loadFonts() {
  if (!document.fonts) return Promise.resolve();
  return Promise.allSettled([
    document.fonts.load(`400 32px ${DISPLAY_FONT}`),
    document.fonts.load(`italic 400 32px ${DISPLAY_FONT}`),
    document.fonts.load(`400 16px ${BODY_FONT}`),
    document.fonts.load(`500 16px ${BODY_FONT}`),
  ]);
}
