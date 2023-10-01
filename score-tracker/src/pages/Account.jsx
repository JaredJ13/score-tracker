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
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/FirebaseConfig";

import Layout from "../components/global/Layout";

// icon imports
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import { useEffect, useState } from "react";

export default function Account() {
  // general state
  const [allUserDisplayNames, setAllUserDisplayNames] = useState([]);
  const [currentUserData, setCurrentUserData] = useState([]);

  // default team state
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [team1LinkedUsers, setTeam1LinkedUsers] = useState([]);
  const [team2LinkedUsers, setTeam2LinkedUsers] = useState([]);

  // get current user uid
  // const currentUserUID = auth.currentUser.uid;

  // initialize useNavigate
  const navigate = useNavigate();

  // ---------- INTIAL RENDER -------------------------
  useEffect(() => {
    // get all users for default teams user link selection
    getAllUsers();
    // get appUsers data for the current user
    // getCurrentUserData();
  }, []);

  // ---------- DB FUNCTIONS (ASYNCHRONOUS DATABASE FUNCTIONS NEEDED IN USE EFFECT HOOKS)----------------
  const getAllUsers = async () => {
    await getDocs(collection(db, "appUsers"))
      .then((querySnapshot) => {
        let userArray = [];
        querySnapshot.forEach((doc) => {
          userArray.push({
            docId: doc.id,
            userId: doc.data().uid,
            displayName: doc.data().displayName,
          });
        });
        setAllUserDisplayNames([...userArray]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // const getCurrentUserData = async () => {
  //   let q = query(
  //     collection(db, "appUsers"),
  //     where("uid", "==", `${currentUserUID}`)
  //   );
  //   await getDocs(q)
  //     .then((querySnapshot) => {
  //       querySnapshot.forEach((doc) => {
  //         let userData = doc.data();
  //         userData["docId"] = doc.id;
  //         setCurrentUserData([...currentUserData, userData]);
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

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
    ).catch((err) => {
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
        userId: value.userId,
        displayName: value.displayName,
        docId: value.docId,
      });
    });
    setTeam1LinkedUsers([...valueArray]);
  };

  const handleTeam2LinkUsers = (event, values) => {
    // go through values and set state
    let valueArray = [];
    values.map((value) => {
      valueArray.push({
        uid: value.userId,
        displayName: value.displayName,
        docId: value.docId,
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
                onChange={(event, value) => {
                  handleTeam1LinkUsers(event, value);
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
            <Grid item xs={10}>
              <Box component="form">
                <TextField
                  id="default-team2-name"
                  label="Default Team 2 Name"
                  type="text"
                  fullWidth
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
                Set Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ mb: 12, mt: 6 }}>
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
      </Container>
    </Layout>
  );
}
