import { View } from "react-native";

import { Divider, FormColumns, Icon, SelectField, Text } from "@components";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "../styles";
import { ImportWizardState } from "../useImportWizardViewModel";
import useColumnsStepViewModel from "./useColumnsStepViewModel";

const ids = transactionsTestIds;

// Step 2 of the import wizard (artboard "Importar 2/4, mapear colunas").
function ColumnsStep(props: { wizard: ImportWizardState }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useColumnsStepViewModel(props.wizard);
  const closeLabel = t("financial.import.close");

  function columnList() {
    return (
      <View>
        {vm.columns.map((column) => (
          <View key={column.index}>
            <View style={styles.columnRow}>
              <Text.BodyStrong numberOfLines={1} value={column.header} />
              <Text.Caption
                numberOfLines={1}
                tone={"secondary"}
                value={
                  column.examples.length > 0
                    ? column.examples.join(", ")
                    : t("financial.import.columns.empty")
                }
              />
              <SelectField
                closeLabel={closeLabel}
                label={t("financial.import.columns.represents")}
                onChange={(value) => vm.onTargetChange(column.index, value)}
                options={vm.targets.map((target) => ({
                  label: t(`financial.import.columns.targets.${target}`),
                  value: target,
                }))}
                sheetTitle={t("financial.import.columns.representsSheet")}
                testID={`${ids.importColumn}.${column.index}`}
                value={column.target}
              />
            </View>
            <Divider />
          </View>
        ))}
      </View>
    );
  }

  function statusLine(status: (typeof vm.statuses)[number]) {
    const label = t(`financial.import.columns.fields.${status.field}`);

    return (
      <View key={status.field}>
        <View style={styles.required}>
          <Icon
            name={status.ok ? "check-circle-outline" : "alert-circle-outline"}
            size={20}
          />
          <View style={styles.grow}>
            <Text.BodyStrong value={label} />
            {status.ok ? (
              <Text.Caption
                testID={`${ids.importRequired}.${status.field}`}
                tone={"secondary"}
                value={t(`financial.import.columns.source.${status.source}`)}
              />
            ) : (
              <>
                <Text.Caption
                  testID={`${ids.importRequired}.${status.field}`}
                  tone={"expense"}
                  value={t("financial.import.columns.missingError")}
                />
                {status.missingRows > 0 ? (
                  <Text.Caption
                    tone={"expense"}
                    value={t(
                      pluralKey(
                        "financial.import.columns.missingRows",
                        status.missingRows,
                      ),
                      { count: status.missingRows },
                    )}
                  />
                ) : null}
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  function fixedSelects() {
    return (
      <View style={styles.stack}>
        {vm.showFixedCategory ? (
          <SelectField
            closeLabel={closeLabel}
            label={t("financial.import.columns.fixed.category")}
            onChange={vm.onFixedCategoryChange}
            options={[
              { label: t("financial.import.columns.fixed.none"), value: "" },
              ...vm.fixedCategoryOptions,
            ]}
            sheetTitle={t("financial.import.columns.fixed.category")}
            testID={`${ids.importFixed}.category`}
            value={vm.fixedCategoryValue}
          />
        ) : null}
        {vm.showFixedAccountOrCard ? (
          <SelectField
            closeLabel={closeLabel}
            helper={
              vm.missingAccountRows > 0
                ? t("financial.import.columns.fixedAccountOrCardHelp", {
                    count: vm.missingAccountRows,
                  })
                : undefined
            }
            label={t("financial.import.columns.fixed.accountOrCard")}
            onChange={vm.onFixedAccountOrCardChange}
            options={[
              { label: t("financial.import.columns.fixed.none"), value: "" },
              ...vm.fixedAccountOrCardOptions,
            ]}
            sheetTitle={t("financial.import.columns.fixed.accountOrCard")}
            testID={`${ids.importFixed}.accountOrCard`}
            value={vm.fixedAccountOrCardValue}
          />
        ) : null}
        {vm.showFixedType ? (
          <SelectField
            closeLabel={closeLabel}
            label={t("financial.import.columns.fixed.type")}
            onChange={vm.onFixedTypeChange}
            options={[
              { label: t("financial.import.columns.fixed.none"), value: "" },
              {
                label: t("financial.import.values.type.expense"),
                value: "EXPENSE",
              },
              {
                label: t("financial.import.values.type.income"),
                value: "INCOME",
              },
            ]}
            sheetTitle={t("financial.import.columns.fixed.type")}
            testID={`${ids.importFixed}.type`}
            value={vm.fixedTypeValue}
          />
        ) : null}
      </View>
    );
  }

  function optionalLine(
    field: "currency" | "owner" | "paid" | "tags",
    mapped: boolean,
  ) {
    return (
      <View
        key={field}
        style={styles.required}
        testID={`${ids.importRequired}.${field}`}
      >
        <Icon
          name={mapped ? "check-circle-outline" : "circle-outline"}
          size={20}
        />
        <View style={styles.grow}>
          <Text.Body value={t(`financial.import.columns.fields.${field}`)} />
          <Text.Caption
            tone={"secondary"}
            value={
              mapped
                ? t("financial.import.columns.source.column")
                : t(`financial.import.columns.defaults.${field}`)
            }
          />
        </View>
      </View>
    );
  }

  const panel = (
    <View style={styles.stack}>
      <Text.BodyStrong value={t("financial.import.columns.fields.title")} />
      <View>{vm.statuses.map(statusLine)}</View>
      {fixedSelects()}
      <View>
        {optionalLine("owner", vm.mapped.owner)}
        {optionalLine("paid", vm.mapped.paid)}
        {optionalLine("currency", vm.mapped.currency)}
        {optionalLine("tags", vm.mapped.tags)}
      </View>
    </View>
  );

  return (
    <FormColumns left={columnList()} right={panel} testID={ids.importStep} />
  );
}

export default ColumnsStep;
