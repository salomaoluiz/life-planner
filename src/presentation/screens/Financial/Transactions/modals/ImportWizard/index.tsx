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
import useImportWizardViewModel, {
  ImportWizardParams,
} from "./useImportWizardViewModel";

const ids = transactionsTestIds;

// The Import CSV wizard (spec 047 FR 8-33): file, columns, values and review, in a sheet that is wider on web.
function ImportWizard(props: ImportWizardParams) {
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

    return undefined;
  }

  const footerNote = note();
  const primaryLabel =
    step === "review"
      ? t(pluralKey("financial.import.review.submit", wizard.summary.ready), {
          count: wizard.summary.ready,
        })
      : t("financial.import.continue");

  return (
    <>
      <BottomSheet
        closeLabel={t("financial.import.close")}
        footer={
          <Button.Primary
            disabled={!wizard.stepReady}
            fullWidth
            label={primaryLabel}
            loading={wizard.isImporting}
            onPress={wizard.onContinue}
            size={"lg"}
            testID={step === "review" ? ids.importSubmit : ids.importContinue}
          />
        }
        footerSecondary={
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
        }
        footerStart={
          footerNote ? (
            <Text.Caption
              testID={ids.importFooterNote}
              tone={"expense"}
              value={footerNote}
            />
          ) : undefined
        }
        onClose={wizard.onRequestClose}
        presentation={"inline"}
        size={"wizard"}
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
        {body()}
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
