import { useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/createTransactionUseCase";
import { decimalStringToCents } from "@data/models/financial/money";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

// Mirrors the datasource conversion so a typo is reported in the form, not swallowed.
function isValidAmount(text: string) {
  try {
    decimalStringToCents(text);
    return true;
  } catch {
    return false;
  }
}

function useForm() {
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(
    undefined,
  );
  const [value, setValue] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [owner, setOwner] = useState<OwnerType | undefined>(undefined);
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<TransactionType | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = {
    accountId: {
      label: "Account ID",
      onChange: setAccountId,
      value: accountId,
    },
    category: { label: "Category", onChange: setCategory, value: category },
    categoryId: {
      label: "Category ID",
      onChange: setCategoryId,
      value: categoryId,
    },
    description: {
      label: "Description",
      onChange: setDescription,
      value: description,
    },
    owner: { label: "Owner", onChange: setOwner, value: owner },
    ownerId: { label: "Owner ID", onChange: setOwnerId, value: ownerId },
    transactionDate: {
      label: "Transaction Date",
      onChange: setTransactionDate,
      value: transactionDate,
    },
    type: { label: "Type", onChange: setType, value: type },
    value: { label: "Value", onChange: setValue, value: value },
  };

  function validateForm(
    owners: OwnerDTO[],
  ): CreateTransactionUseCaseParams | undefined {
    const errors: Record<string, string> = {};

    const fieldsToValidate = {
      accountId,
      categoryId,
      description,
      transactionDate,
      value,
    };

    Object.keys(fieldsToValidate).forEach((key) => {
      if (!fieldsToValidate[key as keyof typeof fieldsToValidate]) {
        errors[key] = `${fields[key as keyof typeof fields].label} is required`;
      }
    });

    if (!errors.value && !isValidAmount(value!)) {
      errors.value = `${fields.value.label} must be a valid amount`;
    }

    if (Object.keys(errors).length) {
      setErrors(errors);
      return;
    }

    setErrors({});

    return {
      accountId: accountId!,
      category: category ?? "",
      categoryId: categoryId!,
      date: transactionDate!.toISOString(),
      description,
      owner: owner ?? owners[0].type,
      ownerId: ownerId ?? owners[0].id,
      type: type ?? TransactionType.EXPENSE,
      value: value!,
    };
  }

  return { errors, fields, validateForm };
}

export default useForm;
