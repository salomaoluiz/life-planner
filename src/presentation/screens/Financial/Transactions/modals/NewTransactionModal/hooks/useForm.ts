import { useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/createTransactionUseCase";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

function useForm() {
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(
    undefined,
  );
  const [value, setValue] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [owner, setOwner] = useState<OwnerType | undefined>(undefined);
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<TransactionType | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = {
    category: { label: "Category", onChange: setCategory, value: category },
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
      category,
      description,
      transactionDate,
      value,
    };

    Object.keys(fieldsToValidate).forEach((key) => {
      if (!fieldsToValidate[key as keyof typeof fieldsToValidate]) {
        errors[key] = `${fields[key as keyof typeof fields].label} is required`;
      }
    });

    if (Object.keys(errors).length) {
      setErrors(errors);
      return;
    }

    setErrors({});

    return {
      category: category!,
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
