import { View } from "react-native";

import { Button, Checkbox, IconTile, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import {
  CatalogSuggestion,
  selectedKeys,
} from "@presentation/constants/stockCatalogAppearance";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import stockCatalogTestIds from "@screens/Stock/Catalog/testIds";

interface Props {
  busy: boolean;
  kind: "category" | "location";
  onCreate: (keys: string[]) => void;
  onFromScratch: () => void;
  onToggle: (key: string) => void;
  ownerName: string;
  readOnly: boolean;
  suggestions: CatalogSuggestion[];
  unchecked: string[];
}

// Spec 125 FR 24: an owner with no rows in the tab: the suggestions with color and icon, all checked.
function CatalogEmptyOwner(props: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const keys = selectedKeys(props.suggestions, props.unchecked);
  const title = t(
    props.kind === "category"
      ? "stock.catalog.empty.categories"
      : "stock.catalog.empty.locations",
    { owner: props.ownerName },
  );

  return (
    <View
      style={{ gap: spacing.md, padding: spacing.md }}
      testID={`${stockCatalogTestIds.empty}.${props.ownerName}`}
    >
      <Text.BodyStrong value={title} />
      <Text.Caption tone={"secondary"} value={t("stock.catalog.empty.hint")} />
      {props.readOnly ? null : (
        <View style={{ gap: spacing.xs }}>
          <Button.Primary
            disabled={keys.length === 0 || props.busy}
            label={t(pluralKey("stock.catalog.empty.create", keys.length), {
              count: keys.length,
            })}
            loading={props.busy}
            onPress={() => props.onCreate(keys)}
            testID={stockCatalogTestIds.createSuggestions}
          />
          <Button.Ghost
            label={t("stock.catalog.empty.fromScratch")}
            onPress={props.onFromScratch}
            testID={stockCatalogTestIds.fromScratch}
          />
        </View>
      )}
      <View style={{ gap: spacing.xxs }}>
        {props.suggestions.map((suggestion) => (
          <View
            key={suggestion.key}
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: spacing.sm,
            }}
          >
            <IconTile
              color={suggestion.color}
              name={suggestion.icon}
              size={"sm"}
            />
            <View style={{ flex: 1 }}>
              <Checkbox
                checked={!props.unchecked.includes(suggestion.key)}
                label={t(suggestion.nameKey)}
                onChange={() => props.onToggle(suggestion.key)}
                testID={`${stockCatalogTestIds.suggestion}.${suggestion.key}`}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default CatalogEmptyOwner;
