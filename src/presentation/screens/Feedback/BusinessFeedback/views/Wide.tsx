import { View } from "react-native";

import { AdaptiveViewProps, Button, Text } from "@components";
import Icon, { IconButton } from "@components/Icon";
import { useTranslation } from "@presentation/i18n";

import { BusinessFeedbackVM } from "../hooks";
import getStyles from "../styles";
import { FeedbackType } from "../types";

function Wide({ vm }: AdaptiveViewProps<BusinessFeedbackVM>) {
  const { t } = useTranslation();
  const { styles, theme } = getStyles();
  const { params } = vm;

  if (!params) {
    return (
      <View>
        <Text.Title value={"Loading..."} />
      </View>
    );
  }

  function getIconName() {
    switch (params!.type) {
      case FeedbackType.Error:
        return "close-circle";
      case FeedbackType.Information:
        return "information";
      case FeedbackType.Success:
        return "check-circle";
      case FeedbackType.Warning:
        return "alert";
    }
  }

  function getIconColor() {
    switch (params!.type) {
      case FeedbackType.Error:
        return theme.colors.expense;
      case FeedbackType.Information:
        return theme.colors.accent;
      case FeedbackType.Success:
        return theme.colors.income;
      case FeedbackType.Warning:
        return theme.colors.warning;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.closeContainer}>
        <IconButton
          accessibilityLabel={t("common.actions.close")}
          color={theme.colors.textPrimary}
          name={"close-circle"}
          onPress={vm.onCloseButtonPress}
          size={theme.sizes.spacing.xl}
        />
      </View>
      <View style={styles.iconContainer}>
        <Icon
          color={getIconColor()}
          name={getIconName()}
          size={theme.sizes.spacing.xxxl}
        />
      </View>
      <View style={styles.headerContainer}>
        <Text.Title value={params.title} />
        <Text.Body value={params.message} />
      </View>
      <View style={styles.buttonsContainer}>
        <Button.Filled
          label={params.primaryButton.label}
          onPress={vm.onPrimaryButtonPress}
        />
      </View>
    </View>
  );
}

export default Wide;
