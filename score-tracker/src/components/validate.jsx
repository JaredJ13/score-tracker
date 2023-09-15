export const validateUserInput = (inputs) => {
  let validation = { errors: false, errorMessages: [] };

  inputs.map((input) => {
    if (input.type === "email") {
      // check if email is valid with regex
      let valid =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!input.value.match(valid)) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "email",
          message: "Invalid email",
        });
      }
    } else if (input.type === "password") {
      if (
        input.value.trim("") === "" ||
        input.value === null ||
        input.value === undefined
      ) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "password",
          message: "Invalid password",
        });
      } else if (input.value.trim().length < 6) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "password",
          message: "Must be at least 6 characters",
        });
      }
    } else if (input.type === "confirmPassword") {
      if (
        input.value.trim("") === "" ||
        input.value === null ||
        input.value === undefined
      ) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "confirmPassword",
          message: "Invalid password",
        });
      } else {
        let password = inputs.find((x) => x.type === "password");
        if (input.value.trim() !== password.value.trim()) {
          validation.errors = true;
          validation.errorMessages.push({
            type: "confirmPassword",
            message: "Passwords do not match",
          });
        }
      }
    } else if (input.type === "username") {
      if (
        input.value.trim("") === "" ||
        input.value === null ||
        input.value === undefined
      ) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "username",
          message: "Invalid username",
        });
      } else if (input.value.trim().length < 2) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "username",
          message: "Must be at least 2 characters",
        });
      }
    }
  });

  return validation;
};
