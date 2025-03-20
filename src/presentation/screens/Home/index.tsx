import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { useCases } from "@application/useCases";
import { CreateFamilyUseCaseParams } from "@application/useCases/cases/family/createFamilyUseCase";
import {
  InviteFamilyMemberUseCaseParams,
  InviteFamilyMemberUseCaseResponse,
} from "@application/useCases/cases/familyMember/inviteFamilyMemberUseCase";
import { JoinFamilyMemberUseCaseParams } from "@application/useCases/cases/familyMember/joinFamilyMemberUseCase";
import { Button, Text, TextInput } from "@components";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";

function Home() {
  const [familyName, setFamilyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");

  const getFamilies = useQuery<FamilyEntity[]>({
    cacheKey: [useCases.getFamiliesUseCase.uniqueName],
    fetch: useCases.getFamiliesUseCase.execute,
  });

  const logout = useMutation<void, void>({
    cacheKey: [useCases.logoutUseCase.uniqueName],
    fetch: useCases.logoutUseCase.execute,
  });

  const createFamily = useMutation<CreateFamilyUseCaseParams, void>({
    cacheKey: [useCases.createFamilyUseCase.uniqueName],
    fetch: async (params: CreateFamilyUseCaseParams) =>
      useCases.createFamilyUseCase.execute(params),
  });

  const inviteFamilyMember = useMutation<
    InviteFamilyMemberUseCaseParams,
    InviteFamilyMemberUseCaseResponse
  >({
    cacheKey: [useCases.inviteFamilyMemberUseCase.uniqueName],
    fetch: useCases.inviteFamilyMemberUseCase.execute,
  });

  const joinFamilyMember = useMutation<JoinFamilyMemberUseCaseParams, void>({
    cacheKey: [useCases.joinFamilyMemberUseCase.uniqueName],
    fetch: useCases.joinFamilyMemberUseCase.execute,
  });

  useEffect(() => {}, [inviteFamilyMember.data]);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View>
        <Text.Label customStyles={{ color: "#000" }} value={"Family Name"} />
        <TextInput.Outlined onChangeText={setFamilyName} value={familyName} />
        <View style={{ height: 10 }} />
        <Text.Label customStyles={{ color: "#000" }} value={"Invite Email"} />
        <TextInput.Outlined onChangeText={setInviteEmail} value={inviteEmail} />
        <Text.Label customStyles={{ color: "#000" }} value={"Invite Token"} />
        <TextInput.Outlined onChangeText={setInviteToken} value={inviteToken} />
      </View>
      <View style={{ height: 10 }} />
      <Button.Filled
        label={"Logout"}
        onPress={() => {
          logout.mutate();
        }}
        testID={"logout_button"}
      />
      <View style={{ height: 10 }} />
      <Button.Filled
        label={"Invite Family Member"}
        onPress={() => {
          inviteFamilyMember.mutate({
            email: "salomao.luiz.28@gmail.com",
            familyId: getFamilies.data?.[0].id ?? "",
          });
        }}
      />
      <View style={{ height: 10 }} />
      <Button.Filled
        label={"Join Family Member"}
        onPress={() => {
          joinFamilyMember.mutate({
            inviteToken,
          });
        }}
      />
      <View style={{ height: 10 }} />
      <Button.Filled
        label={"Create Family"}
        onPress={() => {
          createFamily.mutate({ name: familyName });
          setFamilyName("");
        }}
        testID={"create_family_button"}
      />
      <View style={{ height: 10 }} />
      <Button.Filled
        label={"Get Families"}
        onPress={() => {
          getFamilies.refetch();
        }}
        testID={"create_family_button"}
      />
      <View style={{ height: 10 }} />
    </ScrollView>
  );
}

export default Home;
