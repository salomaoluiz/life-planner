export enum TextMode {
  Body = "body",
  BodyStrong = "bodyStrong",
  Caption = "caption",
  Display = "display",
  Heading = "heading",
  Overline = "overline",
  Tab = "tab",
  Title = "title",
}

export interface TextProps {
  accessibilityLiveRegion?: "assertive" | "none" | "polite";
  align?: "center" | "left" | "right";
  /** Legacy, kept until spec 014: use Text.BodyStrong */
  bold?: boolean;
  /** Legacy for screens, kept until spec 014: use `tone`. Kit internals may pass token colors. */
  color?: string;
  numberOfLines?: number;
  tabular?: boolean;
  testID?: string;
  /** Legacy, kept until spec 014: use `align` */
  textAlign?: "center" | "left" | "right";
  tone?: TextTone;
  value: string;
}

export type TextTone =
  | "accent"
  | "expense"
  | "income"
  | "primary"
  | "secondary"
  | "warning";
