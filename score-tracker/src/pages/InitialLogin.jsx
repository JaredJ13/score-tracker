import { useState } from "react";
import {
  Box,
  Container,
  FormControl,
  Grid,
  Paper,
  TextField,
  Typography,
  Button,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { auth, db } from "../firebase/FirebaseConfig";
import {
  signInWithEmailAndPassword,
  updateProfile,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { validateUserInput } from "../components/Validate";
import { renderAlert } from "../components/Alerts";

export default function InitialLogin() {
  // state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // error handling
  const [emailErrorLogin, setEmailErrorLogin] = useState({
    error: false,
    message: "",
  });
  const [passwordErrorLogin, setPasswordErrorLogin] = useState({
    error: false,
    message: "",
  });
  const [emailErrorSignup, setEmailErrorSignup] = useState({
    error: false,
    message: "",
  });
  const [passwordErrorSignup, setPasswordErrorSignup] = useState({
    error: false,
    message: "",
  });
  const [usernameErrorSignup, setUsernameErrorSignup] = useState({
    error: false,
    message: "",
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState({
    error: false,
    message: "",
  });
  const [firestoreError, setFirestoreError] = useState({
    error: false,
    message: "",
  });

  // themes
  const lightTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#7581c5",
      },
      secondary: {
        main: "#f77d1a",
      },
      success: {
        main: "#40c639",
      },
      info: {
        main: "#96aaf9",
      },
      warning: {
        main: "#ed6c02",
      },
      error: {
        main: "#d64646",
      },
    },
  });

  // declare use nav
  const navigate = useNavigate();

  // DB FUNCTIONS
  const writeNewUser = async (userId) => {
    await addDoc(collection(db, "appUsers"), {
      displayName: signupUsername,
      losses: 0,
      wins: 0,
      tieGames: 0,
      uid: userId,
      matchesInvolvedIn: null,
      matchesCompleted: null,
      beenSkunked: 0,
      skunkedOther: 0,
    }).catch((err) => {
      console.log(err.message);
    });
  };

  // HANDLERS

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // validate user input
    let valid = validateUserInput([
      { type: "email", value: loginEmail },
      { type: "password", value: loginPassword },
    ]);
    setEmailErrorLogin({ error: false, message: "" });
    setPasswordErrorLogin({ error: false, message: "" });
    if (valid.errors) {
      // go through and set state for appropiate input errors
      valid.errorMessages.map((error) => {
        if (error.type === "email") {
          setEmailErrorLogin({ error: true, message: error.message });
        }
        if (error.type === "password") {
          setPasswordErrorLogin({ error: true, message: error.message });
        }
      });
    } else {
      setEmailErrorLogin({ error: false, message: "" });
      setPasswordErrorLogin({ error: false, message: "" });

      // attempt to sign in user
      signInWithEmailAndPassword(auth, loginEmail, loginPassword)
        .then((userCredential) => {
          let user = userCredential.user;
          // store user id in session storage
          sessionStorage.setItem("currentUserId", user.uid);
          if (user) {
            navigate("/stats");
          }
        })
        .catch((err) => {
          console.log(err.message);
          setFirestoreError({ error: true, message: err.message });
        });
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    // validate user input
    let valid = validateUserInput([
      { type: "email", value: signupEmail },
      { type: "password", value: signupPassword },
      { type: "username", value: signupUsername },
      { type: "confirmPassword", value: confirmPassword },
    ]);
    setEmailErrorSignup({ error: false, message: "" });
    setPasswordErrorSignup({ error: false, message: "" });
    setConfirmPasswordError({ error: false, message: "" });
    setUsernameErrorSignup({ error: false, message: "" });
    if (valid.errors) {
      // go through and set state for appropiate input errors
      valid.errorMessages.map((error) => {
        if (error.type === "email") {
          setEmailErrorSignup({ error: true, message: error.message });
        }
        if (error.type === "password") {
          setPasswordErrorSignup({ error: true, message: error.message });
        }
        if (error.type === "confirmPassword") {
          setConfirmPasswordError({ error: true, message: error.message });
        }
        if (error.type === "username") {
          setUsernameErrorSignup({ error: true, message: error.message });
        }
      });
    } else {
      setEmailErrorSignup({ error: false, message: "" });
      setPasswordErrorSignup({ error: false, message: "" });
      setConfirmPasswordError({ error: false, message: "" });
      setUsernameErrorSignup({ error: false, message: "" });

      // attempt to create new user account
      createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
        .then((userCredential) => {
          let user = userCredential.user;
          if (user) {
            let user = userCredential.user;
            // update users auth displayname
            updateProfile(auth.currentUser, {
              displayName: signupUsername,
            }).catch((err) => {
              console.log(err.message);
            });
            // write user to appUsers collection
            writeNewUser(user.uid);
            // send email verification to user
            sendEmailVerification(auth.currentUser);
            // store user id in session storage
            sessionStorage.setItem("currentUserId", user.uid);
            if (user) {
              navigate("/stats");
            }
          }
        })
        .catch((err) => {
          console.log(err.message);
          setFirestoreError({ error: true, message: err.message });
        });
    }
  };

  return (
    <>
      <ThemeProvider theme={lightTheme}>
        <Container
          maxWidth="false"
          sx={{
            backgroundColor: "#96aaf9",
            height: "100%",
            pb: 4,
          }}
        >
          <Typography align="center" variant="h2" sx={{ color: "#fff" }} pt={4}>
            Point Tracker
          </Typography>
          <Typography align="center" variant="body2" sx={{ color: "#fff" }}>
            V 1.0
          </Typography>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              <Paper sx={{ mt: 8 }}>
                <Typography align="center" variant="h4" pt={2}>
                  Login
                </Typography>
                <Box
                  component="form"
                  mt={2}
                  onSubmit={(e) => handleLoginSubmit(e)}
                >
                  <Grid container justifyContent="center" rowGap={3}>
                    <Grid item xs={10}>
                      <FormControl sx={{ width: "100%" }}>
                        <TextField
                          error={emailErrorLogin.error}
                          helperText={
                            emailErrorLogin.error ? emailErrorLogin.message : ""
                          }
                          label="Email"
                          variant="outlined"
                          type="text"
                          onChange={(e) => setLoginEmail(e.target.value.trim())}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={10}>
                      <FormControl sx={{ width: "100%" }}>
                        <TextField
                          error={passwordErrorLogin.error}
                          helperText={
                            passwordErrorLogin.error
                              ? passwordErrorLogin.message
                              : ""
                          }
                          label="Password"
                          variant="outlined"
                          type="password"
                          onChange={(e) =>
                            setLoginPassword(e.target.value.trim())
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={{ mb: 2, width: "100%", color: "#fff" }}
                        type="submit"
                      >
                        Login
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Typography
                align="center"
                variant="h6"
                pt={4}
                sx={{ color: "#fff" }}
              >
                OR
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper sx={{ mt: 4 }}>
                <Typography align="center" variant="h4" pt={2}>
                  Sign Up
                </Typography>
                <Box
                  component="form"
                  mt={2}
                  onSubmit={(e) => handleSignupSubmit(e)}
                >
                  <Grid container justifyContent="center" rowGap={3}>
                    <Grid item xs={10}>
                      <FormControl sx={{ width: "100%" }}>
                        <TextField
                          error={emailErrorSignup.error}
                          helperText={
                            emailErrorSignup.error
                              ? emailErrorSignup.message
                              : ""
                          }
                          label="Email"
                          variant="outlined"
                          type="text"
                          onChange={(e) =>
                            setSignupEmail(e.target.value.trim())
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={10}>
                      <FormControl sx={{ width: "100%" }}>
                        <TextField
                          error={usernameErrorSignup.error}
                          helperText={
                            usernameErrorSignup.error
                              ? usernameErrorSignup.message
                              : ""
                          }
                          label="Username"
                          variant="outlined"
                          type="text"
                          onChange={(e) =>
                            setSignupUsername(e.target.value.trim())
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={10}>
                      <FormControl sx={{ width: "100%" }}>
                        <TextField
                          error={passwordErrorSignup.error}
                          helperText={
                            passwordErrorSignup.error
                              ? passwordErrorSignup.message
                              : ""
                          }
                          label="Password"
                          variant="outlined"
                          type="password"
                          onChange={(e) =>
                            setSignupPassword(e.target.value.trim())
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={10}>
                      <FormControl sx={{ width: "100%" }}>
                        <TextField
                          error={confirmPasswordError.error}
                          helperText={
                            confirmPasswordError.error
                              ? confirmPasswordError.message
                              : ""
                          }
                          label="Confirm Password"
                          variant="outlined"
                          type="password"
                          onChange={(e) =>
                            setConfirmPassword(e.target.value.trim())
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={{ mb: 2, width: "100%", color: "#fff" }}
                        type="submit"
                      >
                        Sign Up
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          {firestoreError.error
            ? renderAlert("error", firestoreError.message, setFirestoreError)
            : ""}
        </Container>
      </ThemeProvider>
    </>
  );
}
