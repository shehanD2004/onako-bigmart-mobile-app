// Bigmart Design Tokens — matches web app's TailwindCSS theme
export const COLORS = {
  // Brand
  freshblue: '#2563EB',
  freshblueDark: '#1D4ED8',
  freshblueLight: '#DBEAFE',
  electric: '#2563EB',

  // Status
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  // Neutrals
  white: '#FFFFFF',
  background: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#D1D5DB',
  textInverse: '#FFFFFF',

  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
};

export const FONTS = {
  h1: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  h2: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  body: { fontSize: 14, fontWeight: '400', color: COLORS.textPrimary },
  bodyBold: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  caption: { fontSize: 12, fontWeight: '400', color: COLORS.textSecondary },
  captionBold: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  small: { fontSize: 10, fontWeight: '400', color: COLORS.textMuted },
  price: { fontSize: 16, fontWeight: '700', color: COLORS.freshblue },
  priceSmall: { fontSize: 12, fontWeight: '600', color: COLORS.freshblue },
  priceLarge: { fontSize: 28, fontWeight: '800', color: COLORS.freshblue },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};
