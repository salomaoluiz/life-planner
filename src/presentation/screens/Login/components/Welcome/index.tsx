import { View } from "react-native";

import { Text } from "@components";
import { useTranslation } from "@presentation/i18n";

import getStyles from "./styles";

function Welcome() {
  const styles = getStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text.Headline
        customStyles={styles.title}
        testID={"login_welcome"}
        value={t("login.welcome")}
      />
    </View>
  );
}

export default Welcome;
