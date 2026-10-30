import { Href, Redirect } from "expo-router";
import { View } from "react-native";

import { Button, Card, HelperText, TextField } from "@components";
import { useTranslation } from "@presentation/i18n";

import { VersionLine, Welcome } from "./components";
import useLoginViewModel from "./hooks/useLoginViewModel";
import useStyles from "./styles";
import loginTestIds from "./testIds";

function Login() {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const vm = useLoginViewModel();

  if (vm.logged) {
    return <Redirect href={"/" as Href} />;
  }

  return (
    <View style={styles.container}>
      <Welcome />
      <View style={styles.cardWrap} testID={loginTestIds.cardWrap}>
        <Card padding="lg" testID={loginTestIds.card}>
          <View style={styles.form}>
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              disabled={vm.isSubmitting}
              error={vm.emailError}
              keyboardType="email-address"
              label={t("login.form.email")}
              onChangeText={vm.onChangeEmail}
              onSubmitEditing={vm.onEmailSubmit}
              returnKeyType="next"
              testID={loginTestIds.emailInput}
              textContentType="emailAddress"
              value={vm.email}
            />
            <TextField
              autoCapitalize="none"
              autoComplete="password"
              disabled={vm.isSubmitting}
              error={vm.passwordError}
              hidePasswordLabel={t("login.form.hidePassword")}
              inputRef={vm.passwordRef}
              label={t("login.form.password")}
              onChangeText={vm.onChangePassword}
              onSubmitEditing={vm.onSubmit}
              returnKeyType="done"
              secureTextEntry
              showPasswordLabel={t("login.form.showPassword")}
              testID={loginTestIds.passwordInput}
              textContentType="password"
              value={vm.password}
            />
            <HelperText
              label={vm.accountDeletedNotice ?? ""}
              testID={loginTestIds.accountDeletedNotice}
              type="info"
              visible={!!vm.accountDeletedNotice}
            />
            <HelperText
              label={vm.formError?.message ?? ""}
              testID={loginTestIds.formError}
              type={vm.formError?.type ?? "error"}
              visible={!!vm.formError}
            />
            <Button.Primary
              disabled={vm.isSubmitting}
              fullWidth
              label={t("login.button.signIn")}
              loading={vm.isSubmitting}
              onPress={vm.onSubmit}
              testID={loginTestIds.submitButton}
            />
            <Button.Ghost
              disabled={vm.isSubmitting}
              fullWidth
              label={t("login.button.goToSignUp")}
              onPress={vm.onGoToSignUp}
              testID={loginTestIds.goToSignupButton}
            />
          </View>
        </Card>
      </View>
      <VersionLine />
    </View>
  );
}

export default Login;
