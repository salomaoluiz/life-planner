import { renderHook, act, suppressConsoleError } from "@tests";
import {
  loaderContexts,
  LoaderProvider,
  useProviderLoader,
} from "@providers/loader/index";

const setup = () => renderHook(useProviderLoader, { wrapper: LoaderProvider });

it("SHOULD keep loading as false WHEN no context is loading", () => {
  const { result } = setup();

  act(() => {
    result.current.setIsLoading(false, "i18n");
  });

  expect(result.current.isLoading).toBeFalsy();
});

it("SHOULD keep loading as true WHEN at least one context is loading", () => {
  const { result } = setup();

  act(() => {
    result.current.setIsLoading(true, "i18n");
  });

  expect(result.current.isLoading).toBeTruthy();
});

it("SHOULD have defined the loader contexts default values", () => {
  expect(loaderContexts).toEqual({
    i18n: true,
  });
});

it('SHOULD throw if "context" is not found', () => {
  const { result } = setup();

  suppressConsoleError();
  const render = () =>
    act(() => result.current.setIsLoading(true, "notValid" as never));

  expect(render).toThrow(new Error("Context notValid not found"));
});

it('SHOULD throw an error WHEN "useLoader" is used outside "LoaderProvider"', () => {
  suppressConsoleError();
  const render = () => renderHook(() => useProviderLoader());

  expect(render).toThrow(
    new Error("useLoader must be used within an LoaderProvider"),
  );
});
