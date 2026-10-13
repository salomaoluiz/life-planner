import { Href, Redirect } from "expo-router";
import { View } from "react-native";

import { Button, Card, HelperText, TextField } from "@components";
import { useTranslation } from "@presentation/i18n";

import { Welcome } from "./components";
import useLoginViewModel from "./hooks/useLoginViewModel";
import useStyles from "./styles";

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
      <View style={styles.cardWrap} testID="login-card-wrap">
        <Card padding="lg" testID="login-card">
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
              testID="login-email"
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
              testID="login-password"
              textContentType="password"
              value={vm.password}
            />
            <HelperText
              label={vm.formError?.message ?? ""}
              testID="login-form-error"
              type={vm.formError?.type ?? "error"}
              visible={!!vm.formError}
            />
            <Button.Primary
              disabled={vm.isSubmitting}
              fullWidth
              label={t("login.button.signIn")}
              loading={vm.isSubmitting}
              onPress={vm.onSubmit}
              testID="login-submit"
            />
            <Button.Ghost
              disabled={vm.isSubmitting}
              fullWidth
              label={t("login.button.goToSignUp")}
              onPress={vm.onGoToSignUp}
              testID="login-go-to-signup"
            />
          </View>
        </Card>
      </View>
    </View>
  );
}

export default Login;
