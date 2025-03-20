import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { useCases } from "@application/useCases";
import { CreateFamilyUseCaseParams } from "@application/useCases/cases/family/createFamilyUseCase";
import { Button, Card, Spacer, Text, TextInput } from "@components";
import { useMutation } from "@infrastructure/fetcher";

import getStyles from "./styles";

function AddNewFamilyModal() {
  const { styles, theme } = getStyles();
  const [familyName, setFamilyName] = useState("");

  const createFamily = useMutation<CreateFamilyUseCaseParams, void>({
    cacheKey: [useCases.createFamilyUseCase.uniqueName],
    fetch: useCases.createFamilyUseCase.execute,
  });

  useEffect(() => {
    if (createFamily.status === "success") {
      router.back();
    }
  }, [createFamily.status]);

  async function createNewFamily() {
    createFamily.mutate({
      name: familyName,
    });
  }

  function cancelCreateFamily() {
    router.back();
  }

  return (
    <>
      <Pressable onPress={cancelCreateFamily} style={styles.backdrop} />
      <Card customStyles={styles.container}>
        <View style={styles.titleContainer}>
          <Text.Title value={"Add the family name"} />
        </View>
        <View style={styles.inputContainer}>
          <TextInput.Outlined onChangeText={setFamilyName} value={familyName} />
        </View>
        <Spacer direction={"vertical"} size={"medium"} />
        <View style={styles.buttonsContainer}>
          <Button.Filled label={"Create"} onPress={createNewFamily} />
          <Spacer direction={"horizontal"} size={"xxxlarge"} />
          <Button.Text
            customStyles={{
              textColor: theme.colors.error,
            }}
            label={"Cancel"}
            onPress={cancelCreateFamily}
          />
        </View>
      </Card>
    </>
  );
}

export default AddNewFamilyModal;
