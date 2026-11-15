export const colors = {
  background: '#F4F7FC', surface: '#FFFFFF', ink: '#17243B', muted: '#607089',
  primary: '#2563EB', navy: '#172D50', accent: '#93C5FD', line: '#DDE5F0', soft: '#DBEAFE',
  onDarkMuted: '#CFDCF0', darkSurface: '#243F65', darkTrack: '#355176',
  overlay: '#17243B99', placeholder: '#64748B',
  danger: '#AA3838', errorBg: '#FFF0ED', white: '#FFFFFF',
};
// Mantém o nome do tema apresentado nas primeiras aulas.
export const themas = { colors: {
  ...colors, secondary: colors.white, lightGray: colors.background,
  gray: colors.muted, black: colors.ink, bgScreen: colors.background,
  corDeFundo: colors.primary,
} };
