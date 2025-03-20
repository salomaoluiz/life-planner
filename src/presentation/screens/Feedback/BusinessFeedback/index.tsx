import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Button, Text } from "@components";
import Icon, { IconButton } from "@components/Icon";
import handleAction from "@screens/Feedback/BusinessFeedback/actions";

import getStyles from "./styles";
import { FeedbackType, RouteDecryptedProps } from "./types";
import { decodeRouteParams } from "./utils";

function BusinessFeedback() {
  const [params, setParams] = useState<null | RouteDecryptedProps>(null);
  const { styles, theme } = getStyles();
  const routeParams = useLocalSearchParams<{ feedback: string }>();

  async function decodeParams() {
    const decoded = await decodeRouteParams(routeParams);
    setParams(decoded);
  }

  useEffect(() => {
    if (routeParams) {
      decodeParams();
    }
  }, []);

  if (!params) {
    return (
      <View>
        <Text.Title value={"Loading..."} />
      </View>
    );
  }

  async function onPrimaryButtonPress() {
    if (params) {
      await handleAction(params.primaryButton);
    }
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
        return theme.colors.error;
      case FeedbackType.Information:
        return theme.colors.primary;
      case FeedbackType.Success:
        return theme.colors.tertiary;
      case FeedbackType.Warning:
        return theme.colors.secondary;
    }
  }

  function onCloseButtonPress() {
    handleAction(params!.closeButton);
  }

  return (
    <View style={styles.container}>
      <View style={styles.closeContainer}>
        <IconButton
          color={theme.colors.onBackground}
          name={"close-circle"}
          onPress={onCloseButtonPress}
          size={theme.sizes.spacing.large}
        />
      </View>
      <View style={styles.iconContainer}>
        <Icon
          color={getIconColor()}
          name={getIconName()}
          size={theme.sizes.spacing.xxlarge}
        />
      </View>
      <View style={styles.headerContainer}>
        <Text.Title value={params.title} />
        <Text.Body value={params.message} />
      </View>
      <View style={styles.buttonsContainer}>
        <Button.Filled
          label={params.primaryButton.label}
          onPress={onPrimaryButtonPress}
        />
      </View>
    </View>
  );
}

export default BusinessFeedback;
