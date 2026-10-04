import { useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface AccountFormValues {
  balance: number;
  icon: string;
  id?: string;
  name: string;
  owner: string;
  ownerId: string;
  status: string;
}

export interface UseFormProps {
  initialValues?: {
    balance?: string;
    icon?: string;
    id?: string;
    name?: string;
    ownerId?: string;
    status?: string;
  };
}

function useForm(props?: UseFormProps) {
  const [balance, setBalance] = useState(props?.initialValues?.balance ?? "0");
  const [icon, setIcon] = useState(props?.initialValues?.icon ?? "bank");
  const [name, setName] = useState(props?.initialValues?.name ?? "");
  const [ownerId, setOwnerId] = useState<string | undefined>(
    props?.initialValues?.ownerId,
  );
  const [status, setStatus] = useState(
    props?.initialValues?.status ?? AccountStatus.ACTIVE,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = {
    balance: { label: "Balance", onChange: setBalance, value: balance },
    icon: { label: "Icon", onChange: setIcon, value: icon },
    name: { label: "Name", onChange: setName, value: name },
    ownerId: { label: "Owner", onChange: setOwnerId, value: ownerId },
    status: { label: "Status", onChange: setStatus, value: status },
  };

  function validateForm(owners: OwnerDTO[]): AccountFormValues | undefined {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    const parsedBalance = parseFloat(balance);
    if (!balance.trim()) {
      newErrors.balance = "Balance is required";
    } else if (isNaN(parsedBalance)) {
      newErrors.balance = "Balance must be a valid number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return undefined;
    }

    setErrors({});

    const selectedOwnerId = ownerId ?? owners[0]?.id;
    const selectedOwner = owners.find((o) => o.id === selectedOwnerId);
    const ownerType = selectedOwner?.type ?? OwnerType.USER;

    return {
      balance: parsedBalance,
      icon,
      id: props?.initialValues?.id,
      name,
      owner: ownerType,
      ownerId: selectedOwnerId,
      status,
    };
  }

  return { errors, fields, validateForm };
}

export default useForm;
