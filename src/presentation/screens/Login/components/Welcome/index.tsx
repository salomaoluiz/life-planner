import getStyles from "./styles";
import { View } from "react-native";
import { Text } from "@components";
import { useTranslation } from "@presentation/i18n";

function Welcome() {
  const styles = getStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text.Headline
        testID={"login_welcome"}
        value={t("login.welcome")}
        customStyles={styles.title}
      />
    </View>
  );
}

export default Welcome;
