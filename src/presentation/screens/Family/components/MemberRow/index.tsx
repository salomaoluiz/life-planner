import { View } from "react-native";

import { Avatar, Badge, ListItem } from "@components";
import { IconButton } from "@components/Icon";

import useStyles from "./styles";

export interface Props {
  badge?: { label: string; tone: "accent" | "expense" | "neutral" };
  divider: boolean;
  isPending: boolean;
  name: string;
  onOptionsPress?: () => void;
  optionsLabel?: string;
  photoUrl?: string;
  subtitle?: string;
  testID: string;
  title: string;
}

function MemberRow(props: Props) {
  const { styles } = useStyles();

  return (
    <ListItem
      divider={props.divider}
      leading={
        <Avatar
          name={props.name}
          pending={props.isPending}
          photoUrl={props.photoUrl}
          size="md"
        />
      }
      subtitle={props.subtitle}
      testID={props.testID}
      title={props.title}
      trailing={
        <View style={styles.trailing}>
          {props.badge ? (
            <Badge
              label={props.badge.label}
              testID={`${props.testID}-badge`}
              tone={props.badge.tone}
            />
          ) : null}
          {props.onOptionsPress && props.optionsLabel ? (
            <IconButton
              accessibilityLabel={props.optionsLabel}
              name="dots-horizontal"
              onPress={props.onOptionsPress}
              testID={`${props.testID}-options`}
              variant="plain"
            />
          ) : null}
        </View>
      }
    />
  );
}

export default MemberRow;
