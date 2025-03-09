import { Button, Text, View } from "react-native";
import { Image } from "expo-image";

import styles from "./styles";
import {
  translations,
  fallbackLanguage,
} from "@presentation/i18n/translations";
import { asyncStorage, StorageKeys } from "@infrastructure/storage";
import { Suspense, useEffect, useState } from "react";

import image from "@assets/images/error_boundary.png";
import { ErrorBoundaryFallBackProps } from "@infrastructure/monitoring/types";

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

  const onButtonPress = () => {
    retry();
  };

  return (
    <Suspense>
      <View style={styles.container}>
        <Image
          source={image}
          contentFit={"contain"}
          transition={1000}
          style={styles.image}
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
            testID={"globalBoundary_button"}
            title={tObject.translation.errors.generic.button.label}
            onPress={onButtonPress}
          />
        </View>
      </View>
    </Suspense>
  );
}

export default Index;
