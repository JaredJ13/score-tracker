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

export default function InitialLogin() {
  // state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");

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

  // db functions
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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
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
      });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    // attempt to create new user account
    createUserWithEmailAndPassword(auth, signupEmail, signupPassword).then(
      (userCredential) => {
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
      }
    );
  };

  return (
    <>
      <ThemeProvider theme={lightTheme}>
        <Container sx={{ backgroundColor: "#96aaf9", height: "100%", pb: 4 }}>
          <Typography align="center" variant="h2" sx={{ color: "#fff" }} pt={4}>
            Point Tracker
          </Typography>
          <Typography align="center" variant="body2" sx={{ color: "#fff" }}>
            V 1.0
          </Typography>
          <Paper sx={{ mt: 8 }}>
            <Typography align="center" variant="h4" pt={2}>
              Login
            </Typography>
            <Box component="form" mt={2} onSubmit={(e) => handleLoginSubmit(e)}>
              <Grid container justifyContent="center" rowGap={3}>
                <Grid item xs={10}>
                  <FormControl sx={{ width: "100%" }}>
                    <TextField
                      label="Email"
                      variant="outlined"
                      type="email"
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={10}>
                  <FormControl sx={{ width: "100%" }}>
                    <TextField
                      label="Password"
                      variant="outlined"
                      type="password"
                      onChange={(e) => setLoginPassword(e.target.value)}
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
          <Typography align="center" variant="h6" pt={4} sx={{ color: "#fff" }}>
            OR
          </Typography>
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
                      label="Email"
                      variant="outlined"
                      type="email"
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={10}>
                  <FormControl sx={{ width: "100%" }}>
                    <TextField
                      label="Username"
                      variant="outlined"
                      type="text"
                      onChange={(e) => setSignupUsername(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={10}>
                  <FormControl sx={{ width: "100%" }}>
                    <TextField
                      label="Password"
                      variant="outlined"
                      type="password"
                      onChange={(e) => setSignupPassword(e.target.value)}
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
        </Container>
      </ThemeProvider>
    </>
  );
}
