import { Container, Typography, Paper, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FirebaseConfig";

import Layout from "../components/global/Layout";

// icon imports
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";

export default function Account() {
  // initialize useNavigate
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth)
      .then(() => {
        navigate("/");
        console.log("User signed out");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Layout>
      <Container>
        <Paper elevation={0} sx={{ mt: 2, mb: 4, p: 1 }}>
          <Typography
            align="center"
            variant="h3"
            component="h1"
            color="primary"
            sx={{ fontWeight: "bold" }}
          >
            Account
          </Typography>
          <Typography align="center" variant="h6">
            *Page In Development*
          </Typography>
        </Paper>
        <Paper>
          <Grid container justifyContent="center">
            <Grid item xs={6}>
              <Button
                sx={{ width: "100%" }}
                onClick={handleSignOut}
                variant="container"
                endIcon={<ExitToAppOutlinedIcon />}
              >
                Sign Out
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Layout>
  );
}
