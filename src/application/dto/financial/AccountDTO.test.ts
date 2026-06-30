import AccountDTO from "./AccountDTO";
import { mocks, setupFromEntity } from "./mocks/AccountDTO.mocks";

it("SHOULD the AccountDTO fromEntity return a DTO object", () => {
  const result = setupFromEntity();

  expect(result).toBeInstanceOf(AccountDTO);
  expect(result).toHaveProperty("balance", mocks.defaultProps.balance);
  expect(result).toHaveProperty("icon", mocks.defaultProps.icon);
  expect(result).toHaveProperty("id", mocks.defaultProps.id);
  expect(result).toHaveProperty("name", mocks.defaultProps.name);
  expect(result).toHaveProperty("owner", mocks.defaultProps.owner);
  expect(result).toHaveProperty("ownerId", mocks.defaultProps.ownerId);
  expect(result).toHaveProperty("status", mocks.defaultProps.status);
});
