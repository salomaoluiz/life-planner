const errors = {
  default: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again later.",
    button: {
      label: "Try again",
    },
  },
  business: {
    auth: {
      user_not_logged: {
        title: "You are not logged in",
      },
    },
    default: {
      title: "We're sorry, we didn't expect this to happen",
    },
  },
  generic: {
    default: {
      title: "An error occurred",
    },
  },
};

export default errors;
