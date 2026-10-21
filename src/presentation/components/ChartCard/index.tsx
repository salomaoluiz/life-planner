import { StyleSheet, View } from "react-native";

import ErrorState from "@components/ErrorState";
import Skeleton from "@components/Skeleton";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ChartCardProps {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /** Shown when `state` is `empty` */
  emptyText?: string;
  errorText: string;
  footnote?: string;
  legend?: ChartLegendItem[];
  onRetry: () => void;
  retryLabel: string;
  state: "empty" | "error" | "loading" | "ready";
  subtitle?: string;
  testID?: string;
  title: string;
}

export interface ChartLegendItem {
  /** Drawn dashed for projected values */
  dashed?: boolean;
  label: string;
  tone: "accent" | "expense" | "income";
}

// The frame of a dashboard block: title, actions, legend, footnote and the loading / error / empty states (spec 046 FR 19).
function ChartCard(props: ChartCardProps) {
  const { colors, radius, spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    actions: { flexShrink: 0 },
    body: { minHeight: 120 },
    header: {
      alignItems: "center",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      justifyContent: "space-between",
    },
    legend: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    legendItem: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.xxs,
    },
    root: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      borderWidth: 1,
      gap: spacing.sm,
      padding: spacing.md,
    },
    swatch: { borderRadius: 3, height: 10, width: 10 },
    titles: { flex: 1, gap: spacing.xxs, minWidth: 160 },
  });

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text.Heading accessibilityRole="header" value={props.title} />
          {props.subtitle ? (
            <Text.Caption tone="secondary" value={props.subtitle} />
          ) : null}
        </View>
        {props.actions ? (
          <View style={styles.actions}>{props.actions}</View>
        ) : null}
      </View>
      {props.legend && props.state === "ready" ? (
        <View style={styles.legend} testID={testID && `${testID}-legend`}>
          {props.legend.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[
                  styles.swatch,
                  item.dashed
                    ? { borderColor: colors[item.tone], borderWidth: 1 }
                    : { backgroundColor: colors[item.tone] },
                ]}
              />
              <Text.Caption tone="secondary" value={item.label} />
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.body}>
        {props.state === "loading" ? (
          <Skeleton.Box height={160} width="100%" />
        ) : null}
        {props.state === "error" ? (
          <ErrorState
            message={props.errorText}
            onRetry={props.onRetry}
            retryLabel={props.retryLabel}
            testID={testID && `${testID}-error`}
          />
        ) : null}
        {props.state === "empty" ? (
          <Text.Body
            align="center"
            testID={testID && `${testID}-empty`}
            tone="secondary"
            value={props.emptyText ?? ""}
          />
        ) : null}
        {props.state === "ready" ? props.children : null}
      </View>
      {props.footnote && props.state === "ready" ? (
        <Text.Caption
          testID={testID && `${testID}-footnote`}
          tone="secondary"
          value={props.footnote}
        />
      ) : null}
    </View>
  );
}

export default ChartCard;
