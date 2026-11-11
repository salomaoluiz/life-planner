import { View } from "react-native";

import { Badge, Button, Card, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import investmentTestIds from "@screens/Investment/testIds";

interface Props {
  count: number;
  onPress: () => void;
}

// Spec 107: the entry point of the suggestions inbox, with the number of announced incomes waiting.
function SuggestionsCard({ count, onPress }: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();

  return (
    <Card testID={investmentTestIds.list.suggestionsCard}>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: spacing.sm,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: spacing.sm,
          }}
        >
          <Text.BodyStrong value={t("investment.suggestions.card")} />
          {count > 0 ? <Badge label={String(count)} tone="accent" /> : null}
        </View>
        <Button.Secondary
          label={t("investment.suggestions.title")}
          onPress={onPress}
        />
      </View>
    </Card>
  );
}

export default SuggestionsCard;
