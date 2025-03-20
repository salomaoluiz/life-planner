import { useEffect, useState } from "react";
import { View } from "react-native";
import { Banner } from "react-native-paper";

import { useCases } from "@application/useCases";
import { DeleteFamilyMemberUseCaseParams } from "@application/useCases/cases/familyMember/deleteFamilyMemberUseCase";
import { Accordion, Avatar, Button } from "@components";
import { useMutation } from "@infrastructure/fetcher";
import FamilyMemberViewModel from "@screens/Family/models/FamilyMembersViewModel";

import getStyles from "./styles";

interface Props {
  member: FamilyMemberViewModel;
  ownerId: string;
  refetchFamily: () => void;
}
function FamilyMemberCard(props: Props) {
  const { styles, theme } = getStyles();
  const [visible, setVisible] = useState(false);
  const deleteFM = useMutation<DeleteFamilyMemberUseCaseParams, void>({
    cacheKey: [useCases.deleteFamilyMemberUseCase.uniqueName],
    fetch: useCases.deleteFamilyMemberUseCase.execute,
  });

  useEffect(() => {
    if (deleteFM.status === "success") {
      props.refetchFamily();
    }
  }, [deleteFM.status]);

  function onDeleteFamilyMember() {
    deleteFM.mutate({
      id: props.member.memberDto.id,
    });
  }

  return (
    <View style={styles.container}>
      <Accordion.Item
        id={props.member.memberDto.id}
        left={
          <Avatar.Small
            mode={props.member.avatar.mode}
            source={props.member.avatar.source}
          />
        }
        onPress={() => {
          setVisible(!visible);
        }}
        title={props.member.familyMemberName}
      />
      <Banner visible={visible}>
        <View style={styles.buttonsContainer}>
          <Button.Outlined
            customStyles={{ textColor: theme.colors.error }}
            disabled={props.ownerId === props.member.memberDto.id}
            label={"Delete Family Member"}
            onPress={onDeleteFamilyMember}
          />
        </View>
      </Banner>
    </View>
  );
}

export default FamilyMemberCard;
