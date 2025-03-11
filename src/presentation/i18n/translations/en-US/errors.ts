const errors = {
  generic: {
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
};

export default errors;
