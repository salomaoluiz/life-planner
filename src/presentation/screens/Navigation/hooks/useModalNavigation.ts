import { router, usePathname } from "expo-router";

import {
  buildModalPath,
  fallbackBase,
  ModalName,
  splitModalPath,
} from "@screens/Navigation/models/modalPath";

type ModalParams = Record<string, string>;

function currentBase(pathname: string): string {
  const split = splitModalPath(pathname);

  return fallbackBase(
    split ?? { modal: "quick_add", rawBase: pathname || "/" },
  );
}

function useModalNavigation() {
  const base = currentBase(usePathname());

  function target(modal: ModalName, params?: ModalParams) {
    return { params, pathname: buildModalPath(base, modal) } as never;
  }

  return {
    closeModal() {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(base as never);
      }
    },
    openModal(modal: ModalName, params?: ModalParams) {
      router.push(target(modal, params));
    },
    replaceModal(modal: ModalName, params?: ModalParams) {
      router.replace(target(modal, params));
    },
  };
}

export default useModalNavigation;
