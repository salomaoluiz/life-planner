import * as Sentry from "@sentry/react-native";

jest.mock("@sentry/react-native");

import addBreadcrumb from "./addBreadcrumb";

const addBreadcrumbSpy = jest.spyOn(Sentry, "addBreadcrumb");

it("SHOULD call Sentry.addBreadcrumb", () => {
  const breadcrumb = {
    category: "category",
    data: { data: "data" },
    level: "error" as const,
    message: "message",
  };

  addBreadcrumb(breadcrumb);

  expect(addBreadcrumbSpy).toHaveBeenCalledTimes(1);
  expect(addBreadcrumbSpy).toHaveBeenCalledWith(breadcrumb);
});
