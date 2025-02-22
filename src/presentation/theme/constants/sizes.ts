import {
  getScaleFunctions,
  rescaleSizes,
} from "@presentation/theme/constants/utils/sizes";

const spacing = {
  /** 4dp - Tiny gaps (icon spacing, small dividers) */
  xsmall: 4,
  /** 8dp - Padding inside buttons, small margins */
  small: 8,
  /** 16dp - General spacing for content and sections */
  medium: 16,
  /** 24dp - Section spacing, card padding */
  large: 24,
  /** 32dp - Large gaps between sections */
  xlarge: 32,
  /** 48dp - Major section spacing, modal paddings */
  xxlarge: 48,
  /** 64dp+ - Full-screen margins, hero sections */
  xxxlarge: 64,
};

const fontSizes = {
  /** 12px - Captions, secondary info, tooltips */
  xsmall: 12,
  /** 14px - Body text on mobile, labels, inputs */
  small: 14,
  /** 16px - Primary body text (best for readability) */
  medium: 16,
  /** 20px - Subtitles, secondary headers */
  large: 24,
  /** 24px - Section titles, call-to-actions */
  xlarge: 32,
  /** 48px - Page headers, hero sections */
  xxlarge: 48,
};

const lineHeights = {
  /** 16px - Captions, labels */
  xsmall: 16,
  /** 20px - Small body text */
  small: 20,
  /** 24px - Default body text */
  medium: 24,
  /** 32px - Subtitles */
  large: 32,
  /** 48px - Section titles */
  xlarge: 48,
  /** 64px - Large headings */
  xxlarge: 64,
};

const borderRadius = {
  /** 4dp - Small elements (buttons, input fields, checkboxes) */
  small: 4,
  /** 8dp - Standard rounded corners (cards, modals, list items) */
  medium: 8,
  /** 16dp - Softer UI elements (large buttons, notification banners) */
  large: 16,
  /** 32dp - Highly rounded elements (profile pictures, badges) */
  xlarge: 32,
  /** 50% - Full circle (avatars, circular buttons) */
  full: "50%",
};

export const defaultSizes = {
  spacing,
  fontSizes,
  lineHeights,
  borderRadius,
};

interface ScaledSizes {
  spacing: typeof spacing;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  borderRadius: typeof borderRadius;
}

function getScaledSizes(): ScaledSizes {
  const { scaleSpacing, scaleBorder, scaleFontSize } = getScaleFunctions();

  return {
    spacing: rescaleSizes(defaultSizes.spacing, scaleSpacing),
    fontSizes: rescaleSizes(defaultSizes.fontSizes, scaleFontSize),
    lineHeights: rescaleSizes(defaultSizes.lineHeights, scaleFontSize),
    borderRadius: rescaleSizes(defaultSizes.borderRadius, scaleBorder),
  };
}

export default getScaledSizes;
export type Sizes = ReturnType<typeof getScaledSizes>;
