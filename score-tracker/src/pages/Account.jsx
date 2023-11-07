import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Box,
  TextField,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/FirebaseConfig";
import { renderAlert } from "../components/Alerts";

import Layout from "../components/global/Layout";

// icon imports
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";

export default function Account() {
  // general state
  const [allUserDisplayNames, setAllUserDisplayNames] = useState([]);
  const [alert, setAlert] = useState({ alert: false, message: "", type: "" });
  const [gameSettings, setGameSettings] = useState(null);

  // default team state
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [team1LinkedUsers, setTeam1LinkedUsers] = useState([]);
  const [team2LinkedUsers, setTeam2LinkedUsers] = useState([]);

  // friends state
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [targetUsername, setTargetUsername] = useState("");

  // initialize useNavigate
  const navigate = useNavigate();

  // ---------- Data Grid Data ------------------------
  const firendsDataColumns = [
    { field: "id", headerName: "ID", flex: 1, maxWidth: 65 },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
    },
  ];

  const [friendsDataRows, setFriendsDataRows] = useState([
    { id: 1, username: "test" },
    { id: 2, username: "test" },
    { id: 3, username: "test" },
    { id: 4, username: "test" },
    { id: 5, username: "test" },
    { id: 6, username: "test" },
    { id: 7, username: "test" },
    { id: 8, username: "test" },
    { id: 9, username: "test" },
    { id: 10, username: "test" },
    { id: 11, username: "test" },
  ]);

  const requestsDataColumns = [
    { field: "id", headerName: "ID", flex: 1, maxWidth: 65 },
    {
      field: "fromUsername",
      headerName: "Player Requesting",
      flex: 1,
    },
  ];

  const [requestsDataRows, setRequestsDataRows] = useState([
    { id: 1, fromUsername: "test" },
    { id: 2, fromUsername: "test" },
    { id: 3, fromUsername: "test" },
    { id: 4, fromUsername: "test" },
    { id: 5, fromUsername: "test" },
  ]);

  // ---------- INTIAL RENDER -------------------------
  useEffect(() => {
    // get all users for default teams user link selection
    getAllUsers();
    // get all friends associated with current user
    // getAllFriends();
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
          let requests;
          let friends;
          if (doc.data().requests === undefined) {
            requests = [];
          } else {
            requests = doc.data().requests;
          }
          if (doc.data().friends === undefined) {
            friends = [];
          } else {
            friends = doc.data().friends;
          }

          userArray.push({
            docId: doc.id,
            uid: doc.data().uid,
            displayName: doc.data().displayName,
            requests: requests,
            friends: friends,
          });
        });
        setAllUserDisplayNames([...userArray]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const sendFriendRequest = async () => {
    const targetUserIndex = allUserDisplayNames.findIndex(
      (x) => x.displayName.toUpperCase() === targetUsername.toUpperCase()
    );
    if (targetUserIndex !== -1) {
      // check that the target user doesn't already have a friend request from user
      let targetUser = allUserDisplayNames[targetUserIndex];
      let existingRequest = targetUser.requests.find(
        (x) =>
          x.displayName.toUpperCase() ===
          auth.currentUser.displayName.toUpperCase()
      );

      if (existingRequest === undefined) {
        targetUser.requests.push({
          displayName: auth.currentUser.displayName,
          dateRequested: new Date(),
        });
        // write request to users collection
        await updateDoc(doc(db, "appUsers", targetUser.docId), {
          requests: targetUser.requests,
        })
          .then(() => {
            // add it to local data so that the user can't send multiple
            let allUsers = allUserDisplayNames;
            allUsers.splice(targetUserIndex, 1);
            allUsers.push(targetUser);
            setAllUserDisplayNames(allUsers);

            setTargetUsername("");

            setAlert({
              alert: true,
              message: "Friend request sent!",
              type: "success",
            });
          })
          .catch(() => {
            setAlert({
              alert: true,
              message: "Unable to send friend request, error: 1008",
              type: "error",
            });
          });
      } else {
        setAlert({
          alert: true,
          message: "You already have a friend request pending for this user",
          type: "error",
        });
      }
    } else {
      // target username does not exist
      setAlert({
        alert: true,
        message: "That username does not exist",
        type: "error",
      });
    }
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
          team1Name: team1Name ? team1Name : "",
          team1LinkedUsers:
            team1LinkedUsers !== undefined &&
            team1LinkedUsers.length !== undefined &&
            team1LinkedUsers.length > 0
              ? team1LinkedUsers
              : [{ displayName: "", docId: null, uid: null }],
          team2Name: team2Name ? team2Name : "",
          team2LinkedUsers:
            team2LinkedUsers !== undefined &&
            team2LinkedUsers.length !== undefined &&
            team2LinkedUsers.length > 0
              ? team2LinkedUsers
              : [{ displayName: "", docId: null, uid: null }],
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

  const handleSendFriendRequest = async () => {
    //  try to write friend request into specified users data
    await sendFriendRequest();
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
        </Paper>

        {/* Friends */}
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={6} lg={4}>
            <Paper sx={{ my: 2, pb: 2 }}>
              <Grid container justifyContent="center" rowGap={3}>
                <Grid item xs={11} my={2}>
                  <Typography variant="h5" textAlign="center">
                    Manage Friends
                  </Typography>
                </Grid>
                <Grid item xs={1} my={2}>
                  <Tooltip
                    title={
                      <p style={{ fontSize: "12px" }}>
                        Manage your friends here. In order to add other players
                        to a match, you must have eachother added as friends.
                      </p>
                    }
                  >
                    <HelpOutlineOutlinedIcon />
                  </Tooltip>
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="body1" textAlign="start">
                    My Friends
                  </Typography>
                </Grid>
                <Grid item xs={10} sx={{ minHeight: "21.5rem" }}>
                  <DataGrid
                    rows={friendsDataRows}
                    columns={firendsDataColumns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 2,
                        },
                      },
                    }}
                    pageSizeOptions={[2]}
                  />
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="body1" textAlign="start">
                    Send Friend Request
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Box component="form">
                    <TextField
                      id="send-friend-request"
                      label="Player Username"
                      type="text"
                      fullWidth
                      value={targetUsername}
                      variant="outlined"
                      onChange={(e) => setTargetUsername(e.target.value)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={2} alignSelf="center">
                  <Button
                    variant="text"
                    color="secondary"
                    sx={{ color: "#f77d1a" }}
                    onClick={() => handleSendFriendRequest()}
                  >
                    Send
                  </Button>
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="body1" textAlign="start">
                    Friend Requests Received
                  </Typography>
                </Grid>
                <Grid item xs={10} sx={{ minHeight: "21.5rem" }}>
                  <DataGrid
                    rows={requestsDataRows}
                    columns={requestsDataColumns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 2,
                        },
                      },
                    }}
                    pageSizeOptions={[2]}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Set Game Settings */}
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={6} lg={4}>
            <Paper sx={{ my: 2, pb: 2 }}>
              <Grid container justifyContent="center" rowGap={3}>
                <Grid item xs={11} my={2}>
                  <Typography variant="h5" textAlign="center">
                    Set Default Game Settings
                  </Typography>
                </Grid>
                <Grid item xs={1} my={2}>
                  <Tooltip
                    title={
                      <p style={{ fontSize: "12px" }}>
                        Save your match settings here so that you can skip the
                        match set up hassle and get right into it.
                      </p>
                    }
                  >
                    <HelpOutlineOutlinedIcon />
                  </Tooltip>
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
