import { render } from "@tests";

import { InvoiceField } from "@components";

const onAction = jest.fn();
const onChange = jest.fn();
const options = [
  {
    disabled: true,
    fieldLabel: "Setembro · vence 10/10",
    statusLabel: "Paga",
    statusTone: "neutral" as const,
    subtitle: "Fatura paga, não recebe compras",
    title: "Setembro",
    value: "2026-09",
  },
  {
    disabled: false,
    fieldLabel: "Outubro · vence 10/11",
    statusLabel: "Aberta",
    statusTone: "income" as const,
    subtitle: "Fecha 31/10 · vence 10/11",
    title: "Outubro · pela data",
    value: "2026-10",
  },
  {
    disabled: false,
    fieldLabel: "Novembro · vence 10/12",
    statusLabel: "Futura",
    statusTone: "neutral" as const,
    subtitle: "Fecha 30/11 · vence 10/12",
    title: "Novembro",
    value: "2026-11",
  },
];

function setup(props: Partial<React.ComponentProps<typeof InvoiceField>> = {}) {
  render(
    <InvoiceField
      closeLabel="Fechar"
      label="Fatura"
      onChange={onChange}
      options={options}
      sheetTitle="Em qual fatura entra?"
      testID="invoice"
      value="2026-10"
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onAction, onChange, options, setup };
