import { useMemo } from "react";
import { View } from "react-native";

import { Accordion, Avatar, Spacer, Text } from "@components";
import AddNewFamilyMember from "@screens/Family/components/AddNewFamilyMember";
import DeleteFamily from "@screens/Family/components/DeleteFamily";
import FamilyMemberCard from "@screens/Family/containers/FamilyMemberCard";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import getStyles from "./styles";

export interface Props {
  family: FamilyViewModel;
  onAddNewFamilyMember: () => void;
  onDeleteFamily: () => void;
  refetchFamilies: () => void;
}

function FamilyCard(props: Props) {
  const { styles } = getStyles();

  const Content = useMemo(() => {
    return (
      <View style={styles.contentContainer}>
        {props.family?.familyMembers.map((member) => {
          return (
            <FamilyMemberCard
              member={member}
              ownerId={props.family.owner?.memberDto.id}
              refetchFamily={props.refetchFamilies}
            />
          );
        })}
        <Spacer direction={"vertical"} size={"large"} />
        <AddNewFamilyMember onPress={props.onAddNewFamilyMember} />
        <Spacer direction={"vertical"} size={"small"} />
        <DeleteFamily onPress={props.onDeleteFamily} />
      </View>
    );
  }, []);

  return (
    <Accordion.Container
      content={Content}
      header={<Text.Title value={props.family.familyName} />}
      left={
        <Avatar.Regular
          mode={props.family.avatar.mode}
          source={props.family.avatar.source}
        />
      }
    />
  );
}

export default FamilyCard;
