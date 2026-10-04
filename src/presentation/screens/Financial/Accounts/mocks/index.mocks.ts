import AccountDTO, { IAccountDTO } from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import FinancialAccountViewModel from "../models/FinancialAccountViewModel";

const owners = [
  new OwnerDTO({ id: "owner-1", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "owner-2", name: "Test Family", type: OwnerType.FAMILY }),
];

function makeAccountDTO(overrides: Partial<IAccountDTO> = {}) {
  return new AccountDTO({
    balance: 1500.5,
    icon: "bank",
    id: "acc-1",
    name: "Checking",
    owner: "USER",
    ownerId: "owner-1",
    status: "ACTIVE",
    ...overrides,
  });
}

function makeAccountViewModel(overrides: Partial<IAccountDTO> = {}) {
  return new FinancialAccountViewModel(makeAccountDTO(overrides), owners);
}

export { makeAccountDTO, makeAccountViewModel, owners };
