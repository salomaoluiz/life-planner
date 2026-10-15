import { View } from "react-native";

import {
  BottomSheet,
  Button,
  ConfirmDialog,
  HelperText,
  Text,
  TextField,
} from "@components";
import { useTranslation } from "@presentation/i18n";

import settingsTestIds from "../../testIds";
import { useDeleteAccountViewModel } from "./hooks";
import useStyles from "./styles";

function DeleteAccount() {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const vm = useDeleteAccountViewModel();

  const confirmMessage = vm.ownedFamilies
    ? `${t("configurations.deleteAccount.confirmMessage")} ${t("configurations.deleteAccount.confirmOwnedFamilies", { families: vm.ownedFamilies })}`
    : t("configurations.deleteAccount.confirmMessage");

  return (
    <>
      <Button.Ghost
        icon={"delete-outline"}
        inline
        label={t("configurations.deleteAccount.button")}
        onPress={vm.onPress}
        testID={settingsTestIds.deleteAccountButton}
        tone={"expense"}
      />
      <ConfirmDialog
        cancelLabel={t("configurations.deleteAccount.cancel")}
        closeLabel={t("configurations.deleteAccount.close")}
        confirmLabel={t("configurations.deleteAccount.continue")}
        loading={vm.isLoadingFamilies}
        message={confirmMessage}
        onCancel={vm.onCancel}
        onConfirm={vm.onContinue}
        testID={settingsTestIds.deleteAccountConfirmDialog}
        title={t("configurations.deleteAccount.confirmTitle")}
        visible={vm.step === "confirm"}
      />
      <BottomSheet
        closeLabel={t("configurations.deleteAccount.close")}
        footer={
          <View style={styles.footer}>
            <Button.Destructive
              disabled={!vm.canSubmit || vm.isDeleting}
              fullWidth
              label={t("configurations.deleteAccount.submit")}
              loading={vm.isDeleting}
              onPress={vm.onSubmit}
              size="lg"
              testID={settingsTestIds.deleteAccountSubmitButton}
            />
            <Button.Secondary
              disabled={vm.isDeleting}
              fullWidth
              label={t("configurations.deleteAccount.cancel")}
              onPress={vm.onCancel}
              size="lg"
              testID={settingsTestIds.deleteAccountCancelButton}
            />
          </View>
        }
        onClose={vm.onCancel}
        testID={settingsTestIds.deleteAccountEmailSheet}
        title={t("configurations.deleteAccount.emailTitle")}
        visible={vm.step === "email"}
      >
        <View style={styles.body}>
          <Text.Body
            tone="secondary"
            value={t("configurations.deleteAccount.emailMessage", {
              email: vm.userEmail,
            })}
          />
          <TextField
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            disabled={vm.isDeleting}
            error={
              vm.mismatch
                ? t("configurations.deleteAccount.emailMismatch")
                : undefined
            }
            keyboardType="email-address"
            label={t("configurations.deleteAccount.emailLabel")}
            onChangeText={vm.onChangeEmail}
            onSubmitEditing={vm.onSubmit}
            returnKeyType="done"
            testID={settingsTestIds.deleteAccountEmailInput}
            textContentType="emailAddress"
            value={vm.email}
          />
          <HelperText
            label={t("configurations.deleteAccount.genericError")}
            testID={settingsTestIds.deleteAccountError}
            type="error"
            visible={vm.hasError}
          />
        </View>
      </BottomSheet>
    </>
  );
}

export default DeleteAccount;
