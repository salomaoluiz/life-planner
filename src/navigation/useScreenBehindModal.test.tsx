import { Stack, Tabs, useGlobalSearchParams, useRouter } from "expo-router";
import { act, renderRouter, screen } from "expo-router/testing-library";
import { Text } from "react-native";

import useScreenBehindModal from "./useScreenBehindModal";

function AppLayout() {
  const { ready } = useScreenBehindModal();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" />
      </Stack>
      {ready ? null : <Text testID="cover">cover</Text>}
    </>
  );
}

function CloseButton() {
  const router = useRouter();

  return (
    <Text onPress={() => router.back()} testID="close">
      close
    </Text>
  );
}

function label(name: string) {
  return function Screen() {
    return <Text testID={name}>{name}</Text>;
  };
}

function Modal() {
  const params = useGlobalSearchParams();

  return (
    <Text testID="modal">
      {JSON.stringify({ ...params, modal: undefined })}
    </Text>
  );
}

const routes = {
  "(app)/(modals)/[...modal]": () => (
    <>
      <Modal />
      <CloseButton />
    </>
  ),
  "(app)/(modals)/_layout": () => (
    <Stack screenOptions={{ headerShown: false }} />
  ),
  "(app)/(tabs)/_layout": () => <Tabs screenOptions={{ headerShown: false }} />,
  "(app)/(tabs)/family/index": label("family"),
  "(app)/(tabs)/financial/overview": label("overview"),
  "(app)/(tabs)/financial/transaction": label("transaction"),
  "(app)/(tabs)/index": label("home"),
  "(app)/(tabs)/settings": label("settings"),
  "(app)/(tabs)/stock/index": label("stock"),
  "(app)/_layout": AppLayout,
  _layout: () => <Stack screenOptions={{ headerShown: false }} />,
};

// The screen behind a transparent modal is aria-hidden, so look it up including hidden elements.
function behind(id: string) {
  return screen.queryByTestId(id, { includeHiddenElements: true });
}

function open(initialUrl: string) {
  return renderRouter(routes, { initialUrl });
}

describe("fresh load of a modal URL", () => {
  it("SHOULD show the screen behind AND close onto it", () => {
    const view = open("/financial/overview/add_new_transaction");

    expect(behind("overview")).toBeTruthy();
    expect(screen.getByTestId("modal")).toBeTruthy();
    expect(view.getPathname()).toBe("/financial/overview/add_new_transaction");

    act(() => screen.getByTestId("close").props.onPress());

    expect(view.getPathname()).toBe("/financial/overview");
    expect(screen.queryByTestId("modal")).toBeNull();
  });

  it("SHOULD put the invite over Family AND keep the token", () => {
    const view = open("/invite?token=abc%20d");

    expect(behind("family")).toBeTruthy();
    expect(view.getPathname()).toBe("/family/invite");
    expect(view.getSearchParams()).toMatchObject({ token: "abc d" });
  });

  it.each([
    ["/foo/add_new_transaction", "/add_new_transaction"],
    ["/financial/account/add_new_account", "/add_new_account"],
  ])("SHOULD show Home behind WHEN the base is invalid (%s)", (url, path) => {
    const view = open(url);

    expect(behind("home")).toBeTruthy();
    expect(view.getPathname()).toBe(path);
  });

  it("SHOULD keep the query params of an edit", () => {
    const view = open("/financial/transaction/add_new_transaction?id=7");

    expect(behind("transaction")).toBeTruthy();
    expect(view.getSearchParams()).toMatchObject({ id: "7" });
  });

  it("SHOULD put the versions modal over Settings", () => {
    open("/settings/versions");

    expect(behind("settings")).toBeTruthy();
  });

  it("SHOULD leave a plain screen URL alone", () => {
    const view = open("/financial/overview");

    expect(behind("overview")).toBeTruthy();
    expect(screen.queryByTestId("modal")).toBeNull();
    expect(screen.queryByTestId("cover")).toBeNull();
    expect(view.getPathname()).toBe("/financial/overview");
  });

  it("SHOULD restore only once", () => {
    const view = open("/stock/quick_add");

    expect(screen.getAllByTestId("modal")).toHaveLength(1);
    expect(view.getPathname()).toBe("/stock/quick_add");
  });

  it("SHOULD not restore WHEN the last segment is not a modal", () => {
    const view = open("/foo/bar");

    expect(view.getPathname()).toBe("/foo/bar");
  });
});

it("SHOULD not rebuild the stack WHEN the user is signed out", () => {
  const view = renderRouter(
    {
      ...routes,
      "(app)/_layout": function SignedOut() {
        useScreenBehindModal(false);

        return <Stack screenOptions={{ headerShown: false }} />;
      },
    },
    { initialUrl: "/financial/overview/add_new_transaction" },
  );

  expect(view.getPathname()).toBe("/financial/overview/add_new_transaction");
  expect(behind("overview")).toBeNull();
});

describe("route ranking", () => {
  it.each([
    ["/financial/overview", "overview"],
    ["/financial/transaction", "transaction"],
    ["/stock", "stock"],
    ["/settings", "settings"],
  ])("SHOULD keep %s on its static screen", (url, id) => {
    open(url);

    expect(behind(id)).toBeTruthy();
    expect(screen.queryByTestId("modal")).toBeNull();
  });
});
