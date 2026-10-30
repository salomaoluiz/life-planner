import { render, screen } from "@tests";

import useVersionInfo from "@presentation/hooks/useVersionInfo";
import { versionInfo } from "@presentation/hooks/useVersionInfo/mocks/useVersionInfo.mocks";

import loginTestIds from "../testIds";
import VersionLine from "./VersionLine";

jest.mock("@presentation/hooks/useVersionInfo");

it("SHOULD show the versions and the environment as one plain line", () => {
  jest.mocked(useVersionInfo).mockReturnValue(versionInfo());
  render(<VersionLine />);

  expect(screen.getByTestId(loginTestIds.versions).props.children).toBe(
    'versions.footer {"api":"1.12.0","app":"1.4.0"} · versions.env.production',
  );
});

it("SHOULD omit the environment WHILE the API has not answered", () => {
  jest.mocked(useVersionInfo).mockReturnValue(versionInfo({ info: null }));
  render(<VersionLine />);

  expect(screen.getByTestId(loginTestIds.versions).props.children).toBe(
    'versions.footer {"api":"versions.unavailableValue","app":"1.4.0"}',
  );
});
