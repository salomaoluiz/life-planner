import { View } from "react-native";
import { Banner } from "react-native-paper";

import { Accordion, Avatar, Button, Text } from "@components";
import { useTranslation } from "@presentation/i18n";

import useFamilyMemberCardViewModel, {
  Props,
} from "./hooks/useFamilyMemberCardViewModel";
import getStyles from "./styles";

function FamilyMemberCard(props: Props) {
  const { styles, theme } = getStyles();
  const { t } = useTranslation();
  const vm = useFamilyMemberCardViewModel(props);

  return (
    <View style={styles.container}>
      <Accordion.Item
        id={vm.id}
        left={<Avatar.Small mode={vm.avatar.mode} source={vm.avatar.source} />}
        onPress={vm.canExpand ? vm.onToggle : undefined}
        right={
          vm.statusLabelKey ? (
            <Text.Caption value={t(vm.statusLabelKey)} />
          ) : undefined
        }
        title={vm.displayName}
      />
      <Banner visible={vm.isExpanded}>
        <View style={styles.buttonsContainer}>
          {vm.actionLabelKey ? (
            <Button.Outlined
              customStyles={{ textColor: theme.colors.error }}
              disabled={vm.isDeleting}
              label={t(vm.actionLabelKey)}
              onPress={vm.onActionPress}
            />
          ) : null}
        </View>
      </Banner>
    </View>
  );
}

export default FamilyMemberCard;
