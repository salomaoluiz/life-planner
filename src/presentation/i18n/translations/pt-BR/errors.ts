const errors = {
  generic: {
    title: "Algo deu errado",
    description:
      "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
    button: {
      label: "Try again",
    },
  },
  business: {
    auth: {
      user_not_logged: {
        title: "Você não está logado",
      },
    },
    default: {
      title: "Desculpe, não esperávamos que isso acontecesse",
    },
  },
};

export default errors;
