import { Image } from "expo-image";
import { View } from "react-native";

import image from "@assets/images/error_boundary.png";
import { Button, Text } from "@components";
import { ErrorBoundaryFallBackProps } from "@infrastructure/monitoring/types";
import { useTranslation } from "@presentation/i18n";

import useStyles from "./styles";

function GlobalBoundary({ retry }: ErrorBoundaryFallBackProps) {
  const { t } = useTranslation();
  const { styles, theme } = useStyles();

  function onButtonPress() {
    retry();
  }

  return (
    <View style={styles.container}>
      <Image
        contentFit={"contain"}
        source={image}
        style={styles.image}
        transition={1000}
      />
      <View style={styles.titleContainer}>
        <Text.Title
          color={theme.colors.onBackground}
          testID={"genericErrorBoundary_title"}
          textAlign={"center"}
          value={t("errors.generic.title")}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Text.Body
          color={theme.colors.onBackground}
          testID={"genericErrorBoundary_description"}
          textAlign={"center"}
          value={t("errors.generic.description")}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button.Filled
          label={t("errors.generic.button.label")}
          onPress={onButtonPress}
          testID={"genericErrorBoundary_button"}
        />
      </View>
    </View>
  );
}

export default GlobalBoundary;
