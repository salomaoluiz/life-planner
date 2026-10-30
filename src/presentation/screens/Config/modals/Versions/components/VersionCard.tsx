import { View } from "react-native";

import { Button, Text } from "@components";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

import { CardModel } from "../hooks/useVersionsViewModel";
import versionsTestIds from "../testIds";

interface Props {
  card: CardModel;
  onAction: () => void;
  onWhatChanged: () => void;
}

// One service (app or API): label, big version, status, facts and its actions (spec 056).
function VersionCard({ card, onAction, onWhatChanged }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { colors } = theme;
  const { spacing } = theme.sizes;
  const statusColor = {
    accent: colors.accent,
    expense: colors.expense,
    income: colors.income,
    neutral: colors.textSecondary,
    warning: colors.warning,
  }[card.tone];
  const testID =
    card.service === "api" ? versionsTestIds.apiCard : versionsTestIds.appCard;

  return (
    <View
      style={{
        backgroundColor: colors.surfaceRaised,
        borderRadius: theme.sizes.borderRadius.lg,
        flex: 1,
        gap: spacing.md,
        padding: spacing.lg,
      }}
      testID={testID}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text.Overline tone="secondary" value={t(card.label)} />
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: spacing.xs,
          }}
        >
          <View
            style={{
              backgroundColor: statusColor,
              borderRadius: 4,
              height: 8,
              width: 8,
            }}
          />
          <Text.Caption
            testID={`${testID}.status`}
            tone={card.tone === "neutral" ? "secondary" : card.tone}
            value={t(card.statusKey)}
          />
        </View>
      </View>
      <Text.Display testID={`${testID}.version`} value={card.version} />
      <View style={{ gap: spacing.xs }}>
        {card.fields.map((field) => (
          <View
            key={field.key}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text.Caption tone="secondary" value={t(field.key)} />
            <Text.Caption
              tone={field.highlight ? "warning" : "primary"}
              value={field.value}
            />
          </View>
        ))}
      </View>
      {card.hint ? (
        <Text.Caption
          tone="secondary"
          value={t(card.hint.key, { version: card.hint.version })}
        />
      ) : null}
      {card.action ? (
        <Button.Primary
          fullWidth
          label={
            card.action.kind === "reload"
              ? t("versions.action.reload")
              : t("versions.action.viewRelease", {
                  version: card.action.version,
                })
          }
          onPress={onAction}
          testID={`${versionsTestIds.primaryAction}.${card.service}`}
        />
      ) : null}
      {card.whatChanged ? (
        <Button.Secondary
          fullWidth
          label={t("versions.action.whatChanged")}
          onPress={onWhatChanged}
          testID={`${versionsTestIds.whatChangedButton}.${card.service}`}
        />
      ) : null}
    </View>
  );
}

export default VersionCard;
