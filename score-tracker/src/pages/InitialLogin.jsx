import { useEffect, useState } from "react";
import {
  Box,
  Container,
  FormControl,
  Grid,
  Paper,
  TextField,
  Typography,
  InputLabel,
  Button,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { auth } from "../firebase/FirebaseConfig";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function InitialLogin() {
  // state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // attempt to sign in user
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then((userCredential) => {
        let user = userCredential.user;
        // TEMPORARY - ADD USER DISPLAY NAME FOR FEATURE TESTING PURPOSES
        updateProfile(auth.currentUser, { displayName: "testUser" }).catch(
          (err) => {
            console.log(err.message);
          }
        );
        // store user id in session storage
        sessionStorage.setItem("currentUserId", user.uid);
        if (user) {
          navigate("/match");
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <>
      <ThemeProvider theme={lightTheme}>
        <Container sx={{ backgroundColor: "#96aaf9", height: "100vh" }}>
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
              <Grid container justifyContent="center">
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
                  <FormControl sx={{ width: "100%", my: 2 }}>
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
        </Container>
      </ThemeProvider>
    </>
  );
}
