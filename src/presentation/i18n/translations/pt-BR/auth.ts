const auth = {
  errors: {
    generic: "Algo deu errado. Tente novamente.",
    network:
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
  },
  validation: {
    emailInvalid: "Informe um e-mail válido.",
    emailRequired: "Informe seu e-mail.",
    nameRequired: "Informe seu nome.",
    nameTooLong: "O nome deve ter no máximo 100 caracteres.",
    passwordLength: "A senha deve ter de 8 a 72 caracteres.",
    passwordRequired: "Informe sua senha.",
    passwordsDontMatch: "As senhas não coincidem.",
  },
};

export default auth;
