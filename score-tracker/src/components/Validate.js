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
    else if (input.type === "team1name") {
      if (
        input.value.trim("") === "" ||
        input.value === null ||
        input.value === undefined
      ) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "team1name",
          message: "Enter a team name",
        });
      }
    }
    else if (input.type === "team2name") {
      let team1Name = inputs.find((x) => x.type === 'team1name')
      if (
        input.value.trim("") === "" ||
        input.value === null ||
        input.value === undefined
      ) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "team2name",
          message: "Enter a team name",
        });
      }
      else if (input.value.trim() === team1Name.value.trim()) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "team2name",
          message: "Team names can't be the same",
        });
      }
    }
    else if (input.type === "team1score") {
      if (
        isNaN(input.value)
      ) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "team1score",
          message: "Enter a number",
        });
      }
    }
    else if (input.type === "team2score") {
      if (
        isNaN(input.value)
      ) {
        validation.errors = true;
        validation.errorMessages.push({
          type: "team2score",
          message: "Enter a number",
        });
      }
    }
  });

  return validation;
};
