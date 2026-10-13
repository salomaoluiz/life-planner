import { View } from "react-native";

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconTile,
  Screen,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";

import useInviteViewModel from "./hooks/useInviteViewModel";
import useStyles from "./styles";

function Invite() {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const vm = useInviteViewModel();

  if (vm.status === "loading") {
    return (
      <Screen testID="invite-screen">
        <View style={styles.column} testID="invite-column">
          <Skeleton.Card testID="invite-skeleton" />
        </View>
      </Screen>
    );
  }

  if (vm.status === "notFound" || vm.status === "expired") {
    return (
      <Screen testID="invite-screen">
        <View style={styles.column} testID="invite-column">
          <EmptyState
            actionLabel={t("invite.goHome")}
            icon="email-alert-outline"
            message={t(
              vm.status === "expired" ? "invite.expired" : "invite.notFound",
            )}
            onAction={vm.onGoHome}
            testID="invite-unavailable"
            title={t("invite.unavailableTitle")}
            tone="expense"
          />
        </View>
      </Screen>
    );
  }

  if (vm.status === "error" || !vm.invite) {
    return (
      <Screen testID="invite-screen">
        <View style={styles.column} testID="invite-column">
          <ErrorState
            message={t("common.errors.generic")}
            onRetry={vm.onRetry}
            retryLabel={t("common.actions.tryAgain")}
            testID="invite-error"
          />
        </View>
      </Screen>
    );
  }

  const { invite } = vm;

  return (
    <Screen testID="invite-screen">
      <View style={styles.column} testID="invite-column">
        <IconTile
          label={invite.initial}
          size="lg"
          testID="invite-tile"
          tone={invite.tone}
        />
        <Text.Caption align="center" value={t("invite.title")} />
        <Text.Title
          align="center"
          testID="invite-family-name"
          value={invite.familyName}
        />
        <Text.Body
          align="center"
          tone="secondary"
          value={t("invite.sentTo", { email: invite.email })}
        />

        {invite.canAccept ? null : (
          <Card padding="sm" testID="invite-mismatch">
            <Text.Body
              tone="expense"
              value={t("invite.notForYou", { email: invite.email })}
            />
          </Card>
        )}

        {vm.acceptErrorKey ? (
          <Text.Body
            align="center"
            testID="invite-accept-error"
            tone="expense"
            value={t(vm.acceptErrorKey, { email: invite.email })}
          />
        ) : null}

        <View style={styles.actions}>
          <Button.Primary
            disabled={!invite.canAccept}
            fullWidth
            label={t("invite.accept")}
            loading={vm.isAccepting}
            onPress={vm.onAccept}
            size="lg"
            testID="invite-accept"
          />
          <Button.Secondary
            fullWidth
            label={t("invite.decline")}
            onPress={vm.onDecline}
            size="lg"
            testID="invite-decline"
          />
        </View>
      </View>
    </Screen>
  );
}

export default Invite;
