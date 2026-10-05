import { Pressable, View } from "react-native";

import { Button, Card, HelperText, Spacer, Text, TextInput } from "@components";
import { useTranslation } from "@presentation/i18n";

import useAddNewFamilyMemberViewModel from "./hooks/useAddNewFamilyMemberViewModel";
import getStyles from "./styles";

function AddNewFamilyMemberModal() {
  const { styles, theme } = getStyles();
  const { t } = useTranslation();
  const vm = useAddNewFamilyMemberViewModel();

  return (
    <>
      <Pressable onPress={vm.onCancel} style={styles.backdrop} />
      <Card customStyles={styles.container}>
        <View style={styles.titleContainer}>
          <Text.Title value={t("family.member.invite.title")} />
        </View>
        <View style={styles.inputContainer}>
          <TextInput.Outlined
            keyboardType={"email-address"}
            label={t("family.member.invite.emailLabel")}
            onChangeText={vm.onChangeEmail}
            value={vm.email}
          />
          <HelperText
            label={vm.emailErrorKey ? t(vm.emailErrorKey) : ""}
            type={"error"}
            visible={!!vm.emailErrorKey}
          />
          <HelperText
            label={t("family.member.invite.alreadyExists")}
            type={"error"}
            visible={vm.alreadyExistsVisible}
          />
        </View>
        <Spacer direction={"vertical"} size={"medium"} />
        <View style={styles.buttonsContainer}>
          <Button.Filled
            disabled={vm.isSubmitting}
            label={t("family.member.invite.submit")}
            loading={vm.isSubmitting}
            onPress={vm.onSubmit}
          />
          <Spacer direction={"horizontal"} size={"xxxlarge"} />
          <Button.Text
            customStyles={{ textColor: theme.colors.expense }}
            label={t("family.member.invite.cancel")}
            onPress={vm.onCancel}
          />
        </View>
      </Card>
    </>
  );
}

export default AddNewFamilyMemberModal;
