const home = {
  filter: {
    all: "All",
    personal: "Personal",
  },
  greeting: {
    afternoon: "Good afternoon, {{name}}",
    afternoonNoName: "Good afternoon",
    evening: "Good evening, {{name}}",
    eveningNoName: "Good evening",
    morning: "Good morning, {{name}}",
    morningNoName: "Good morning",
  },
  stock: {
    addItem: "Add item",
    count: "{{count}} items",
    empty: "Your stock is empty",
    expired: "Expired",
    expiresIn: "In {{count}} days",
    expiresToday: "Today",
    expiresTomorrow: "Tomorrow",
    nothingExpiring: "Nothing expiring soon",
    subtitle: "{{quantity}} {{unit}} · {{ownerName}}",
    title: "Stock",
  },
  summary: {
    expenses: "Expenses",
    income: "Income",
    title: "{{month}} balance",
  },
  transactions: {
    add: "Add transaction",
    emptyMessage: "Add your first income or expense to see your month here.",
    emptyTitle: "No transactions yet",
    subtitle: "{{category}} · {{date}}",
    title: "Latest transactions",
  },
};

export default home;
