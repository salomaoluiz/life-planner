import { Text as RNText } from "react-native";

import { useTextStyle } from "@components/Text/styles";
import { TextMode } from "@components/Text/types";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag } from "@presentation/i18n";

import { AmountType, formatAmount } from "./formatAmount";

export interface AmountTextProps {
  currency: CurrencyCode;
  size?: "body" | "caption" | "display" | "heading";
  testID?: string;
  tone?: "expense" | "income" | "primary" | "secondary";
  type?: AmountType;
  value: number;
}

const modes = {
  body: TextMode.BodyStrong,
  caption: TextMode.Caption,
  display: TextMode.Display,
  heading: TextMode.Heading,
};

function AmountText(props: AmountTextProps) {
  const localeTag = useLocaleTag();
  const style = useTextStyle(modes[props.size ?? "body"], {
    tabular: true,
    tone:
      props.tone ??
      getTypeTone(props.type) ??
      (props.size === "caption" ? "secondary" : "primary"),
    value: "",
  });

  return (
    <RNText numberOfLines={1} style={style} testID={props.testID}>
      {formatAmount(props.value, localeTag, props.currency, props.type)}
    </RNText>
  );
}

function getTypeTone(type?: AmountType) {
  if (type === "INCOME") {
    return "income";
  }

  return type === "EXPENSE" ? "expense" : undefined;
}

export default AmountText;
