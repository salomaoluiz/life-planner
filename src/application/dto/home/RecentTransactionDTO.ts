export interface IRecentTransactionDTO {
  categoryColor?: string;
  categoryIcon?: string;
  categoryName: string;
  date: string;
  description: string;
  id: string;
  // Unpaid and past its date: the list shows the overdue badge (spec 033).
  isOverdue?: boolean;
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
  isOverdue: boolean;
  type: string;
  value: number;

  constructor(params: IRecentTransactionDTO) {
    this.categoryColor = params.categoryColor;
    this.categoryIcon = params.categoryIcon;
    this.categoryName = params.categoryName;
    this.date = params.date;
    this.description = params.description;
    this.id = params.id;
    this.isOverdue = params.isOverdue ?? false;
    this.type = params.type;
    this.value = params.value;
  }
}

export default RecentTransactionDTO;
