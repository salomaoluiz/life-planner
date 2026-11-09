import { AdaptiveViewProps, BottomSheet, Button, TextField } from "@components";
import { useTranslation } from "@presentation/i18n";

import { FAMILY_NAME_MAX } from "../constants";
import { AddNewFamilyVM } from "../hooks";
import newFamilyTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<AddNewFamilyVM>) {
  const { t } = useTranslation();

  let error: string | undefined;
  if (vm.errorKey) {
    error = t(vm.errorKey);
  } else if (vm.hasGenericError) {
    error = t("common.errors.generic");
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t("family.form.submit")}
          loading={vm.isSubmitting}
          onPress={vm.onSubmit}
          size="lg"
          testID={newFamilyTestIds.saveButton}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      testID={newFamilyTestIds.sheet}
      title={t("family.form.title")}
      visible
    >
      <TextField
        autoCapitalize="words"
        error={error}
        helper={
          vm.counterVisible
            ? t("family.form.counter", {
                count: vm.name.length,
                max: FAMILY_NAME_MAX,
              })
            : undefined
        }
        label={t("family.form.name")}
        maxLength={FAMILY_NAME_MAX}
        onChangeText={vm.onChangeName}
        onSubmitEditing={vm.onSubmit}
        returnKeyType="done"
        testID={newFamilyTestIds.nameInput}
        value={vm.name}
      />
    </BottomSheet>
  );
}

export default Wide;
