const spacing = {
  lg: 20,
  md: 16,
  sm: 12,
  xl: 24,
  xs: 8,
  xxl: 32,
  xxs: 4,
  xxxl: 48,
};

const borderRadius = { full: 999, lg: 20, md: 14, sheet: 28, sm: 10 };

const size = {
  buttonHeight: 48,
  buttonHeightSheet: 54,
  contentMaxWidth: 720,
  formMaxWidth: 480,
  iconLg: 24,
  iconMd: 20,
  iconSm: 16,
  inputHeight: 50,
  tabBarHeight: 84,
  touchTarget: 44,
};

export const defaultSizes = { borderRadius, size, spacing };

export type Sizes = typeof defaultSizes;

// Spec 007 FR 13d: the scales do not change per breakpoint. The helpers in
// utils/sizes stay available (FR 9) for callers that scale a one-off value.
function getScaledSizes(): Sizes {
  return defaultSizes;
}

export default getScaledSizes;
