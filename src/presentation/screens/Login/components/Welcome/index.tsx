import { View } from "react-native";

import { Text } from "@components";
import { useTranslation } from "@presentation/i18n";

import getStyles from "./styles";

function Welcome() {
  const { styles, theme } = getStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text.Headline
        color={theme.colors.textPrimary}
        testID={"login_welcome"}
        value={t("login.welcome")}
      />
    </View>
  );
}

export default Welcome;
