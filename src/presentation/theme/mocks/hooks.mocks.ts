import { renderHook } from "@testing-library/react-native";

import ConfigsDTO from "@application/dto/configs/ConfigsDTO";
import * as fetcher from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import * as loader from "@providers/loader";

import { ThemeProvider, useTheme } from "../";
import * as paper from "../paper/hook";
import * as Provider from "../provider";

// region Mocks
jest.mock("@presentation/theme/paper/hook");
jest.unmock("@presentation/theme");
jest.mock("@infrastructure/fetcher");

const providerLoaderResponse = {
  isLoading: false,
  setIsLoading: jest.fn(),
};

const useQueryFixture = new UseQueryFixture<Partial<ConfigsDTO>>().reset();
const useQueryPendingResponse = useQueryFixture.withStatus("pending").build();
const useMutationFixture = new UseMutationFixture<unknown, void>().reset();
const useMutationResponse = useMutationFixture.build();
// endregion Mocks

// region Spies
jest.spyOn(fetcher, "useQuery").mockReturnValue(useQueryPendingResponse);
jest.spyOn(fetcher, "useMutation").mockReturnValue(useMutationResponse);
jest.spyOn(loader, "useProviderLoader").mockReturnValue(providerLoaderResponse);
jest.spyOn(paper, "default").mockReturnValue(Provider.lightTheme);

// endregion Spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return renderHook(useTheme, { wrapper: ThemeProvider });
}

const mocks = {};

const spies = {};

export { mocks, setup, spies };
