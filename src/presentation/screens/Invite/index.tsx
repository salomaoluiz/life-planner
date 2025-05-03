import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { JoinFamilyMemberUseCaseParams } from "@application/useCases/cases/familyMember/joinFamilyMemberUseCase";
import { Button, Spacer, Text } from "@components";
import { useMutation, useQuery } from "@infrastructure/fetcher";

import FamilyViewModel from "./models/FamilyViewModel";
import getStyles from "./styles";
import { decodeRouteParams } from "./utils";

function Invite() {
  const routeParams = useLocalSearchParams<{ token: string }>();
  const { styles, theme } = getStyles();

  const { data } = useQuery<FamilyViewModel | undefined>({
    cacheKey: [useCases.getFamilyByIdUseCase.uniqueName],
    fetch: async () => {
      const decoded = await decodeRouteParams(routeParams);
      const userDTO = await useCases.getUserUseCase.execute();

      const familyDTO = await useCases.getFamilyByIdUseCase.execute({
        familyId: decoded.familyId,
      });
      return new FamilyViewModel(familyDTO, userDTO, decoded);
    },
  });

  const joinFamily = useMutation<JoinFamilyMemberUseCaseParams, void>({
    cacheKey: [useCases.joinFamilyMemberUseCase.uniqueName],
    fetch: useCases.joinFamilyMemberUseCase.execute,
  });

  useEffect(() => {
    if (joinFamily.status === "success") {
      router.replace("/(app)/(tabs)/index");
    }
  }, [joinFamily.status]);

  if (!data) {
    return (
      <View>
        <Text.Title value={"Loading"} />
      </View>
    );
  }

  function onAccept() {
    joinFamily.mutate({ inviteToken: routeParams.token });
  }

  function onDecline() {
    router.replace("/(app)/(tabs)/index");
  }

  return (
    <View style={styles.container}>
      <Text.Display value={`You have been invited to join the family`} />
      <Text.Headline value={data.familyName} />
      <Spacer direction={"vertical"} size={"large"} />
      {!data.isSamePerson ? (
        <Text.Headline value={"Looks like this is invite is not for you"} />
      ) : null}
      <Spacer direction={"vertical"} size={"large"} />
      <View style={styles.buttonContainer}>
        <Button.Filled
          disabled={!data.isSamePerson}
          label={"Accept"}
          onPress={onAccept}
        />
        <Spacer direction={"horizontal"} size={"large"} />
        <Button.Outlined
          customStyles={{
            textColor: theme.colors.error,
          }}
          label={"Decline"}
          onPress={onDecline}
        />
      </View>
    </View>
  );
}

export default Invite;
