import { View } from "react-native";

import {
  AmountInput,
  AutocompleteField,
  Button,
  Card,
  CategoryTreeField,
  SegmentedControl,
  Text,
  TextField,
  TreeNode,
  useTreePickerLabels,
} from "@components";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import { useTheme } from "@presentation/theme";
import {
  SplitFormErrors,
  SplitPartDraft,
} from "@screens/Financial/Transactions/modals/SplitForm/models/splitFormState";
import splitFormTestIds from "@screens/Financial/Transactions/modals/SplitForm/testIds";

const MAX_TAGS = 10;
const MAX_TAG_NAME = 30;

interface Props {
  canAddPart: boolean;
  categoryNodes: (
    type: "EXPENSE" | "INCOME",
    selectedId?: string,
  ) => TreeNode[];
  currency: CurrencyCode;
  errors: SplitFormErrors;
  isCard: boolean;
  onAdd: () => void;
  onAdjustmentKindChange: (key: string, discount: boolean) => void;
  onCategoryChange: (key: string, categoryId: string) => void;
  onDescriptionChange: (key: string, description: string) => void;
  onRemove: (key: string) => void;
  onTagsChange: (key: string, values: string[]) => void;
  onTypeChange: (key: string, type: "EXPENSE" | "INCOME") => void;
  onValueChange: (key: string, cents: number) => void;
  parts: SplitPartDraft[];
  tagSuggestions: { id: string; label: string; meta?: string }[];
}

// The parts of the split (spec 119 FR 41): category, optional own description, tags and value each. On an account every
// part has its own Receita/Despesa toggle; the "Desconto/ajuste" part has Desconto/Acréscimo instead.
function SplitPartsEditor(props: Props) {
  const { t } = useTranslation();
  const categoryLabels = useTreePickerLabels("category");
  const { theme } = useTheme();

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  return (
    <View style={{ gap: theme.sizes.spacing.md }}>
      {props.parts.map((part, index) => (
        <Card key={part.key} padding="md" testID={splitFormTestIds.partRow}>
          <View style={{ gap: theme.sizes.spacing.sm }}>
            <Text.BodyStrong
              value={
                part.adjustment
                  ? t("financial.split.adjustment")
                  : `${index + 1}`
              }
            />
            {part.adjustment ? (
              <>
                <Text.Caption
                  tone="secondary"
                  value={t("financial.split.adjustmentHint")}
                />
                <SegmentedControl
                  accessibilityLabel={t("financial.split.adjustment")}
                  onChange={(value) =>
                    props.onAdjustmentKindChange(part.key, value === "DISCOUNT")
                  }
                  options={[
                    {
                      label: t("financial.split.adjustmentDiscount"),
                      tone: "income",
                      value: "DISCOUNT",
                    },
                    {
                      label: t("financial.split.adjustmentExtra"),
                      tone: "expense",
                      value: "EXTRA",
                    },
                  ]}
                  testID={splitFormTestIds.partAdjustmentKind}
                  value={part.cents < 0 ? "DISCOUNT" : "EXTRA"}
                />
              </>
            ) : (
              <>
                {props.isCard ? null : (
                  <SegmentedControl
                    accessibilityLabel={t("financial.categories.type")}
                    onChange={(value) =>
                      props.onTypeChange(
                        part.key,
                        value as "EXPENSE" | "INCOME",
                      )
                    }
                    options={[
                      {
                        label: t("financial.common.expense"),
                        tone: "expense",
                        value: "EXPENSE",
                      },
                      {
                        label: t("financial.common.income"),
                        tone: "income",
                        value: "INCOME",
                      },
                    ]}
                    testID={splitFormTestIds.partType}
                    value={part.type}
                  />
                )}
                <CategoryTreeField
                  archivedLabel={t("financial.accounts.archivedLabel")}
                  error={err(props.errors.partCategory?.[part.key])}
                  label={t("financial.split.form.category")}
                  labels={categoryLabels}
                  mode={"single"}
                  nodes={props.categoryNodes(part.type, part.categoryId)}
                  onChange={(id) => id && props.onCategoryChange(part.key, id)}
                  testID={splitFormTestIds.partCategory}
                  value={part.categoryId}
                />
              </>
            )}
            <AmountInput
              currency={props.currency}
              error={err(props.errors.partValue?.[part.key])}
              label={t("financial.split.form.partValue")}
              onChange={(cents) => props.onValueChange(part.key, cents)}
              testID={splitFormTestIds.partValue}
              tone={part.type === "INCOME" ? "income" : "expense"}
              value={Math.abs(part.cents)}
            />
            {part.adjustment ? null : (
              <>
                <TextField
                  label={t("financial.split.form.partDescription")}
                  maxLength={200}
                  onChangeText={(text) =>
                    props.onDescriptionChange(part.key, text)
                  }
                  testID={splitFormTestIds.partDescription}
                  value={part.description}
                />
                <AutocompleteField
                  allowCreate
                  createLabel={(name) =>
                    t("financial.transactions.form.tagsCreate", { name })
                  }
                  label={t("financial.split.form.partTags")}
                  maxLabel={t("financial.transactions.form.tagsMax")}
                  maxLength={MAX_TAG_NAME}
                  maxValues={MAX_TAGS}
                  mode={"chips"}
                  onChange={(values) => props.onTagsChange(part.key, values)}
                  placeholder={t("financial.transactions.form.tagsPlaceholder")}
                  removeLabel={(label) =>
                    t("common.autocompleteField.remove", { label })
                  }
                  resultsLabel={(count) =>
                    t(pluralKey("common.autocompleteField.results", count), {
                      count,
                    })
                  }
                  suggestions={props.tagSuggestions}
                  testID={splitFormTestIds.partTags}
                  tooLongLabel={t("financial.transactions.form.tagsTooLong")}
                  values={part.tags}
                />
              </>
            )}
            <Button.Ghost
              label={t("financial.split.form.removePart")}
              onPress={() => props.onRemove(part.key)}
              testID={splitFormTestIds.partRemove}
              tone="expense"
            />
          </View>
        </Card>
      ))}
      {props.errors.parts ? (
        <Text.Caption tone="expense" value={t(props.errors.parts)} />
      ) : null}
      <Button.Secondary
        disabled={!props.canAddPart}
        fullWidth
        label={t("financial.split.addPart")}
        onPress={props.onAdd}
        testID={splitFormTestIds.addPart}
      />
    </View>
  );
}

export default SplitPartsEditor;
