import { View } from "react-native";

import {
  Button,
  Card,
  ChipGroup,
  FormColumns,
  SelectField,
  Text,
} from "@components";
import { useTranslation } from "@presentation/i18n";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import PreviewTable from "@screens/Financial/Transactions/components/PreviewTable";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "../styles";
import { ImportWizardState } from "../useImportWizardViewModel";
import useFileStepViewModel from "./useFileStepViewModel";

const ids = transactionsTestIds;

// Step 1 of the import wizard (artboard "Importar 1/4, arquivo e Pertence a").
function FileStep(props: { wizard: ImportWizardState }) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useFileStepViewModel(props.wizard);
  const closeLabel = t("financial.import.close");

  function fileCard() {
    return (
      <View style={styles.section}>
        <Text.BodyStrong value={t("financial.import.file.title")} />
        <Card padding={"md"} variant={vm.hasFile ? "default" : "dashed"}>
          <View style={styles.fileRow}>
            <View style={styles.grow}>
              {vm.hasFile ? (
                <>
                  <Text.BodyStrong
                    numberOfLines={1}
                    testID={ids.importFileName}
                    value={vm.fileName ?? ""}
                  />
                  <Text.Caption
                    tone={"secondary"}
                    value={t("financial.import.file.summary", {
                      columns: vm.columnCount,
                      rows: vm.rowCount,
                    })}
                  />
                </>
              ) : (
                <Text.Body
                  tone={"secondary"}
                  value={t("financial.import.file.pick")}
                />
              )}
            </View>
            <Button.Secondary
              label={t(
                vm.hasFile
                  ? "financial.import.file.replace"
                  : "financial.import.file.pick",
              )}
              onPress={vm.onPick}
              testID={ids.importPick}
            />
          </View>
        </Card>
        {vm.problemKey ? (
          <View accessibilityRole={"alert"}>
            <Text.Caption
              testID={ids.importFileProblem}
              tone={"expense"}
              value={t(vm.problemKey as never)}
            />
          </View>
        ) : null}
      </View>
    );
  }

  function detection() {
    if (!vm.hasFile) {
      return null;
    }

    return (
      <View style={styles.selects}>
        <View style={styles.select}>
          <SelectField
            closeLabel={closeLabel}
            label={t("financial.import.file.separator.label")}
            onChange={vm.onSeparatorChange}
            options={[
              {
                label: t("financial.import.file.separator.semicolon"),
                value: ";",
              },
              {
                label: t("financial.import.file.separator.comma"),
                value: ",",
              },
              { label: t("financial.import.file.separator.tab"), value: "\t" },
            ]}
            sheetTitle={t("financial.import.file.separator.label")}
            testID={ids.importSeparator}
            value={vm.separator}
          />
        </View>
        <View style={styles.select}>
          <SelectField
            closeLabel={closeLabel}
            label={t("financial.import.file.decimal.label")}
            onChange={vm.onDecimalChange}
            options={[
              { label: t("financial.import.file.decimal.comma"), value: "," },
              { label: t("financial.import.file.decimal.point"), value: "." },
            ]}
            sheetTitle={t("financial.import.file.decimal.label")}
            testID={ids.importDecimal}
            value={vm.decimal}
          />
        </View>
        <View style={styles.select}>
          <SelectField
            closeLabel={closeLabel}
            label={t("financial.import.file.dateFormat.label")}
            onChange={vm.onDateFormatChange}
            options={[
              {
                label: t("financial.import.file.dateFormat.dmy"),
                value: "dd/mm/yyyy",
              },
              {
                label: t("financial.import.file.dateFormat.mdy"),
                value: "mm/dd/yyyy",
              },
              {
                label: t("financial.import.file.dateFormat.ymd"),
                value: "yyyy-mm-dd",
              },
            ]}
            sheetTitle={t("financial.import.file.dateFormat.label")}
            testID={ids.importDateFormat}
            value={vm.dateFormat}
          />
        </View>
        {vm.showEncoding ? (
          <View style={styles.select}>
            <SelectField
              closeLabel={closeLabel}
              label={t("financial.import.file.encoding.label")}
              onChange={vm.onEncodingChange}
              options={[
                { label: "UTF-8", value: "UTF-8" },
                { label: "Windows-1252", value: "Windows-1252" },
              ]}
              sheetTitle={t("financial.import.file.encoding.label")}
              testID={ids.importEncoding}
              value={vm.encoding}
            />
          </View>
        ) : null}
      </View>
    );
  }

  function owner() {
    return (
      <View style={styles.section}>
        <Text.BodyStrong value={t("financial.import.file.owner.title")} />
        <ChipGroup
          layout={"wrap"}
          mode={"single"}
          onChange={vm.onOwnerChange}
          options={translateChoices(vm.ownerChoices, t).map((choice) => ({
            label: choice.label,
            value: choice.value,
          }))}
          testID={ids.importOwner}
          value={vm.ownerId}
        />
        <Text.Caption
          tone={"secondary"}
          value={t("financial.import.file.owner.help")}
        />
      </View>
    );
  }

  function preview() {
    return (
      <View style={styles.section}>
        <Text.BodyStrong value={t("financial.import.file.preview")} />
        {vm.hasFile ? (
          <PreviewTable
            headers={vm.headers}
            rows={vm.previewRows}
            testID={ids.importPreview}
          />
        ) : null}
      </View>
    );
  }

  return (
    <FormColumns
      left={
        <>
          {fileCard()}
          {detection()}
          {owner()}
        </>
      }
      right={preview()}
      testID={ids.importStep}
    />
  );
}

export default FileStep;
