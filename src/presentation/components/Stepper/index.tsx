import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface StepperProps {
  /** Spoken as the progress, e.g. "Step 2 of 4: Columns" */
  accessibilityLabel: string;
  /** Four thin bars instead of the numbered steps (mobile) */
  compact?: boolean;
  /** Index of the current step; the ones before it are done */
  current: number;
  steps: StepperStep[];
  testID?: string;
}

export interface StepperStep {
  label: string;
}

const DOT = 24;
const BAR = 4;

// Numbered steps (done ones show a check) on wide layouts, one bar per step on compact ones (spec 047 FR 8).
function Stepper(props: StepperProps) {
  const { colors, radius, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    bar: {
      borderRadius: radius.full,
      flex: 1,
      height: BAR,
    },
    bars: { flexDirection: "row", gap: spacing.xs },
    dot: {
      alignItems: "center",
      borderRadius: radius.full,
      borderWidth: 1,
      height: DOT,
      justifyContent: "center",
      width: DOT,
    },
    row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
    step: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  });

  if (props.compact) {
    return (
      <View
        accessibilityLabel={props.accessibilityLabel}
        accessibilityRole={"progressbar"}
        accessibilityValue={{
          max: props.steps.length,
          min: 1,
          now: props.current + 1,
        }}
        style={styles.bars}
        testID={props.testID}
      >
        {props.steps.map((step, index) => (
          <View
            key={step.label}
            style={[
              styles.bar,
              {
                backgroundColor:
                  index <= props.current ? colors.accent : colors.border,
              },
            ]}
            testID={props.testID && `${props.testID}-step-${index}`}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      style={styles.row}
      testID={props.testID}
    >
      {props.steps.map((step, index) => {
        const done = index < props.current;
        const active = index === props.current;

        return (
          <View
            accessibilityState={{ selected: active }}
            key={step.label}
            style={styles.step}
            testID={props.testID && `${props.testID}-step-${index}`}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderColor: active || done ? colors.accent : colors.border,
                },
              ]}
            >
              {done ? (
                <Icon color={colors.accent} name={"check"} size={14} />
              ) : (
                <Text.Caption
                  tone={active ? "primary" : "secondary"}
                  value={String(index + 1)}
                />
              )}
            </View>
            {active ? (
              <Text.BodyStrong value={step.label} />
            ) : (
              <Text.Body tone={"secondary"} value={step.label} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export default Stepper;
