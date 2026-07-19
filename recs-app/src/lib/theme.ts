/**
 * Design tokens — extracted from the Figma file's variables ("rainbow" theme).
 * Light and dark themes are planned; keep ALL color/type usage flowing through
 * this file so a future theme picker is a token swap, not a rewrite.
 */
export const colors = {
  bg: '#4B0082', // Figma var: bg-color
  primary400: '#FFA500', // Figma var: Primary 400 (orange accent)
  primary800: '#241C47', // Figma var: Primary 800
  font: '#EE82EE', // Figma var: font (violet text)
  fontOnPrimary: '#F6F5F5', // Figma var: font on primary
  description: '#F5C4DE', // long-form description text
  cardOutline: '#F5C4DE',
  success: '#00FF00',
  info: '#0000FF',
} as const;

export const fonts = {
  /** Titles — Crimson Pro Light (Figma "Title": 60/60, ls -3) */
  title: 'CrimsonPro_300Light',
  /** Body — Manrope Medium (Figma "body": 18/22) */
  body: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
  /** Actions/tags/tabs — Pixelify Sans (Figma "action": 18) */
  action: 'PixelifySans_400Regular',
  /** Long descriptions — Goudy Bookletter 1911 */
  bookish: 'GoudyBookletter1911_400Regular',
} as const;

export const type = {
  title: { fontFamily: fonts.title, fontSize: 60, lineHeight: 60, letterSpacing: -1.8, color: colors.font },
  heading: { fontFamily: fonts.title, fontSize: 34, lineHeight: 38, letterSpacing: -1, color: colors.font },
  body: { fontFamily: fonts.body, fontSize: 18, lineHeight: 22, color: colors.font },
  action: { fontFamily: fonts.action, fontSize: 18, color: colors.font },
  description: { fontFamily: fonts.bookish, fontSize: 18, color: colors.description },
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radii = { sm: 5, md: 12, lg: 19, pill: 999 } as const;
