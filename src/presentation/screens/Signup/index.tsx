import { Href, Redirect } from "expo-router";
import { View } from "react-native";

import { Button, HelperText, Spacer, Text, TextInput } from "@components";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

import useSignupViewModel from "./hooks/useSignupViewModel";
import getStyles from "./styles";

function Signup() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = getStyles();
  const vm = useSignupViewModel();

  if (vm.logged) {
    return <Redirect href={"/" as Href} />;
  }

  const passwordIcon = {
    accessibilityLabel: vm.showPassword
      ? t("login.form.hidePassword")
      : t("login.form.showPassword"),
    name: vm.showPassword ? "eye-off" : "eye",
    onPress: vm.onTogglePassword,
  };

  return (
    <View style={styles.container}>
      <Text.Headline
        color={theme.colors.textPrimary}
        testID="signup-title"
        value={t("signup.title")}
      />
      <View style={styles.form}>
        <TextInput.Flat
          autoComplete="name"
          disabled={vm.isSubmitting}
          error={!!vm.nameError}
          label={t("signup.form.name")}
          onChangeText={vm.onChangeName}
          onSubmitEditing={vm.onNameSubmit}
          returnKeyType="next"
          testID="signup-name"
          textContentType="name"
          value={vm.name}
        />
        <HelperText
          label={vm.nameError ?? ""}
          testID="signup-name-error"
          type="error"
          visible={!!vm.nameError}
        />
        <TextInput.Flat
          autoCapitalize="none"
          autoComplete="email"
          disabled={vm.isSubmitting}
          error={!!vm.emailError}
          inputRef={vm.refs.email}
          keyboardType="email-address"
          label={t("signup.form.email")}
          onChangeText={vm.onChangeEmail}
          onSubmitEditing={vm.onEmailSubmit}
          returnKeyType="next"
          testID="signup-email"
          textContentType="emailAddress"
          value={vm.email}
        />
        <HelperText
          label={vm.emailError ?? ""}
          testID="signup-email-error"
          type="error"
          visible={!!vm.emailError}
        />
        <TextInput.Flat
          autoCapitalize="none"
          autoComplete="new-password"
          disabled={vm.isSubmitting}
          error={!!vm.passwordError}
          inputRef={vm.refs.password}
          label={t("signup.form.password")}
          onChangeText={vm.onChangePassword}
          onSubmitEditing={vm.onPasswordSubmit}
          returnKeyType="next"
          rightIcon={passwordIcon}
          secureTextEntry={!vm.showPassword}
          testID="signup-password"
          textContentType="newPassword"
          value={vm.password}
        />
        <HelperText
          label={vm.passwordError ?? ""}
          testID="signup-password-error"
          type="error"
          visible={!!vm.passwordError}
        />
        <TextInput.Flat
          autoCapitalize="none"
          autoComplete="new-password"
          disabled={vm.isSubmitting}
          error={!!vm.confirmPasswordError}
          inputRef={vm.refs.confirmPassword}
          label={t("signup.form.confirmPassword")}
          onChangeText={vm.onChangeConfirmPassword}
          onSubmitEditing={vm.onSubmit}
          returnKeyType="done"
          secureTextEntry={!vm.showPassword}
          testID="signup-confirm-password"
          textContentType="newPassword"
          value={vm.confirmPassword}
        />
        <HelperText
          label={vm.confirmPasswordError ?? ""}
          testID="signup-confirm-password-error"
          type="error"
          visible={!!vm.confirmPasswordError}
        />
        <HelperText
          label={vm.formError ?? ""}
          testID="signup-form-error"
          type="error"
          visible={!!vm.formError}
        />
        <Spacer direction="vertical" size="medium" />
        <Button.Filled
          disabled={vm.isSubmitting}
          label={t("signup.button.submit")}
          loading={vm.isSubmitting}
          onPress={vm.onSubmit}
          testID="signup-submit"
        />
        <Button.Text
          disabled={vm.isSubmitting}
          label={t("signup.button.goToLogin")}
          onPress={vm.onGoToLogin}
          testID="signup-go-to-login"
        />
      </View>
    </View>
  );
}

export default Signup;
