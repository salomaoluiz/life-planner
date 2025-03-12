import { Image } from "expo-image";
import { Suspense, useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

import image from "@assets/images/error_boundary.png";
import { ErrorBoundaryFallBackProps } from "@infrastructure/monitoring/types";
import { asyncStorage, StorageKeys } from "@infrastructure/storage";
import {
  fallbackLanguage,
  translations,
} from "@presentation/i18n/translations";

import styles from "./styles";

type TranslationKeys = keyof typeof translations;

function Index({ retry }: ErrorBoundaryFallBackProps) {
  const [translation, setTranslation] =
    useState<TranslationKeys>(fallbackLanguage);

  async function getTranslation() {
    const storageFallbackLanguage = (await asyncStorage.getString(
      StorageKeys.string.FALLBACK_LANGUAGE,
    )) as TranslationKeys;

    if (storageFallbackLanguage) {
      setTranslation(storageFallbackLanguage);
    }
  }

  const tObject = translations[translation];

  useEffect(() => {
    getTranslation();
  }, []);

  function onButtonPress() {
    retry();
  }

  return (
    <Suspense>
      <View style={styles.container}>
        <Image
          contentFit={"contain"}
          source={image}
          style={styles.image}
          transition={1000}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title} testID={"globalBoundary_title"}>
            {tObject.translation.errors.generic.title}
          </Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text
            style={styles.description}
            testID={"globalBoundary_description"}
          >
            {tObject.translation.errors.generic.description}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={onButtonPress}
            testID={"globalBoundary_button"}
            title={tObject.translation.errors.generic.button.label}
          />
        </View>
      </View>
    </Suspense>
  );
}

export default Index;
