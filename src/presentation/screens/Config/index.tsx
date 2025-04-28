import { ScrollView, View } from "react-native";

import { Spacer, Text } from "@components";
import { useTranslation } from "@presentation/i18n";

import { DarkMode, Language, Logout } from "./containers";
import getStyles from "./styles";

function Config() {
  const styles = getStyles();
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={{ flex: 1 }} style={{ flex: 1 }}>
      <View style={styles.background}>
        <View style={styles.titleContainer}>
          <Text.Headline value={t("configurations.title")} />
        </View>
        <View style={styles.container}>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <DarkMode />
            </View>
            <Spacer direction={"vertical"} size={"xlarge"} />
            <View style={styles.listItem}>
              <Language />
            </View>
          </View>
          <View style={styles.logoutContainer}>
            <Logout />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default Config;
