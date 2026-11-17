import { TextField } from "@components";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import {
  applyInput,
  QuantityInput,
  QuantityMode,
} from "@domain/entities/stock/stockQuantity";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";

interface Props {
  error?: string;
  helper?: string;
  input: QuantityInput;
  label: string;
  onChange: (input: QuantityInput) => void;
  testID?: string;
  unit: StockUnits;
}

// Spec 116 FR 3: kg/L items are typed in g/ml and switch to kg/L from 1000; the unit shows next to the label.
function QuantityField(props: Props) {
  const { t } = useTranslation();
  const symbolKey = ((): TranslationKeys => {
    if (props.unit === StockUnits.UNIT) {
      return "common.units.unit";
    }

    const large = props.input.mode === QuantityMode.LARGE;

    if (props.unit === StockUnits.KILOGRAM) {
      return large ? "common.units.kilogram" : "common.units.gram";
    }

    return large ? "common.units.liter" : "common.units.milliliter";
  })();

  return (
    <TextField
      error={props.error}
      helper={props.helper}
      keyboardType={
        props.unit === StockUnits.UNIT ? "number-pad" : "decimal-pad"
      }
      label={`${props.label} (${t(symbolKey)})`}
      onChangeText={(typed) =>
        props.onChange(applyInput(props.input, typed, props.unit))
      }
      testID={props.testID}
      value={props.input.text}
    />
  );
}

export default QuantityField;
