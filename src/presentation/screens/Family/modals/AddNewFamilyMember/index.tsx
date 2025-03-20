import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { useCases } from "@application/useCases";
import {
  InviteFamilyMemberUseCaseParams,
  InviteFamilyMemberUseCaseResponse,
} from "@application/useCases/cases/familyMember/inviteFamilyMemberUseCase";
import { Button, Card, Spacer, Text, TextInput } from "@components";
import { useMutation } from "@infrastructure/fetcher";
import {
  FeedbackActions,
  FeedbackNavigationTypes,
} from "@screens/Feedback/BusinessFeedback/actions/types";
import { FeedbackType } from "@screens/Feedback/BusinessFeedback/types";
import { createFeedbackRouteEncoded } from "@screens/Feedback/BusinessFeedback/utils";

import getStyles from "./styles";

function AddNewFamilyMemberModal() {
  const { familyId } = useLocalSearchParams<{ familyId: string }>();
  const { styles, theme } = getStyles();
  const [userEmail, setUserEmail] = useState("");

  const invite = useMutation<
    InviteFamilyMemberUseCaseParams,
    InviteFamilyMemberUseCaseResponse
  >({
    cacheKey: [useCases.inviteFamilyMemberUseCase.uniqueName],
    fetch: useCases.inviteFamilyMemberUseCase.execute,
  });

  async function handleInviteFeedback() {
    const encodedRoute = await createFeedbackRouteEncoded({
      closeButton: {
        action: FeedbackActions.NAVIGATION,
        route: "/family",
        type: FeedbackNavigationTypes.DISMISS_TO,
      },
      message: `The user ${userEmail} has been invited to the family`,
      primaryButton: {
        action: FeedbackActions.COPY_TO_CLIPBOARD,
        label: "Copy token",
        value: `${process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL}/invite?token=${invite.data!.inviteToken}`,
      },
      title: "Invite sent",
      type: FeedbackType.Success,
    });

    router.push({
      params: encodedRoute,
      pathname: "/business_feedback",
    });
  }

  useEffect(() => {
    if (invite.data) {
      handleInviteFeedback();
    }
  }, [invite.data]);

  async function inviteFamilyMember() {
    invite.mutate({
      email: userEmail,
      familyId,
    });
  }

  function cancelInvite() {
    router.back();
  }

  return (
    <>
      <Pressable onPress={cancelInvite} style={styles.backdrop} />
      <Card customStyles={styles.container}>
        <View style={styles.titleContainer}>
          <Text.Title value={"Add the user email"} />
        </View>
        <View style={styles.inputContainer}>
          <TextInput.Outlined onChangeText={setUserEmail} value={userEmail} />
        </View>
        <Spacer direction={"vertical"} size={"medium"} />
        <View style={styles.buttonsContainer}>
          <Button.Filled label={"Invite"} onPress={inviteFamilyMember} />
          <Spacer direction={"horizontal"} size={"xxxlarge"} />
          <Button.Text
            customStyles={{
              textColor: theme.colors.error,
            }}
            label={"Cancel"}
            onPress={cancelInvite}
          />
        </View>
      </Card>
    </>
  );
}

export default AddNewFamilyMemberModal;
