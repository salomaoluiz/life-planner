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
  /** 34px - Subtitles (was 32, now 1.42× of 24px font) */
  large: 34,
  /** 24px - Default body text (1.5× of 16px) */
  medium: 24,
  /** 20px - Small body text (1.43× of 14px) */
  small: 20,
  /** 48px - Section titles */
  xlarge: 48,
  /** 18px - Labels (was 16, now 1.5× of 12px) */
  xsmall: 18,
  /** 64px - Large headings */
  xxlarge: 64,
  /** 16px - Captions (was 14, now 1.6× of 10px) */
  xxsmall: 16,
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
