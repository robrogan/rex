/**
 * Design tokens — extracted from the Figma file's variables ("rainbow" theme)
 * and the MVP Drafts `mvp/*` component kit (file key T4qrt18lCu5elAPofAz2jm).
 * Light and dark themes are planned; keep ALL color/type usage flowing through
 * this file so a future theme picker is a token swap, not a rewrite.
 */
export const colors = {
  bg: '#4B0082', // Figma var: bg-color
  primary400: '#FFA500', // Figma var: Primary 400 (orange accent)
  primary800: '#241C47', // Figma var: Primary 800 (elevated surface / inputs)
  font: '#EE82EE', // Figma var: font (violet text)
  fontOnPrimary: '#F6F5F5', // Figma var: font on primary
  description: '#F5C4DE', // Figma var: description (pink long-form text)
  cardOutline: 'rgba(238, 130, 238, 0.45)', // translucent violet (font @ ~45%) — matches the MVP drafts
  coverPlaceholder: '#47286A', // book-cover fallback (approx. the mvp/Book Thumb #241C47→#6B338C gradient)
  success: '#00FF00', // placeholder — not from the Figma variable set
  info: '#0000FF', // placeholder — not from the Figma variable set
} as const;

export const fonts = {
  /** Display serif — Crimson Pro Light (Figma "Title" 60/60; also card titles at 22/24) */
  title: 'CrimsonPro_300Light',
  /** Body — Manrope Medium (Figma "body" 18/22) */
  body: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
  /** Actions/tags/tabs — Pixelify Sans (Figma "action" 18) */
  action: 'PixelifySans_400Regular',
  /** Long descriptions — Goudy Bookletter 1911 (Figma "description" 16/24) */
  bookish: 'GoudyBookletter1911_400Regular',
} as const;

export const type = {
  title: { fontFamily: fonts.title, fontSize: 60, lineHeight: 60, letterSpacing: -1.8, color: colors.font },
  heading: { fontFamily: fonts.title, fontSize: 34, lineHeight: 38, letterSpacing: -1, color: colors.font },
  /** Book/card titles — Crimson Pro Light 22/24 in orange (Figma card + S4 row) */
  cardTitle: { fontFamily: fonts.title, fontSize: 22, lineHeight: 24, color: colors.primary400 },
  body: { fontFamily: fonts.body, fontSize: 18, lineHeight: 22, color: colors.font },
  /** Author line — Manrope Medium 15/19 (Figma S4 row) */
  author: { fontFamily: fonts.body, fontSize: 15, lineHeight: 19, color: colors.font },
  /** Secondary meta (edition/format) — Goudy 14/18 (Figma S4 row) */
  meta: { fontFamily: fonts.bookish, fontSize: 14, lineHeight: 18, color: colors.description },
  action: { fontFamily: fonts.action, fontSize: 18, color: colors.font },
  description: { fontFamily: fonts.bookish, fontSize: 16, lineHeight: 24, color: colors.description },
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/** Corner radii from the mvp/* kit: card 8 (2 on the spine corner), input 12, button 16, pill 20. */
export const radii = { xs: 2, sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;
