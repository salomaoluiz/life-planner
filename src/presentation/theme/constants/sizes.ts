import {
  getScaleFunctions,
  rescaleSizes,
} from "@presentation/theme/constants/utils/sizes";

const spacing = {
  /** 24dp - Section spacing, card padding */
  large: 24,
  /** 16dp - General spacing for content and sections */
  medium: 16,
  /** 12dp - Padding inside buttons, small margins */
  small: 12,
  /** 32dp - Large gaps between sections */
  xlarge: 32,
  /** 8dp - Tiny gaps (icon spacing, small dividers) */
  xsmall: 8,
  /** 48dp - Major section spacing, modal paddings */
  xxlarge: 48,
  /** 4dp - Tiny gaps (icon spacing, small dividers) */
  xxsmall: 4,
  /** 64dp+ - Full-screen margins, hero sections */
  xxxlarge: 64,
};

const fontSizes = {
  /** 20px - Subtitles, secondary headers */
  large: 24,
  /** 16px - Primary body text (best for readability) */
  medium: 16,
  /** 14px - Body text on mobile, labels, inputs */
  small: 14,
  /** 24px - Section titles, call-to-actions */
  xlarge: 32,
  /** 12px - Captions, secondary info, tooltips */
  xsmall: 12,
  /** 48px - Page headers, hero sections */
  xxlarge: 48,
  /** 10px - Captions, secondary info, tooltips */
  xxsmall: 10,
};

const lineHeights = {
  /** 32px - Subtitles */
  large: 32,
  /** 24px - Default body text */
  medium: 24,
  /** 20px - Small body text */
  small: 20,
  /** 48px - Section titles */
  xlarge: 48,
  /** 16px - Captions, labels */
  xsmall: 16,
  /** 64px - Large headings */
  xxlarge: 64,
  /** 14px - Captions, labels */
  xxsmall: 14,
};

const borderRadius = {
  /** 50% - Full circle (avatars, circular buttons) */
  full: "50%",
  /** 16dp - Softer UI elements (large buttons, notification banners) */
  large: 16,
  /** 8dp - Standard rounded corners (cards, modals, list items) */
  medium: 8,
  /** 4dp - Small elements (buttons, input fields, checkboxes) */
  small: 4,
  /** 32dp - Highly rounded elements (profile pictures, badges) */
  xlarge: 32,
};

export const defaultSizes = {
  borderRadius,
  fontSizes,
  lineHeights,
  spacing,
};

export type Sizes = ReturnType<typeof getScaledSizes>;

interface ScaledSizes {
  borderRadius: typeof borderRadius;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  spacing: typeof spacing;
}

export default getScaledSizes;
function getScaledSizes(): ScaledSizes {
  const { scaleBorder, scaleFontSize, scaleSpacing } = getScaleFunctions();

  return {
    borderRadius: rescaleSizes(defaultSizes.borderRadius, scaleBorder),
    fontSizes: rescaleSizes(defaultSizes.fontSizes, scaleFontSize),
    lineHeights: rescaleSizes(defaultSizes.lineHeights, scaleFontSize),
    spacing: rescaleSizes(defaultSizes.spacing, scaleSpacing),
  };
}
