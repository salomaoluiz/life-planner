// TODO: Remove this console log

import { useState } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { CreateFamilyUseCaseParams } from "@application/useCases/cases/family/createFamilyUseCase";
import { DeleteFamilyParams } from "@application/useCases/cases/family/deleteFamilyUseCase";
import { UpdateFamilyUseCaseParams } from "@application/useCases/cases/family/updateFamilyUseCase";
import { Button, Text, TextInput } from "@components";
import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";

function Home() {
  const [familyName, setFamilyName] = useState("");

  const getFamilies = useQuery<FamilyEntity[]>({
    cacheKey: [useCases.getFamiliesUseCase.uniqueName],
    fetch: useCases.getFamiliesUseCase.execute,
  });

  const updateFamily = useMutation<UpdateFamilyUseCaseParams, void>({
    cacheKey: [useCases.updateFamilyUseCase.uniqueName],
    fetch: async (params: UpdateFamilyUseCaseParams) =>
      useCases.updateFamilyUseCase.execute(params),
  });
  const logout = useMutation<void, void>({
    cacheKey: [useCases.logoutUseCase.uniqueName],
    fetch: useCases.logoutUseCase.execute,
  });

  const deleteFamily = useMutation<DeleteFamilyParams, void>({
    cacheKey: [useCases.deleteFamilyUseCase.uniqueName],
    fetch: async (params: DeleteFamilyParams) =>
      useCases.deleteFamilyUseCase.execute(params),
  });

  const createFamily = useMutation<CreateFamilyUseCaseParams, void>({
    cacheKey: [useCases.createFamilyUseCase.uniqueName],
    fetch: async (params: CreateFamilyUseCaseParams) =>
      useCases.createFamilyUseCase.execute(params),
  });

  return (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
      }}
    >
      <Button.Filled
        label={"Logout"}
        onPress={() => {
          logout.mutate();
        }}
        testID={"logout_button"}
      />
      <TextInput.Outlined
        onChangeText={setFamilyName}
        testID={"family"}
        value={familyName}
      />
      <Button.Filled
        label={"Create Family"}
        onPress={() => {
          createFamily.mutate({ name: familyName });
          setFamilyName("");
        }}
        testID={"create_family_button"}
      />
      <Button.Filled
        label={"Get Families"}
        onPress={() => {
          getFamilies.refetch();
        }}
        testID={"create_family_button"}
      />
      {getFamilies.data?.map((family) => (
        <View>
          <Text.Body testID={"body"} value={family.name} />
          <Button.Outlined
            label={`Delete ${family.name}`}
            onPress={() => {
              deleteFamily.mutate({ id: family.id });
            }}
            testID={"delete"}
          />
          <Button.Outlined
            label={`Update ${family.name}`}
            onPress={() => {
              updateFamily.mutate({ id: family.id, name: familyName });
              setFamilyName("");
            }}
            testID={"update"}
          />
        </View>
      ))}
    </View>
  );
}

export default Home;
