export const colors = {
  // Primary: Rich Dark Terracotta Teak Wood
  primary: '#8D4E22', // Terracotta Teak Wood
  primaryDark: '#6E3812', // Deep Dark Teak
  primaryLight: '#AF7540',
  primarySurface: '#DFCEB9', // Proper rich warm earthy brown tint (100% genuine brown, zero pink)
  primaryBorder: '#8D4E22', // Teak border

  // Secondary: Lush Forest Moss Green
  secondary: '#5E8256',
  secondaryDark: '#3E5F36',
  secondarySurface: '#E6EFE4',
  secondaryBorder: '#C1D6BD',

  // Accent: Warm Teak Amber & Dark Wooden Tint
  accent: '#DEAB7C',
  accentLight: '#B6814C', // Deep dark teak wooden accent
  accentDark: '#8D4E22',
  accentBorder: '#8D4E22',

  // Canvas & Surfaces
  background: '#F8F9F5',
  backgroundLight: '#F8F9F5',
  cardBg: '#FFFFFF',
  cardBgLight: '#FFFFFF',
  cardBgWood: '#542B0E',
  cardBgTerracotta: '#8D4E22',
  cardBgPeach: '#DFCEB9',
  cardBgLightGreen: '#E6EFE4',

  // Typography & Text
  textPrimary: '#18221B',
  textSecondary: '#4A5B50',
  textMuted: '#738679',
  textLight: '#99ABA0',
  textOnPrimary: '#FFFFFF',
  textOnPeach: '#2B1405',

  // Semantic & Feedback Colors (Dark Teak Wooden - Zero Pink)
  success: '#5E8256',
  successLight: '#E6EFE4',
  successBorder: '#C1D6BD',
  warning: '#D97706',
  warningLight: '#D4AB7D',
  warningBorder: '#8D4E22',
  error: '#6E3812',
  errorLight: '#C49563',
  errorBorder: '#8D4E22',
  info: '#5E8256',

  // Borders & Outlines
  borderLight: '#CBD8C7',
  borderSubtle: '#8D4E22',
  borderDark: '#6E3812',
  borderActive: '#8D4E22',
}

export const typography = {
  // Font Sizes
  sizes: {
    hero: 32,
    title1: 24,
    title2: 20,
    title3: 17,
    bodyLarge: 16,
    body: 14,
    bodySmall: 13,
    caption: 12,
    micro: 11,
    tiny: 10,
  },

  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
    black: '900' as const,
  },

  // Typography Presets (Directly reusable in styles)
  displayHero: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  titleSmall: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  bodyRegular: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textMuted,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.textOnPrimary,
    letterSpacing: 0.2,
  },
  buttonTextSmall: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textOnPrimary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.primaryDark,
  },
}

export const shadows = {
  // Tactile Soft Nature Shadows matching Reference Image
  sm: {
    shadowColor: '#364738',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#364738',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#253527',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  clayCard: {
    shadowColor: '#364738',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  clayCardFloating: {
    shadowColor: '#253527',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  clayPill: {
    shadowColor: '#455848',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  clayButton: {
    shadowColor: '#8C4D20',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  clayButtonWood: {
    shadowColor: '#8C4D20',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },
  clayButtonGreen: {
    shadowColor: '#2B4226',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
  },
  clayButtonAccent: {
    shadowColor: '#8C5228',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
}

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  huge: 36,
  pill: 999,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const theme = {
  colors,
  typography,
  shadows,
  radii,
  spacing,
}

export default theme
