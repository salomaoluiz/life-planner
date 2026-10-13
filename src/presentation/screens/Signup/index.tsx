import { Href, Redirect } from "expo-router";
import { View } from "react-native";

import { Button, Card, HelperText, Text, TextField } from "@components";
import { useTranslation } from "@presentation/i18n";

import useSignupViewModel from "./hooks/useSignupViewModel";
import useStyles from "./styles";

function Signup() {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const vm = useSignupViewModel();

  if (vm.logged) {
    return <Redirect href={"/" as Href} />;
  }

  const passwordLabels = {
    hidePasswordLabel: t("login.form.hidePassword"),
    showPasswordLabel: t("login.form.showPassword"),
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardWrap} testID="signup-card-wrap">
        <Card padding="lg" testID="signup-card">
          <View style={styles.form}>
            <Text.Title testID="signup-title" value={t("signup.title")} />
            <TextField
              autoComplete="name"
              disabled={vm.isSubmitting}
              error={vm.nameError}
              label={t("signup.form.name")}
              onChangeText={vm.onChangeName}
              onSubmitEditing={vm.onNameSubmit}
              returnKeyType="next"
              testID="signup-name"
              textContentType="name"
              value={vm.name}
            />
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              disabled={vm.isSubmitting}
              error={vm.emailError}
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
            <TextField
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={vm.isSubmitting}
              error={vm.passwordError}
              inputRef={vm.refs.password}
              label={t("signup.form.password")}
              onChangeText={vm.onChangePassword}
              onSubmitEditing={vm.onPasswordSubmit}
              returnKeyType="next"
              secureTextEntry
              testID="signup-password"
              textContentType="newPassword"
              value={vm.password}
              {...passwordLabels}
            />
            <TextField
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={vm.isSubmitting}
              error={vm.confirmPasswordError}
              inputRef={vm.refs.confirmPassword}
              label={t("signup.form.confirmPassword")}
              onChangeText={vm.onChangeConfirmPassword}
              onSubmitEditing={vm.onSubmit}
              returnKeyType="done"
              secureTextEntry
              testID="signup-confirm-password"
              textContentType="newPassword"
              value={vm.confirmPassword}
              {...passwordLabels}
            />
            <HelperText
              label={vm.formError ?? ""}
              testID="signup-form-error"
              type="error"
              visible={!!vm.formError}
            />
            <Button.Primary
              disabled={vm.isSubmitting}
              fullWidth
              label={t("signup.button.submit")}
              loading={vm.isSubmitting}
              onPress={vm.onSubmit}
              testID="signup-submit"
            />
            <Button.Ghost
              disabled={vm.isSubmitting}
              fullWidth
              label={t("signup.button.goToLogin")}
              onPress={vm.onGoToLogin}
              testID="signup-go-to-login"
            />
          </View>
        </Card>
      </View>
    </View>
  );
}

export default Signup;
