export interface IRecentTransactionDTO {
  categoryColor?: string;
  categoryIcon?: string;
  categoryName: string;
  date: string;
  description: string;
  id: string;
  type: string;
  // Integer cents, always positive: the sign comes from `type`.
  value: number;
}

class RecentTransactionDTO implements IRecentTransactionDTO {
  categoryColor?: string;
  categoryIcon?: string;
  categoryName: string;
  date: string;
  description: string;
  id: string;
  type: string;
  value: number;

  constructor(params: IRecentTransactionDTO) {
    this.categoryColor = params.categoryColor;
    this.categoryIcon = params.categoryIcon;
    this.categoryName = params.categoryName;
    this.date = params.date;
    this.description = params.description;
    this.id = params.id;
    this.type = params.type;
    this.value = params.value;
  }
}

export default RecentTransactionDTO;
