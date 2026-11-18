import { locationQrPrintHtml } from "./locationQrPrint";

const matrix = [
  [true, false],
  [false, true],
];

it("SHOULD build an A6 page with the escaped name, the hint and the QR path", () => {
  const html = locationQrPrintHtml({
    hint: "Aponte a câmera para dar baixa",
    matrix,
    name: "Despensa <b>",
  });

  expect(html).toContain("size: A6");
  expect(html).toContain("Despensa &lt;b&gt;");
  expect(html).toContain("Aponte a câmera para dar baixa");
  expect(html).toContain("M2 2h1v1h-1zM3 3h1v1h-1z");
});
