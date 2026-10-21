import { View } from "react-native";

import { CARD_CREDIT_CATEGORIES } from "@application/csvImport/cardCredits";
import {
  AmountInput,
  Button,
  ChipGroup,
  Divider,
  FormColumns,
  SegmentedControl,
  SelectField,
  Text,
  TextField,
  TruncatedText,
} from "@components";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import {
  misusedRows,
  ValueEntry,
} from "@screens/Financial/Transactions/models/importValues";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "../styles";
import { ImportWizardState } from "../useImportWizardViewModel";
import useValuesStepViewModel from "./useValuesStepViewModel";

const ids = transactionsTestIds;

// Step 3 of the import wizard (artboard "Importar 3/4, mapear valores (criar categoria)").
function ValuesStep(props: { wizard: ImportWizardState }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useValuesStepViewModel(props.wizard);
  const closeLabel = t("financial.import.close");
  const tab = vm.activeTab;

  function selectOptions(entry: ValueEntry) {
    if (tab === "type") {
      return [
        { label: t("financial.import.values.type.expense"), value: "EXPENSE" },
        { label: t("financial.import.values.type.income"), value: "INCOME" },
      ];
    }

    if (tab === "owner") {
      return vm.optionsFor(entry);
    }

    if (tab === "paid") {
      return [
        { label: t("financial.import.values.paid.paid"), value: "true" },
        { label: t("financial.import.values.paid.unpaid"), value: "false" },
        {
          label: t("financial.import.values.paid.default"),
          value: "default",
        },
      ];
    }

    const create =
      vm.isCreatable && !vm.hasExactMatch(entry)
        ? [
            {
              label: t("financial.import.values.create", {
                value: entry.value,
              }),
              value: vm.create,
            },
          ]
        : [];

    // Spec 048 FR 10: the card credits and payments, only for values used by card rows, of the type of the rows.
    const credits =
      tab === "category" && (entry.cardRows ?? 0) > 0
        ? CARD_CREDIT_CATEGORIES.filter(
            (item) => !entry.type || item.type === entry.type,
          ).map((item) => ({
            description: t("financial.import.creditGroup"),
            label: t(`financial.import.values.creditNames.${item.key}`),
            value: item.id,
          }))
        : [];

    return [...create, ...credits, ...vm.optionsFor(entry)];
  }

  function entryRows() {
    if (!tab) {
      return null;
    }

    return (
      <View>
        {vm.entries.map((entry, index) => (
          <View key={entry.key}>
            <View style={styles.tableRow}>
              <View style={styles.grow}>
                <TruncatedText value={entry.value} />
                <Text.Caption
                  tone={"secondary"}
                  value={`${t("financial.import.values.rows")}: ${entry.rows}${entry.type ? ` · ${t(entry.type === "INCOME" ? "financial.import.values.type.income" : "financial.import.values.type.expense")}` : ""}${vm.multiOwner && entry.ownerId ? ` · ${t("financial.import.values.inOwner", { name: vm.ownerNames[entry.ownerId] ?? "" })}` : ""}`}
                />
              </View>
              <View style={styles.grow}>
                <SelectField
                  closeLabel={closeLabel}
                  label={t(`financial.import.values.appValue.${tab}`)}
                  onChange={(selected) => vm.onChoice(entry, selected)}
                  options={selectOptions(entry)}
                  placeholder={t("financial.import.values.choose")}
                  sheetTitle={t(`financial.import.values.appValue.${tab}`)}
                  testID={`${ids.importValue}.${tab}.${index}`}
                  value={entry.selected}
                />
                {misusedRows(entry) > 0 ? (
                  <Text.Caption
                    testID={`${ids.importValueMisused}.${index}`}
                    tone={"expense"}
                    value={t(
                      pluralKey(
                        "financial.import.categoryMisused",
                        misusedRows(entry),
                      ),
                      { count: misusedRows(entry) },
                    )}
                  />
                ) : null}
              </View>
            </View>
            <Divider />
          </View>
        ))}
      </View>
    );
  }

  function left() {
    return (
      <View style={styles.stack}>
        <ChipGroup
          layout={"wrap"}
          mode={"single"}
          onChange={vm.onTabChange}
          options={vm.tabs.map((item) => ({
            label: t(
              item.unmatched > 0
                ? "financial.import.values.tabUnmatched"
                : "financial.import.values.tabOk",
              {
                count: item.unmatched,
                label: t(`financial.import.values.tabs.${item.value}`),
              },
            ),
            value: item.value,
          }))}
          testID={ids.importValueTab}
          value={tab}
        />
        {entryRows()}
        <Text.Caption
          tone={"secondary"}
          value={t("financial.import.values.help")}
        />
      </View>
    );
  }

  function createForm() {
    const kind = vm.creating?.tab;

    if (!kind) {
      return null;
    }

    return (
      <View style={styles.stack}>
        <Text.Heading
          value={t(`financial.import.values.createForm.${kind}.title`)}
        />
        <TextField
          label={t("financial.import.values.createForm.name")}
          onChangeText={(name) => vm.onFormChange({ name })}
          testID={ids.importCreateName}
          value={vm.form.name}
        />
        {kind === "category" ? (
          <>
            <View style={styles.section}>
              <Text.Caption
                tone={"secondary"}
                value={t("financial.import.values.createForm.category.type")}
              />
              <SegmentedControl
                accessibilityLabel={t(
                  "financial.import.values.createForm.category.type",
                )}
                onChange={(type) =>
                  vm.onFormChange({
                    parentId: "",
                    type: type as "EXPENSE" | "INCOME",
                  })
                }
                options={[
                  {
                    label: t("financial.import.values.type.expense"),
                    value: "EXPENSE",
                  },
                  {
                    label: t("financial.import.values.type.income"),
                    value: "INCOME",
                  },
                ]}
                testID={ids.importCreateType}
                value={vm.form.type}
              />
              {vm.typeFromRows ? (
                <Text.Caption
                  tone={"secondary"}
                  value={t(
                    "financial.import.values.createForm.category.fromRows",
                  )}
                />
              ) : null}
            </View>
            <SelectField
              closeLabel={closeLabel}
              label={t("financial.import.values.createForm.category.parent")}
              onChange={(parentId) => vm.onFormChange({ parentId })}
              options={[
                {
                  label: t(
                    "financial.import.values.createForm.category.noParent",
                  ),
                  value: "",
                },
                ...vm.parentOptions,
              ]}
              sheetTitle={t(
                "financial.import.values.createForm.category.parent",
              )}
              testID={ids.importCreateParent}
              value={vm.form.parentId}
            />
          </>
        ) : null}
        {kind === "card" ? (
          <>
            <TextField
              keyboardType={"number-pad"}
              label={t("financial.import.values.createForm.card.closingDay")}
              onChangeText={(closingDay) => vm.onFormChange({ closingDay })}
              testID={ids.importCreateClosingDay}
              value={vm.form.closingDay}
            />
            <TextField
              keyboardType={"number-pad"}
              label={t("financial.import.values.createForm.card.dueDay")}
              onChangeText={(dueDay) => vm.onFormChange({ dueDay })}
              testID={ids.importCreateDueDay}
              value={vm.form.dueDay}
            />
            <AmountInput
              currency={"BRL"}
              label={t("financial.import.values.createForm.card.limit")}
              onChange={(limitCents) => vm.onFormChange({ limitCents })}
              testID={ids.importCreateLimit}
              value={vm.form.limitCents}
            />
          </>
        ) : null}
        <View style={styles.section}>
          <Text.Caption
            tone={"secondary"}
            value={t("financial.import.values.createForm.owner")}
          />
          <Text.Body
            value={t("financial.import.values.createForm.ownerFromFile", {
              name: vm.ownerName,
            })}
          />
        </View>
        {vm.saveFailed ? (
          <View accessibilityRole={"alert"}>
            <Text.Caption
              testID={ids.importCreateError}
              tone={"expense"}
              value={t("financial.import.values.createForm.error")}
            />
          </View>
        ) : null}
        <View style={styles.row}>
          <View style={styles.grow}>
            <Button.Secondary
              fullWidth
              label={t("financial.import.values.createForm.cancel")}
              onPress={vm.onCreateCancel}
              testID={ids.importCreateCancel}
            />
          </View>
          <View style={styles.grow}>
            <Button.Primary
              disabled={!vm.formValid}
              fullWidth
              label={t("financial.import.values.createForm.submit")}
              loading={vm.isSaving}
              onPress={vm.onCreateSubmit}
              testID={ids.importCreateSubmit}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <FormColumns
      left={left()}
      leftFlex={3}
      leftPaneTestID={ids.importLeftPane}
      right={createForm()}
      rightFlex={2}
      rightPaneTestID={ids.importRightPane}
      testID={ids.importStep}
    />
  );
}

export default ValuesStep;
