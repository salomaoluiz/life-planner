import { View } from "react-native";

import { Button, Spacer, Text } from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";

import useInviteViewModel from "./hooks/useInviteViewModel";
import getStyles from "./styles";

function Invite() {
  const { styles, theme } = getStyles();
  const { t } = useTranslation();
  const vm = useInviteViewModel();

  if (vm.status === "loading") {
    return (
      <View style={styles.container}>
        <Skeleton.Box height={48} width={"80%"} />
        <Spacer direction={"vertical"} size={"large"} />
        <Skeleton.Box height={32} width={"60%"} />
      </View>
    );
  }

  if (vm.status === "notFound") {
    return (
      <View style={styles.container}>
        <Text.Headline value={t("invite.notFound")} />
      </View>
    );
  }

  if (vm.status === "expired") {
    return (
      <View style={styles.container}>
        <Text.Headline value={t("invite.expired")} />
      </View>
    );
  }

  if (vm.status === "error" || !vm.invite) {
    return (
      <View style={styles.container}>
        <Text.Headline value={t("errors.generic.description")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text.Display value={t("invite.title")} />
      <Text.Headline value={vm.invite.familyName} />
      <Spacer direction={"vertical"} size={"large"} />
      {!vm.invite.canAccept ? (
        <Text.Headline
          value={t("invite.notForYou", { email: vm.invite.email })}
        />
      ) : null}
      {vm.acceptErrorKey ? (
        <Text.Headline
          value={t(vm.acceptErrorKey, { email: vm.invite.email })}
        />
      ) : null}
      <Spacer direction={"vertical"} size={"large"} />
      <View style={styles.buttonContainer}>
        <Button.Filled
          disabled={!vm.invite.canAccept || vm.isAccepting}
          label={t("invite.accept")}
          loading={vm.isAccepting}
          onPress={vm.onAccept}
        />
        <Spacer direction={"horizontal"} size={"large"} />
        <Button.Outlined
          customStyles={{ textColor: theme.colors.expense }}
          label={t("invite.decline")}
          onPress={vm.onDecline}
        />
      </View>
    </View>
  );
}

export default Invite;
