export enum TextMode {
  Body = "bodyMedium",
  Caption = "labelSmall",
  Display = "displayMedium",
  Headline = "headlineMedium",
  Label = "labelMedium",
  Title = "titleMedium",
}

export interface TextProps {
  bold?: boolean;
  color?: string;
  numberOfLines?: number;
  testID?: string;
  textAlign?: "center" | "left" | "right";
  value: string;
}
