import { View } from "react-native";

import { BottomSheet, Button, ConfirmDialog, Stepper, Text } from "@components";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import {
  IMPORT_STEPS,
  ImportStep,
} from "@screens/Financial/Transactions/models/importWizard";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import ColumnsStep from "./steps/ColumnsStep";
import FileStep from "./steps/FileStep";
import ReviewStep from "./steps/ReviewStep";
import ValuesStep from "./steps/ValuesStep";
import useStyles from "./styles";
import useImportWizardViewModel, {
  ImportWizardParams,
} from "./useImportWizardViewModel";

const ids = transactionsTestIds;

// The Import CSV wizard (spec 047 FR 8-33): file, columns, values and review, in a sheet that is wider on web.
function ImportWizard(props: ImportWizardParams) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const wizard = useImportWizardViewModel(props);
  const { step } = wizard;
  const index = IMPORT_STEPS.indexOf(step);
  const stepName = t(`financial.import.steps.${step}`);

  function body() {
    const stepProps = { wizard };

    switch (step) {
      case "columns":
        return <ColumnsStep {...stepProps} />;
      case "review":
        return <ReviewStep {...stepProps} />;
      case "values":
        return <ValuesStep {...stepProps} />;
      default:
        return <FileStep {...stepProps} />;
    }
  }

  // What blocks Continue, in words (FR 26, 31).
  function note() {
    if (step === "values" && wizard.unmatched > 0) {
      return t(
        pluralKey("financial.import.values.unmatched", wizard.unmatched),
        { count: wizard.unmatched },
      );
    }

    if (step === "review" && wizard.summary.errors > 0) {
      return t(
        pluralKey(
          "financial.import.review.footerErrors",
          wizard.summary.errors,
        ),
        { count: wizard.summary.errors },
      );
    }

    // Spec 049 FR 20: the import waits for a check of the current selection.
    if (step === "review" && wizard.stale) {
      return t("financial.import.review.refresh.blocked");
    }

    return undefined;
  }

  const compactReview = step === "review" && !wizard.wide;
  const footerNote = note();
  const noteTone = wizard.summary.errors > 0 ? "expense" : "warning";
  const compactErrors =
    wizard.summary.errors > 0
      ? t(
          pluralKey(
            "financial.import.review.footerErrors",
            wizard.summary.errors,
          ),
          { count: wizard.summary.errors },
        )
      : undefined;
  const compactNotice =
    compactReview &&
    (compactErrors ??
      (wizard.stale ? t("financial.import.review.refresh.stale") : undefined));
  const primaryLabel =
    step === "review"
      ? t(pluralKey("financial.import.review.submit", wizard.summary.ready), {
          count: wizard.summary.ready,
        })
      : t("financial.import.continue");

  function primary(size: "lg" | "md" = "lg") {
    return (
      <Button.Primary
        disabled={!wizard.stepReady}
        fullWidth
        label={primaryLabel}
        loading={wizard.isImporting}
        onPress={wizard.onContinue}
        size={size}
        testID={step === "review" ? ids.importSubmit : ids.importContinue}
      />
    );
  }

  function compactFooter() {
    return (
      <View style={styles.footer}>
        {compactNotice ? (
          <Text.Caption
            testID={
              compactNotice === footerNote
                ? ids.importFooterNote
                : ids.importStale
            }
            tone={compactNotice === footerNote ? noteTone : "warning"}
            value={compactNotice}
          />
        ) : null}
        <View style={styles.footerRow}>
          <View style={styles.footerAction}>
            <Button.Secondary
              disabled={!wizard.review.length || wizard.isRefreshing}
              fullWidth
              label={t(
                wizard.isRefreshing
                  ? "financial.import.review.refresh.refreshing"
                  : "financial.import.review.refresh.short",
              )}
              loading={wizard.isRefreshing}
              onPress={wizard.onRefresh}
              testID={ids.importRefresh}
            />
          </View>
          <View style={styles.footerAction}>{primary("md")}</View>
        </View>
      </View>
    );
  }

  return (
    <>
      <BottomSheet
        closeLabel={t("financial.import.close")}
        footer={compactReview ? compactFooter() : primary()}
        footerSecondary={
          compactReview ? undefined : (
            <Button.Secondary
              fullWidth
              label={t(
                step === "file"
                  ? "financial.import.cancel"
                  : "financial.import.back",
              )}
              onPress={step === "file" ? wizard.onRequestClose : wizard.onBack}
              size={"lg"}
              testID={step === "file" ? ids.importCancel : ids.importBack}
            />
          )
        }
        footerStart={
          footerNote && !compactReview ? (
            <Text.Caption
              testID={ids.importFooterNote}
              tone={noteTone}
              value={footerNote}
            />
          ) : undefined
        }
        onClose={wizard.onRequestClose}
        presentation={"inline"}
        size={"fluid"}
        testID={ids.importSheet}
        title={
          wizard.wide
            ? t("financial.import.title")
            : `${t("financial.import.title")} · ${stepName}`
        }
        visible
      >
        <Stepper
          accessibilityLabel={t("financial.import.stepOf", {
            current: index + 1,
            name: stepName,
            total: IMPORT_STEPS.length,
          })}
          compact={!wizard.wide}
          current={index}
          steps={IMPORT_STEPS.map((item: ImportStep) => ({
            label: t(`financial.import.steps.${item}`),
          }))}
          testID={ids.importStepper}
        />
        <View style={styles.stepBody}>{body()}</View>
        {wizard.importError ? (
          <Text.Caption
            tone={"expense"}
            value={t("financial.import.review.failed")}
          />
        ) : null}
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("financial.import.discard.keep")}
        closeLabel={t("financial.import.close")}
        confirmLabel={t("financial.import.discard.confirm")}
        message={t("financial.import.discard.message")}
        onCancel={wizard.onDialogClose}
        onConfirm={wizard.onDiscardConfirm}
        testID={ids.importDiscardDialog}
        title={t("financial.import.discard.title")}
        visible={wizard.dialog === "discard"}
      />
      <ConfirmDialog
        cancelLabel={t("financial.import.ownerChange.cancel")}
        closeLabel={t("financial.import.close")}
        confirmLabel={t("financial.import.ownerChange.confirm")}
        message={t("financial.import.ownerChange.message")}
        onCancel={wizard.onDialogClose}
        onConfirm={wizard.onOwnerConfirm}
        testID={ids.importOwnerConfirm}
        title={t("financial.import.ownerChange.title")}
        visible={wizard.dialog === "owner"}
      />
    </>
  );
}

export default ImportWizard;
