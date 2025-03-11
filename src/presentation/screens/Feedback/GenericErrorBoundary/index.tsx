import { View } from "react-native";
import { Image } from "expo-image";

import useStyles from "./styles";

import image from "@assets/images/error_boundary.png";
import { ErrorBoundaryFallBackProps } from "@infrastructure/monitoring/types";
import { useTranslation } from "@presentation/i18n";
import { Button, Text } from "@components";

function GlobalBoundary({ retry }: ErrorBoundaryFallBackProps) {
  const { t } = useTranslation();
  const styles = useStyles();

  const onButtonPress = () => {
    retry();
  };

  return (
    <View style={styles.container}>
      <Image
        source={image}
        contentFit={"contain"}
        transition={1000}
        style={styles.image}
      />
      <View style={styles.titleContainer}>
        <Text.Title
          testID={"genericErrorBoundary_title"}
          value={t("errors.generic.title")}
          customStyles={styles.title}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Text.Body
          testID={"genericErrorBoundary_description"}
          value={t("errors.generic.description")}
          customStyles={styles.description}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button.Filled
          testID={"genericErrorBoundary_button"}
          label={t("errors.generic.button.label")}
          onPress={onButtonPress}
        />
      </View>
    </View>
  );
}

export default GlobalBoundary;
