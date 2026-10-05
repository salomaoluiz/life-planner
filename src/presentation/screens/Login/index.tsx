import { Href, Redirect } from "expo-router";
import { View } from "react-native";

import { Button, HelperText, Spacer, TextInput } from "@components";
import { useTranslation } from "@presentation/i18n";

import { Welcome } from "./components";
import useLoginViewModel from "./hooks/useLoginViewModel";
import getStyles from "./styles";

function Login() {
  const { t } = useTranslation();
  const styles = getStyles();
  const vm = useLoginViewModel();

  if (vm.logged) {
    return <Redirect href={"/" as Href} />;
  }

  return (
    <View style={styles.container}>
      <Welcome />
      <View style={styles.form}>
        <TextInput.Flat
          autoCapitalize="none"
          autoComplete="email"
          disabled={vm.isSubmitting}
          error={!!vm.emailError}
          keyboardType="email-address"
          label={t("login.form.email")}
          onChangeText={vm.onChangeEmail}
          onSubmitEditing={vm.onEmailSubmit}
          returnKeyType="next"
          testID="login-email"
          textContentType="emailAddress"
          value={vm.email}
        />
        <HelperText
          label={vm.emailError ?? ""}
          testID="login-email-error"
          type="error"
          visible={!!vm.emailError}
        />
        <TextInput.Flat
          autoCapitalize="none"
          autoComplete="password"
          disabled={vm.isSubmitting}
          error={!!vm.passwordError}
          inputRef={vm.passwordRef}
          label={t("login.form.password")}
          onChangeText={vm.onChangePassword}
          onSubmitEditing={vm.onSubmit}
          returnKeyType="done"
          rightIcon={{
            accessibilityLabel: vm.showPassword
              ? t("login.form.hidePassword")
              : t("login.form.showPassword"),
            name: vm.showPassword ? "eye-off" : "eye",
            onPress: vm.onTogglePassword,
          }}
          secureTextEntry={!vm.showPassword}
          testID="login-password"
          textContentType="password"
          value={vm.password}
        />
        <HelperText
          label={vm.passwordError ?? ""}
          testID="login-password-error"
          type="error"
          visible={!!vm.passwordError}
        />
        <HelperText
          label={vm.formError?.message ?? ""}
          testID="login-form-error"
          type={vm.formError?.type ?? "error"}
          visible={!!vm.formError}
        />
        <Spacer direction="vertical" size="md" />
        <Button.Filled
          disabled={vm.isSubmitting}
          label={t("login.button.signIn")}
          loading={vm.isSubmitting}
          onPress={vm.onSubmit}
          testID="login-submit"
        />
        <Button.Text
          disabled={vm.isSubmitting}
          label={t("login.button.goToSignUp")}
          onPress={vm.onGoToSignUp}
          testID="login-go-to-signup"
        />
      </View>
    </View>
  );
}

export default Login;
