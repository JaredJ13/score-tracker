import {
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Box,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/FirebaseConfig";
import { renderAlert } from "../components/Alerts";

import Layout from "../components/global/Layout";

// icon imports
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import { useEffect, useState } from "react";

export default function Account() {
  // general state
  const [allUserDisplayNames, setAllUserDisplayNames] = useState([]);
  const [alert, setAlert] = useState({ alert: false, message: "", type: "" });
  const [gameSettings, setGameSettings] = useState([]);

  // default team state
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [team1LinkedUsers, setTeam1LinkedUsers] = useState([]);
  const [team2LinkedUsers, setTeam2LinkedUsers] = useState([]);

  // initialize useNavigate
  const navigate = useNavigate();

  // ---------- INTIAL RENDER -------------------------
  useEffect(() => {
    // get all users for default teams user link selection
    getAllUsers();
    // get current user game settings
    getGameSettings();
  }, []);

  useEffect(() => {
    // set teams to defaults for current user if they exist
    if (gameSettings !== null && gameSettings !== undefined) {
      setTeam1Name(gameSettings.team1Name);
      setTeam2Name(gameSettings.team2Name);
      setTeam1LinkedUsers(gameSettings.team1LinkedUsers);
      setTeam2LinkedUsers(gameSettings.team2LinkedUsers);
    }
  }, [gameSettings]);

  // ---------- DB FUNCTIONS (ASYNCHRONOUS DATABASE FUNCTIONS NEEDED IN USE EFFECT HOOKS)----------------
  const getAllUsers = async () => {
    await getDocs(collection(db, "appUsers"))
      .then((querySnapshot) => {
        let userArray = [];
        querySnapshot.forEach((doc) => {
          userArray.push({
            docId: doc.id,
            uid: doc.data().uid,
            displayName: doc.data().displayName,
          });
        });
        setAllUserDisplayNames([...userArray]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getGameSettings = async () => {
    await getDoc(
      doc(db, "appUsers", `${localStorage.getItem("currentUserDocId")}`)
    )
      .then((res) => {
        if (res.exists()) {
          setGameSettings(res.data().defaultNertsSettings);
        } else {
          console.log("No game settings found");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateDefaultTeams = async () => {
    await updateDoc(
      doc(db, "appUsers", `${localStorage.getItem("currentUserDocId")}`),
      {
        defaultNertsSettings: {
          gameType: "nerts",
          team1Name: team1Name,
          team1LinkedUsers: team1LinkedUsers,
          team2Name: team2Name,
          team2LinkedUsers: team2LinkedUsers,
        },
      }
    )
      .then(() => {
        setAlert({
          alert: true,
          message: "Default team settings updated",
          type: "success",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // ---------- HANDLERS -------------------------------
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

  const handleTeam1LinkUsers = (event, values) => {
    // go through values and set state
    let valueArray = [];
    values.map((value) => {
      valueArray.push({
        docId: value.docId,
        uid: value.uid,
        displayName: value.displayName,
      });
    });
    setTeam1LinkedUsers([...valueArray]);
  };

  const handleTeam2LinkUsers = (event, values) => {
    // go through values and set state
    let valueArray = [];
    values.map((value) => {
      valueArray.push({
        docId: value.docId,
        uid: value.uid,
        displayName: value.displayName,
      });
    });
    setTeam2LinkedUsers([...valueArray]);
  };

  const handleSetUserDefaults = async () => {
    // TO-DO: Needs input validation
    updateDefaultTeams();
  };

  return (
    <Layout>
      <Container>
        <Paper elevation={0} sx={{ mt: 3, p: 1 }}>
          <Typography
            align="center"
            variant="h3"
            component="h1"
            color="primary"
            sx={{ fontWeight: "bold" }}
          >
            Account
          </Typography>
          {/* <Typography align="center" variant="h6">
            *Page In Development*
          </Typography> */}
        </Paper>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={6} lg={4}>
            <Paper sx={{ my: 2, pb: 2 }}>
              <Grid container justifyContent="center" rowGap={3}>
                <Grid item xs={12} my={2}>
                  <Typography variant="h5" textAlign="center">
                    Set Default Game Settings
                  </Typography>
                </Grid>
                <Grid item xs={10}>
                  <Box component="form">
                    <TextField
                      id="default-team1-name"
                      label="Default Team 1 Name"
                      type="text"
                      fullWidth
                      value={team1Name}
                      variant="outlined"
                      onChange={(e) => setTeam1Name(e.target.value)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={10}>
                  <Autocomplete
                    multiple
                    options={allUserDisplayNames}
                    getOptionLabel={(option) => option.displayName}
                    value={team1LinkedUsers || []}
                    isOptionEqualToValue={(option, value) =>
                      option.displayName === value.displayName
                    }
                    onChange={(event, value) => {
                      handleTeam1LinkUsers(event, value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Link Player Accounts to Team 1"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={10}>
                  <Box component="form">
                    <TextField
                      id="default-team2-name"
                      label="Default Team 2 Name"
                      type="text"
                      fullWidth
                      value={team2Name}
                      variant="outlined"
                      onChange={(e) => setTeam2Name(e.target.value)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={10}>
                  <Autocomplete
                    multiple
                    options={allUserDisplayNames}
                    getOptionLabel={(option) => option.displayName}
                    value={team2LinkedUsers || []}
                    isOptionEqualToValue={(option, value) =>
                      option.displayName === value.displayName
                    }
                    onChange={(event, value) => {
                      handleTeam2LinkUsers(event, value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Link Player Accounts to Team 2"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                    sx={{ width: "100%", color: "#f77d1a" }}
                    variant="container"
                    onClick={handleSetUserDefaults}
                  >
                    Update Game Settings
                  </Button>
                </Grid>
                <Grid item xs={12}></Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}></Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <Paper sx={{ mb: 12, mt: 1 }}>
              <Grid container justifyContent="center">
                <Grid item xs={6}>
                  <Button
                    sx={{ width: "100%", color: "#f77d1a" }}
                    onClick={handleSignOut}
                    variant="container"
                    endIcon={<ExitToAppOutlinedIcon />}
                  >
                    Sign Out
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        {/* winner alert dialog end */}
        {/* snackbar alert */}
        {alert.alert ? renderAlert(alert.type, alert.message, setAlert) : ""}
        {/* snackbar alert end */}
      </Container>
    </Layout>
  );
}
