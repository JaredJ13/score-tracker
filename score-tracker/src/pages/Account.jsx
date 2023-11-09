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
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getDocs,
  collection,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  query,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/FirebaseConfig";
import { renderAlert } from "../components/Alerts";

import Layout from "../components/global/Layout";

// icon imports
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DeleteForeverOutlined from "@mui/icons-material/DeleteForeverOutlined";

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
  const [selectedFriendRow, setSelectedFriendRow] = useState(null);
  const [selectedRequestRow, setSelectedRequestRow] = useState(null);
  const [targetUsername, setTargetUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [deleteRequestDisable, setDeleteRequestDisable] = useState(true);
  const [acceptRequestDisable, setAcceptRequestDisable] = useState(true);
  const [friendsToChooseFrom, setFriendsToChooseFrom] = useState([]);

  // initialize useNavigate
  const navigate = useNavigate();

  // currentUser
  const currentUserDocID = localStorage.getItem("currentUserDocId");

  // ---------- Data Grid Data ------------------------
  const firendsDataColumns = [
    { field: "id", headerName: "Index", flex: 1 },
    { field: "userDocId", headerName: "User Id", flex: 1 },
    {
      field: "displayName",
      headerName: "Username",
      flex: 1,
    },
    {
      field: "dateAccepted",
      headerName: "Date Accepted",
      flex: 1,
    },
  ];

  const [friendsDataRows, setFriendsDataRows] = useState([]);

  const requestsDataColumns = [
    { field: "id", headerName: "Index", flex: 1 },
    { field: "userDocId", headerName: "User Id", flex: 1 },
    {
      field: "fromUsername",
      headerName: "Player Requesting",
      flex: 1,
    },
    {
      field: "dateRequested",
      headerName: "Date Received",
      flex: 1,
    },
  ];

  const [requestsDataRows, setRequestsDataRows] = useState([]);

  // ---------- INTIAL RENDER -------------------------
  useEffect(() => {
    // get all users for default teams user link selection
    getAllUsers();
    // get all friends associated with current user
    // getAllFriends();
    // get friend requests
    getCurrentUserData();
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

  useEffect(() => {
    if (selectedRequestRow !== null) {
      setDeleteRequestDisable(false);
      setAcceptRequestDisable(false);
    } else {
      setDeleteRequestDisable(true);
      setAcceptRequestDisable(true);
    }
  }, [selectedRequestRow]);

  useEffect(() => {
    // once we have our user's data set requests and friends
    if (userData !== null && userData !== undefined) {
      // set requests columns
      if (userData.requests !== undefined && userData.requests.length >= 1) {
        let requests = [];
        userData.requests.forEach((request, index) => {
          requests.push({
            id: index,
            userDocId: request.userDocId,
            fromUsername: request.displayName,
            dateRequested: request.dateRequested.toDate(),
          });
        });
        setRequestsDataRows(requests);
      }

      // set friend columns
      if (userData.friends !== undefined && userData.friends.length >= 1) {
        let friends = [];
        let friendsToChooseFrom = [];
        userData.friends.forEach((friend, index) => {
          friendsToChooseFrom.push({
            docId: friend.userDocId,
            displayName: friend.displayName,
          });
          friends.push({
            id: index,
            userDocId: friend.userDocId,
            displayName: friend.displayName,
            dateAccepted: friend.dateAccepted.toDate(),
          });
        });
        setFriendsDataRows(friends);
        friendsToChooseFrom.push({
          docId: currentUserDocID,
          displayName: userData.displayName,
        });
        setFriendsToChooseFrom(friendsToChooseFrom);
      }
    }
  }, [userData]);

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

  const getCurrentUserData = async () => {
    const querySnapshot = await getDoc(doc(db, "appUsers", currentUserDocID));

    if (querySnapshot.exists()) {
      let userData = querySnapshot.data();
      userData["docId"] = querySnapshot.id;
      setUserData(querySnapshot.data());
    } else {
      console.log("No requests available for the current user");
    }
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
          userDocId: currentUserDocID,
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

  const requestDbAction = async (actionType) => {
    const targetUserIndex = allUserDisplayNames.findIndex(
      (x) => x.docId === currentUserDocID
    );
    let targetUser = allUserDisplayNames[targetUserIndex];

    if (actionType === "delete") {
      let modifiedRequests = [];
      if (targetUser.requests !== undefined) {
        modifiedRequests = targetUser.requests;
        let specificRequestIndex = modifiedRequests.findIndex(
          (x) => x.fromUsername === selectedRequestRow.fromUsername
        );
        modifiedRequests.splice(specificRequestIndex, 1);
      }

      await updateDoc(doc(db, "appUsers", targetUser.docId), {
        requests: modifiedRequests,
      })
        .then(() => {
          // apply change locally
          setRequestsDataRows(modifiedRequests);

          setAlert({
            alert: true,
            message: "Request deleted",
            type: "success",
          });
        })
        .catch((err) => {
          console.log(err);
          setAlert({
            alert: true,
            message: "Request deletion failed",
            type: "error",
          });
        });
    } else if (actionType === "accept") {
      let modifiedFriends = [];
      let modifiedRequests = [];

      // add to friends
      if (targetUser.friends !== undefined) {
        modifiedFriends = targetUser.friends;
        modifiedFriends.push({
          displayName: selectedRequestRow.fromUsername,
          userDocId: selectedRequestRow.userDocId,
          dateAccepted: new Date(),
        });
      } else {
        modifiedFriends.push({
          displayName: selectedRequestRow.fromUsername,
          userDocId: selectedRequestRow.userDocId,
          dateAccepted: new Date(),
        });
      }

      // remove from requests
      if (targetUser.requests !== undefined) {
        modifiedRequests = targetUser.requests;
        let specificRequestIndex = modifiedRequests.findIndex(
          (x) => x.fromUsername === selectedRequestRow.fromUsername
        );
        modifiedRequests.splice(specificRequestIndex, 1);
      }

      await updateDoc(doc(db, "appUsers", targetUser.docId), {
        friends: modifiedFriends,
        requests: modifiedRequests,
      })
        .then(() => {
          // apply change locally
          modifiedRequests.map((request, index) => {
            request["id"] = index;
          });
          modifiedFriends.map((friend, index) => {
            friend["id"] = index;
          });
          setRequestsDataRows(modifiedRequests);
          setFriendsDataRows(modifiedFriends);
        })
        .catch((err) => {
          console.log(err);
          setAlert({
            alert: true,
            message: "Friend request accept failed",
            type: "error",
          });
        });

      // get user data of user you are accepting as a friend
      let newFriendData;
      const querySnapshot = await getDoc(
        doc(db, "appUsers", selectedRequestRow.userDocId)
      );

      if (querySnapshot.exists()) {
        let userData = querySnapshot.data();
        userData["docId"] = querySnapshot.id;
        newFriendData = querySnapshot.data();
      } else {
        console.log("No user exists for this docId");
      }

      // now if we have the data lets add the current user to their friends list
      if (newFriendData.friends !== undefined) {
        newFriendData.friends.push({
          displayName: userData.displayName,
          dateAccepted: new Date(),
          userDocId: currentUserDocID,
        });
      } else {
        newFriendData["friends"] = [
          {
            displayName: userData.displayName,
            dateAccepted: new Date(),
            userDocId: currentUserDocID,
          },
        ];
      }

      await updateDoc(doc(db, "appUsers", selectedRequestRow.userDocId), {
        friends: newFriendData.friends,
      })
        .then(() => {
          setAlert({
            alert: true,
            message: "Friend request accepted",
            type: "success",
          });
        })
        .catch((err) => {
          console.log(err);
          setAlert({
            alert: true,
            message: "Friend request accept failed",
            type: "error",
          });
        });
    }
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
        displayName: value.displayName,
      });
    });
    setTeam1LinkedUsers([...valueArray]);
  };

  const handleRowsSelection = (ids, dataGrid) => {
    const selectedRowsData = ids.map((id) =>
      requestsDataRows.find((row) => row.id === id)
    );

    // dataGrid parameter is used to decipher which datgrid to set the state for
    if (selectedRowsData.length !== undefined && selectedRowsData.length >= 1) {
      if (dataGrid === "requests") {
        setSelectedRequestRow(...selectedRowsData);
      } else if (dataGrid === "friends") {
        setSelectedFriendRow(...selectedRowsData);
      }
    } else {
      if (dataGrid === "requests") {
        setSelectedRequestRow(null);
      } else if (dataGrid === "friends") {
        setSelectedFriendRow(null);
      }
    }
  };

  const handleTeam2LinkUsers = (event, values) => {
    // go through values and set state
    let valueArray = [];
    values.map((value) => {
      valueArray.push({
        docId: value.docId,
        displayName: value.displayName,
      });
    });
    setTeam2LinkedUsers([...valueArray]);
  };

  const handleRequestAction = async (actionType) => {
    // actionType parameter specifies which button user pressed for selected request
    if (actionType === "delete") {
      await requestDbAction(actionType);
    } else if (actionType === "accept") {
      await requestDbAction(actionType);
    }
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
                    localeText={{ noRowsLabel: "You Have No Friends :(" }}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 2,
                        },
                      },
                      columns: {
                        columnVisibilityModel: {
                          status: false,
                          id: false,
                          userDocId: false,
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
                <Grid item xs={8} alignSelf="center">
                  <Typography variant="body1" textAlign="start">
                    Friend Requests Received
                  </Typography>
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    disabled={deleteRequestDisable}
                    onClick={() => handleRequestAction("delete")}
                  >
                    <DeleteForeverOutlined
                      sx={{
                        color: deleteRequestDisable ? "#7e7c7c" : "#d62822",
                      }}
                    />
                  </IconButton>
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    disabled={acceptRequestDisable}
                    onClick={() => handleRequestAction("accept")}
                  >
                    <CheckCircleOutlineOutlinedIcon
                      sx={{
                        color: acceptRequestDisable ? "#7e7c7c" : "#6dc972",
                      }}
                    />
                  </IconButton>
                </Grid>
                <Grid item xs={10} sx={{ minHeight: "21.5rem" }}>
                  <DataGrid
                    rows={requestsDataRows}
                    columns={requestsDataColumns}
                    onRowSelectionModelChange={(ids) =>
                      handleRowsSelection(ids, "requests")
                    }
                    localeText={{ noRowsLabel: "No Pending Friend Requests" }}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 2,
                        },
                      },
                      columns: {
                        columnVisibilityModel: {
                          status: false,
                          id: false,
                          userDocId: false,
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
                    options={friendsToChooseFrom}
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
                    options={friendsToChooseFrom}
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
