import { View } from "react-native";

import AutocompleteField, {
  AutocompleteSuggestion,
} from "@components/AutocompleteField";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface TickerAutocompleteProps {
  disabled?: boolean;
  error?: string;
  helper?: string;
  label: string;
  maxLength?: number;
  onChangeText: (text: string) => void;
  /** The ticker of the option the user picked */
  onSelect: (ticker: string) => void;
  placeholder?: string;
  resultsLabel?: (count: number) => string;
  suggestions: TickerOption[];
  testID?: string;
  value: string;
}

export interface TickerOption {
  /** "B3", "NASDAQ"... shown after the name */
  exchange?: string;
  name: null | string;
  /** Last price already formatted, shown at the end of the row */
  priceText: string;
  ticker: string;
}

function matchOf(ticker: string, typed: string): [number, number] | undefined {
  const index = ticker.toLowerCase().indexOf(typed.trim().toLowerCase());

  return index < 0 ? undefined : [index, index + typed.trim().length];
}

// Ticker search of the asset form (spec 104 FR 23-24): a text field whose suggestions come from the market source.
// The caller already filtered them (the API did), the field only lists them and tells which one was picked.
function TickerAutocomplete(props: TickerAutocompleteProps) {
  const { colors, radius, spacing } = useKitTheme();
  const suggestions: AutocompleteSuggestion[] = props.suggestions.map(
    (option) => ({
      id: option.ticker,
      label: [option.ticker, option.name].filter(Boolean).join(" · "),
      leading: (
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.sm,
            height: spacing.xl,
            justifyContent: "center",
            width: spacing.xl,
          }}
        >
          <Text.Caption value={option.ticker.slice(0, 4)} />
        </View>
      ),
      matchRange: props.value ? matchOf(option.ticker, props.value) : undefined,
      meta: option.priceText,
    }),
  );

  return (
    <AutocompleteField
      disabled={props.disabled}
      error={props.error}
      helper={props.helper}
      label={props.label}
      maxLength={props.maxLength}
      maxSuggestions={10}
      mode="text"
      onChangeText={props.onChangeText}
      onSelect={(suggestion) => props.onSelect(suggestion.id)}
      placeholder={props.placeholder}
      prefiltered
      resultsLabel={props.resultsLabel}
      suggestions={suggestions}
      testID={props.testID}
      value={props.value}
    />
  );
}

export default TickerAutocomplete;
