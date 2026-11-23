import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";

import {
  BARCODE_TYPES,
  BarcodeScannerProps,
  ScannedCode,
  ScannerStatus,
} from "./types";
import { createWebDetector, isWebScanSupported } from "./webDetector";

export type { BarcodeScannerProps, ScannedCode, ScannerStatus } from "./types";
export { isWebScanSupported } from "./webDetector";

const SCAN_INTERVAL_MS = 300;
const NATIVE_TYPES = [...BARCODE_TYPES];

// The live camera preview filling its parent; see `useScannerPermission` for the state before it can show.
export function BarcodeScannerView(props: BarcodeScannerProps) {
  return Platform.OS === "web" ? (
    <WebScanner {...props} />
  ) : (
    <NativeScanner {...props} />
  );
}

// Camera permission: native asks through expo-camera, the web asks when the stream opens (a refusal reaches `onError`).
export function useScannerPermission(): {
  request: () => Promise<void>;
  status: ScannerStatus;
} {
  const [permission, requestPermission] = useCameraPermissions();

  if (Platform.OS === "web") {
    return {
      request: async () => undefined,
      status: isWebScanSupported() ? "granted" : "unavailable",
    };
  }

  function statusOf(): ScannerStatus {
    if (!permission) {
      return "loading";
    }

    if (permission.granted) {
      return "granted";
    }

    return permission.canAskAgain ? "loading" : "denied";
  }

  return {
    request: async () => {
      await requestPermission();
    },
    status: statusOf(),
  };
}

// One vibration per read, where the platform has haptics (spec 121 FR 5).
export function vibrateOnScan(): void {
  if (Platform.OS === "web") {
    return;
  }

  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success,
  ).catch(() => undefined);
}

function NativeScanner({ onScan, paused, testID, torch }: BarcodeScannerProps) {
  return (
    <CameraView
      barcodeScannerSettings={{ barcodeTypes: NATIVE_TYPES }}
      enableTorch={torch}
      facing="back"
      onBarcodeScanned={
        paused
          ? undefined
          : ({ data, type }) =>
              onScan({ code: data, type: normalizeType(type) })
      }
      style={StyleSheet.absoluteFill}
      testID={testID}
    />
  );
}

// expo-camera reports `upc_e`, `ean13`...; keep them as they come, lower case.
function normalizeType(type: string): string {
  return type.toLowerCase().replace(/[-\s]/g, "");
}

function WebScanner({ onError, onScan, paused, testID }: BarcodeScannerProps) {
  const host = useRef<View>(null);
  const latest = useRef({ onError, onScan });

  latest.current = { onError, onScan };

  useEffect(() => {
    const element = host.current as unknown as HTMLElement | null;
    const detector = createWebDetector();

    if (!element || paused || !detector) {
      return undefined;
    }

    let stopped = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let stream: MediaStream | undefined;
    const video = document.createElement("video");

    video.muted = true;
    video.setAttribute("playsinline", "true");
    video.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;object-fit:cover";
    element.appendChild(video);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(async (opened) => {
        if (stopped) {
          opened.getTracks().forEach((track) => track.stop());

          return;
        }

        stream = opened;
        video.srcObject = opened;
        await video.play();
        timer = setInterval(() => {
          void detector
            .detect(video)
            .then((found: ScannedCode | undefined) => {
              if (found && !stopped) {
                latest.current.onScan(found);
              }
            })
            .catch(() => undefined);
        }, SCAN_INTERVAL_MS);
      })
      .catch(() => latest.current.onError?.("denied"));

    return () => {
      stopped = true;
      clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
      video.remove();
    };
  }, [paused]);

  return <View ref={host} style={styles.web} testID={testID} />;
}

const styles = StyleSheet.create({
  web: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
});
