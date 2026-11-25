import StockDTO from "@application/dto/stock/StockDTO";

export interface StockBarcodeLookupDTO {
  code: string;
  matches: StockBarcodeMatchDTO[];
}

export interface StockBarcodeMatchDTO {
  item: StockDTO;
  owner: string;
  ownerId: string;
  ownerName: string;
  readOnly: boolean;
}
