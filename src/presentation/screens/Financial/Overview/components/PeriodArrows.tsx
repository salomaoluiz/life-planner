import { View } from "react-native";

import { Button, Text, Tooltip } from "@components";
import { IconButton } from "@components/Icon";
import { useTranslation } from "@presentation/i18n";

import useStyles from "../styles";
import overviewTestIds from "../testIds";

interface PeriodArrowsTestIds {
  limitHint: string;
  next: string;
  previous: string;
  range: string;
  today: string;
}

interface Props {
  canGoNext: boolean;
  compact: boolean;
  // Replaces the finance "latest end" hint (spec 110: investments have no future at all)
  hint?: string;
  // The formatted last day the period may reach, shown in the limit hint
  limitDate: string;
  onBackToToday: () => void;
  onNext: () => void;
  onPrevious: () => void;
  rangeLabel: string;
  showToday: boolean;
  // Another module's ids (default: the finance Overview's)
  testIDs?: PeriodArrowsTestIds;
}

// Spec 055 FR 15-17: previous / next arrows around the range, and a Today button while the period is moved.
function PeriodArrows(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const ids: PeriodArrowsTestIds = props.testIDs ?? {
    limitHint: overviewTestIds.periodLimitHint,
    next: overviewTestIds.periodNext,
    previous: overviewTestIds.periodPrevious,
    range: overviewTestIds.periodRange,
    today: overviewTestIds.periodToday,
  };
  const hint =
    props.hint ??
    t("financial.overview.period.limitHint", { date: props.limitDate });
  const next = (
    <IconButton
      accessibilityLabel={t("financial.overview.period.next")}
      disabled={!props.canGoNext}
      name="chevron-right"
      onPress={props.onNext}
      testID={ids.next}
    />
  );

  return (
    <View style={props.compact ? styles.arrowsCompact : undefined}>
      <View style={styles.arrows}>
        <IconButton
          accessibilityLabel={t("financial.overview.period.previous")}
          name="chevron-left"
          onPress={props.onPrevious}
          testID={ids.previous}
        />
        <View style={props.compact ? styles.rangeCompact : styles.range}>
          <Text.BodyStrong
            align="center"
            testID={ids.range}
            value={props.rangeLabel}
          />
        </View>
        {props.compact || props.canGoNext ? (
          next
        ) : (
          <Tooltip
            content={<Text.Caption value={hint} />}
            testID={ids.limitHint}
          >
            {next}
          </Tooltip>
        )}
        {props.showToday ? (
          <Button.Secondary
            label={t("financial.overview.period.today")}
            onPress={props.onBackToToday}
            testID={ids.today}
          />
        ) : null}
      </View>
      {props.compact && !props.canGoNext ? (
        <Text.Caption
          align="center"
          testID={ids.limitHint}
          tone="secondary"
          value={hint}
        />
      ) : null}
    </View>
  );
}

export default PeriodArrows;
