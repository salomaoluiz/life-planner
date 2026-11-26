import { router } from "expo-router";
import { View } from "react-native";

import { Badge, IconButton } from "@components";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import useUnreadCount from "@screens/Notifications/hooks/useUnreadCount";
import notificationsTestIds from "@screens/Notifications/testIds";

import useStyles from "./styles";

export const NOTIFICATIONS_PATH = "/notifications";
const CAP = 9;

// Spec 124 FR 21 and section 8: the bell of the app headers with the unread count, capped at "9+".
function NotificationBell() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { count } = useUnreadCount();

  return (
    <View>
      <IconButton
        accessibilityLabel={
          count === 0
            ? t("notifications.bell.none")
            : t(pluralKey("notifications.bell.label", count), { count })
        }
        name="bell-outline"
        onPress={() => router.push(NOTIFICATIONS_PATH as never)}
        testID={notificationsTestIds.bell}
      />
      {count > 0 ? (
        <View pointerEvents="none" style={styles.badge}>
          <Badge
            label={count > CAP ? `${CAP}+` : String(count)}
            testID={notificationsTestIds.bellBadge}
            tone="expense"
          />
        </View>
      ) : null}
    </View>
  );
}

export default NotificationBell;
