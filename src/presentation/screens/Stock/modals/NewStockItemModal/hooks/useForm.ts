import { useState } from "react";

import StockOwnersDTO from "@application/dto/stock/StockOwnersDTO";
import { CreateStockItemUseCaseParams } from "@application/useCases/cases/stock/createStockItemUseCase";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";

function useForm() {
  const [barcode, setBarcode] = useState<string | undefined>(undefined);
  const [brand, setBrand] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    undefined,
  );

  const [notes, setNotes] = useState<string | undefined>(undefined);
  const [openingDate, setOpeningDate] = useState<Date | undefined>(undefined);
  const [owner, setOwner] = useState<StockOwners | undefined>(undefined);
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState(StockUnits.UNIT);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = {
    barcode: { label: "Barcode", onChange: setBarcode, value: barcode },
    brand: { label: "Brand", onChange: setBrand, value: brand },
    description: {
      label: "Description",
      onChange: setDescription,
      value: description,
    },
    expirationDate: {
      label: "Expiration Date",
      onChange: setExpirationDate,
      value: expirationDate,
    },
    notes: { label: "Notes", onChange: setNotes, value: notes },
    openingDate: {
      label: "Opening Date",
      onChange: setOpeningDate,
      value: openingDate,
    },
    owner: { label: "Owner", onChange: setOwner, value: owner },
    ownerId: { label: "Owner ID", onChange: setOwnerId, value: ownerId },
    purchaseDate: {
      label: "Purchase Date",
      onChange: setPurchaseDate,
      value: purchaseDate,
    },
    quantity: { label: "Quantity", onChange: setQuantity, value: quantity },
    unit: { label: "Unit", onChange: setUnit, value: unit },
  };

  function validateForm(
    owners: StockOwnersDTO[],
  ): CreateStockItemUseCaseParams | undefined {
    const errors: Record<string, string> = {};

    if (!description) {
      errors.description = "Description is required";
    }

    if (!quantity) {
      errors.quantity = "Quantity is required";
    }

    if (!unit) {
      errors.unit = "Unit is required";
    }

    if (Object.keys(errors).length) {
      setErrors(errors);
      return;
    }

    setErrors({});

    return {
      barcode,
      brand,
      description,
      expirationDate,
      notes,
      openingDate,
      owner: owner ?? owners[0].type,
      ownerId: ownerId ?? owners[0].id,
      purchaseDate,
      quantity: parseInt(quantity, 10),
      unit,
    };
  }

  return { errors, fields, validateForm };
}

export default useForm;
