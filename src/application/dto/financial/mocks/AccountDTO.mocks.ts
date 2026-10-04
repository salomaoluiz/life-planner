import AccountEntity, {
  AccountStatus,
} from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import AccountDTO, { IAccountDTO } from "../AccountDTO";

const defaultProps: IAccountDTO = {
  balance: 15000,
  icon: "bank-icon",
  id: "2be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  name: "Savings Account",
  owner: "USER",
  ownerId: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  status: "ACTIVE",
};

const defaultAccountEntity = new AccountEntity({
  balance: defaultProps.balance,
  icon: defaultProps.icon,
  id: defaultProps.id,
  name: defaultProps.name,
  owner: defaultProps.owner as OwnerType,
  ownerId: defaultProps.ownerId,
  status: defaultProps.status as AccountStatus,
});

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(entity: AccountEntity = defaultAccountEntity) {
  return AccountDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

export { mocks, setupFromEntity, spies };
