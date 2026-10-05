const home = {
  filter: {
    all: "Tudo",
    personal: "Pessoal",
  },
  greeting: {
    afternoon: "Boa tarde, {{name}}",
    afternoonNoName: "Boa tarde",
    evening: "Boa noite, {{name}}",
    eveningNoName: "Boa noite",
    morning: "Bom dia, {{name}}",
    morningNoName: "Bom dia",
  },
  stock: {
    addItem: "Adicionar item",
    count: "{{count}} itens",
    empty: "Seu estoque está vazio",
    expired: "Vencido",
    expiresIn: "Vence em {{count}} dias",
    expiresToday: "Hoje",
    expiresTomorrow: "Amanhã",
    nothingExpiring: "Nada vencendo em breve",
    subtitle: "{{quantity}} {{unit}} · {{ownerName}}",
    title: "Estoque",
  },
  summary: {
    expenses: "Despesas",
    income: "Receitas",
    title: "Saldo de {{month}}",
  },
  transactions: {
    add: "Adicionar transação",
    emptyMessage:
      "Adicione sua primeira receita ou despesa para ver seu mês aqui.",
    emptyTitle: "Nenhuma transação ainda",
    subtitle: "{{category}} · {{date}}",
    title: "Últimas transações",
  },
};

export default home;
