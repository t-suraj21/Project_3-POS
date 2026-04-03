/**
 * SuperAdmin Design System
 * Modern, professional theme with consistent styling across all admin pages
 */

export const colors = {
  // Primary palette
  primary: "#4f46e5",      // Indigo
  primaryHover: "#4338ca",
  primaryLight: "#eef2ff",
  
  // Secondary palette
  secondary: "#06b6d4",    // Cyan
  secondaryHover: "#0891b2",
  secondaryLight: "#ecf9ff",
  
  // Success
  success: "#10b981",      // Emerald
  successHover: "#059669",
  successLight: "#ecfdf5",
  
  // Warning
  warning: "#f59e0b",      // Amber
  warningHover: "#d97706",
  warningLight: "#fffbeb",
  
  // Danger
  danger: "#ef4444",       // Red
  dangerHover: "#dc2626",
  dangerLight: "#fee2e2",
  
  // Neutral
  neutral900: "#111827",
  neutral800: "#1f2937",
  neutral700: "#374151",
  neutral600: "#4b5563",
  neutral500: "#6b7280",
  neutral400: "#9ca3af",
  neutral300: "#d1d5db",
  neutral200: "#e5e7eb",
  neutral100: "#f3f4f6",
  neutral50: "#f9fafb",
  white: "#ffffff",
  
  // Gradients
  gradientBlue: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  gradientGreen: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  gradientPurple: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  gradientOrange: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
};

export const spacing = {
  xs: "0.25rem",    // 4px
  sm: "0.5rem",     // 8px
  md: "1rem",       // 16px
  lg: "1.5rem",     // 24px
  xl: "2rem",       // 32px
  xxl: "3rem",      // 48px
  xxxl: "4rem",     // 64px
};

export const typography = {
  h1: {
    fontSize: "2.25rem",   // 36px
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "1.875rem",  // 30px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontSize: "1.5rem",    // 24px
    fontWeight: 700,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: "1.25rem",   // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontSize: "1rem",      // 16px
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: "0.875rem",  // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodyXSmall: {
    fontSize: "0.75rem",   // 12px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  label: {
    fontSize: "0.875rem",  // 14px
    fontWeight: 600,
    lineHeight: 1.5,
  },
};

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  xxl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

export const borderRadius = {
  none: "0",
  sm: "0.375rem",    // 6px
  md: "0.5rem",      // 8px
  lg: "0.75rem",     // 12px
  xl: "1rem",        // 16px
  full: "9999px",
};

export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
};

// Common component styles
export const componentStyles = {
  card: {
    background: colors.white,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.md,
    padding: spacing.lg,
    transition: `all ${transitions.base}`,
    "&:hover": {
      boxShadow: shadows.lg,
    },
  },
  
  button: {
    base: {
      padding: `${spacing.sm} ${spacing.lg}`,
      borderRadius: borderRadius.md,
      border: "none",
      fontWeight: 600,
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: `all ${transitions.base}`,
      display: "inline-flex",
      alignItems: "center",
      gap: spacing.sm,
      "&:disabled": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    },
    primary: {
      background: colors.primary,
      color: colors.white,
      "&:hover": {
        background: colors.primaryHover,
      },
    },
    secondary: {
      background: colors.neutral100,
      color: colors.primary,
      "&:hover": {
        background: colors.neutral200,
      },
    },
    danger: {
      background: colors.danger,
      color: colors.white,
      "&:hover": {
        background: colors.dangerHover,
      },
    },
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.full,
    fontSize: typography.bodyXSmall.fontSize,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  input: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.neutral300}`,
    fontSize: typography.body.fontSize,
    fontFamily: "inherit",
    transition: `all ${transitions.base}`,
    "&:focus": {
      outline: "none",
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primaryLight}`,
    },
  },
};

// Responsive breakpoints
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

// Generate responsive style helper
export const media = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  xxl: `@media (min-width: ${breakpoints.xxl}px)`,
};
