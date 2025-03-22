import StockDashboardDTO from "@application/dto/home/StockDashboardDTO";
import { difference, Duration } from "@infrastructure/date";

interface IStockDashboardViewModel {
  stockDashboardDTO: StockDashboardDTO;
}

class StockDashboardViewModel {
  get expiredItems() {
    return this.stockDashboardDTO.stockDTOs.filter((item) => {
      if (!item.expirationDate) return;

      return difference(item.expirationDate, new Date(), Duration.days);
    }).length;
  }

  get itemQuantity() {
    return this.stockDashboardDTO.stockDTOs.filter((item) => item.quantity > 0)
      .length;
  }

  private stockDashboardDTO: StockDashboardDTO;

  constructor(params: IStockDashboardViewModel) {
    this.stockDashboardDTO = params.stockDashboardDTO;
  }
}

export default StockDashboardViewModel;
