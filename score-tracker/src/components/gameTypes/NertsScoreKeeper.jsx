/* eslint-disable react/jsx-key */
import { useEffect, useState } from "react";
import {
  Grid,
  Button,
  TextField,
  Container,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Paper,
  Card,
  CardContent,
  Snackbar,
  CircularProgress,
  DialogContentText,
  Autocomplete,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Chart } from "react-google-charts";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../firebase/FirebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  increment,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";

import Layout from "../global/Layout";

// icon imports
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import StarRateIcon from "@mui/icons-material/StarRate";

export default function ScoreKeeper() {
  const [teams, setTeams] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [chartData, setChartData] = useState([["Team", "Score"]]);
  const [startMatchButtonDisabled, setStartMatchButtonDisabled] =
    useState(true);
  const [editScoreMode, setEditScoreMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastScore, setLastScore] = useState({
    team: "",
    teamScoreTotal: 0,
    opposingTeam: "",
  });
  const [winningTeamData, setWinningTeamData] = useState(null);
  const [allUserDisplayNames, setAllUserDisplayNames] = useState([]);
  const [team1CurrentTotalScore, setTeam1CurrentTotalScore] = useState();
  const [team2CurrentTotalScore, setTeam2CurrentTotalScore] = useState();

  // input state
  const [addTeam1Name, setAddTeam1Name] = useState("");
  const [addTeam2Name, setAddTeam2Name] = useState("");
  const [scoreInput, setScoreInput] = useState(0);
  const [scoreInput2, setScoreInput2] = useState(0);
  const [editScoreInput, setEditScoreInput] = useState(0);
  const [team1LinkedUsers, setTeam1LinkedUsers] = useState([]);
  const [team2LinkedUsers, setTeam2LinkedUsers] = useState([]);

  // modal/snackbar state
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
  const [snackBarWarning, setSnackBarWarning] = useState(false);
  const [editScoreModalOpen, setEditScoreModalOpen] = useState(false);
  const [editScoreData, setEditScoreData] = useState(null);
  const [winnerDialogModalOpen, setWinnerDialogModalOpen] = useState(false);

  // get data from useNavigate initialize navigate
  const location = useLocation();
  let currentMatchId = location.state.matchId;
  const navigate = useNavigate();

  // bar chart options
  const options = {
    title: "Nerts Match",
    // hAxis: { title: "Teams" },
    // vAxis: { title: "Score" },
    legend: "none",
    vAxis: {
      viewWindow: { max: 150 },
    },
    colors: ["#f77d1a"],
    animation: {
      duration: 1000,
      easing: "out",
    },
  };

  const handleAddTeamModal = () => {
    setAddTeamModalOpen(!addTeamModalOpen);
  };

  const handleEditScoreModal = (scoreData) => {
    setEditScoreData(scoreData);
    setEditScoreModalOpen(!editScoreModalOpen);
  };

  const handleSnackBarWarning = () => {
    setSnackBarWarning(!snackBarWarning);
  };

  const handleWinnerDialogModal = () => {
    setWinnerDialogModalOpen(!winnerDialogModalOpen);
  };

  const handleAddNewTeam = async () => {
    setChartData([...chartData, [addTeam1Name, 0], [addTeam2Name, 0]]);
    setTeams([...teams, addTeam1Name, addTeam2Name]);

    // add team name to each linked user data
    let linkedUsers1 = [];
    team1LinkedUsers.map((user) => {
      let updatedUser = user;
      updatedUser["team"] = addTeam1Name;
      linkedUsers1.push(updatedUser);
    });
    setTeam1LinkedUsers([...linkedUsers1]);

    let linkedUsers2 = [];
    team2LinkedUsers.map((user) => {
      let updatedUser = user;
      updatedUser["team"] = addTeam2Name;
      linkedUsers2.push(updatedUser);
    });
    setTeam2LinkedUsers([...linkedUsers2]);
    // write team linked users and team names to db
    await updateDoc(doc(db, "matches", `${currentMatchId}`), {
      teamsInvolved: {
        [addTeam1Name]: linkedUsers1,
        [addTeam2Name]: linkedUsers2,
      },
    }).catch((err) => {
      console.log(err.message);
    });
    handleAddTeamModal();

    // call update game involvement to all linked users function
    updateLinkedUsers();
  };

  const handleTeam1LinkUsers = (event, values) => {
    // go through values and set state
    let valueArray = [];
    values.map((value) => {
      valueArray.push({
        uid: value.userId,
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

  // ---------- DB FUNCTIONS (ASYNCHRONOUS DATABASE FUNCTIONS NEEDED IN USE EFFECT HOOKS)----------------
  const getAllUsers = async () => {
    await getDocs(collection(db, "appUsers")).then((querySnapshot) => {
      let userArray = [];
      querySnapshot.forEach((doc) => {
        userArray.push({
          docId: doc.id,
          userId: doc.data().uid,
          displayName: doc.data().displayName,
        });
      });
      setAllUserDisplayNames([...userArray]);
    });
  };

  const updateLinkedUsers = async () => {
    const batch = writeBatch(db);

    team1LinkedUsers.map((user) => {
      batch.update(doc(db, "appUsers", user.docId), {
        matchesInvolvedIn: arrayUnion(currentMatchId),
      });
    });
    team2LinkedUsers.map((user) => {
      batch.update(doc(db, "appUsers", user.docId), {
        matchesInvolvedIn: arrayUnion(currentMatchId),
      });
    });

    // now commit the batch write
    await batch.commit().catch((err) => {
      console.log(err);
    });
  };

  const writeWinLossBatch = async (
    winningTeam,
    winningScore,
    losingTeam,
    losingScore,
    tieGame
  ) => {
    let currentDate = new Date();
    const batch = writeBatch(db);

    // update matches collection doc
    batch.update(doc(db, "matches", currentMatchId), {
      winningTeam: { score: winningScore, team: winningTeam },
      losingTeam: { score: losingScore, team: losingTeam },
      tieGame: tieGame,
      dateEnded: Timestamp.fromDate(currentDate),
      completed: true,
    });
    // update users collection docs
    if (!tieGame) {
      team1LinkedUsers.map((user) => {
        if (user.team === winningTeam) {
          batch.update(doc(db, "appUsers", user.docId), { wins: increment(1) });
        } else {
          batch.update(doc(db, "appUsers", user.docId), {
            losses: increment(1),
          });
        }
      });
      team2LinkedUsers.map((user) => {
        if (user.team === winningTeam) {
          batch.update(doc(db, "appUsers", user.docId), { wins: increment(1) });
        } else {
          batch.update(doc(db, "appUsers", user.docId), {
            losses: increment(1),
          });
        }
      });
    } else {
      team1LinkedUsers.map((user) => {
        batch.update(doc(db, "appUsers", user.docId), {
          tieGames: increment(1),
        });
      });

      team2LinkedUsers.map((user) => {
        batch.update(doc(db, "appUsers", user.docId), {
          tieGames: increment(1),
        });
      });
    }

    // now commit the batch write
    await batch
      .commit()
      .then(() => {
        navigate("/match");
      })
      .catch((err) => {
        console.log(err);
        navigate("/match");
      });
  };

  // INITIAL RENDER
  useEffect(() => {
    // get all user display names
    getAllUsers();
    // on component render force user to enter teams
    // open modal
    handleAddTeamModal();
  }, []);

  const handleAddPoints = async (team, index) => {
    // add score to score history if score hasn't been added yet for the team this round
    let teamValid = true;
    scoreHistory.map((score) => {
      if (score.team === team && score.round === currentRound) {
        teamValid = false;
      }
    });
    if (teamValid) {
      let scoreItemNum = scoreHistory.length;
      let newScoreTotal = 0;
      // calc new score total
      if (scoreHistory.length > 0 && scoreHistory.length !== undefined) {
        scoreHistory.map((score) => {
          if (score.team === team) {
            newScoreTotal += score.scoreUpdate;
          }
        });
        newScoreTotal +=
          index === 0 ? parseInt(scoreInput) : parseInt(scoreInput2);
      } else {
        newScoreTotal =
          index === 0 ? parseInt(scoreInput) : parseInt(scoreInput2);
      }

      setScoreHistory([
        ...scoreHistory,
        {
          team: team,
          teamIndex: index,
          scoreUpdate:
            index === 0 ? parseInt(scoreInput) : parseInt(scoreInput2),
          scoreEntry: scoreItemNum,
          teamScoreTotal: newScoreTotal,
          round: currentRound,
        },
      ]);
      // set total score state for specific team
      if (index === 0) {
        setTeam1CurrentTotalScore(newScoreTotal);
      } else {
        setTeam2CurrentTotalScore(newScoreTotal);
      }
      // write score history to db's match doc
      let updatedScoreHistory = [
        ...scoreHistory,
        {
          team: team,
          teamIndex: index,
          scoreUpdate:
            index === 0 ? parseInt(scoreInput) : parseInt(scoreInput2),
          scoreEntry: scoreItemNum,
          teamScoreTotal: newScoreTotal,
          round: currentRound,
        },
      ];

      await updateDoc(doc(db, "matches", `${currentMatchId}`), {
        scoreHistory: updatedScoreHistory,
      }).catch((err) => {
        console.log(err.message);
      });

      // set last score state
      let opposingTeam = teams.find((x) => x !== team);
      setLastScore({
        team: team,
        teamScoreTotal: newScoreTotal,
        opposingTeam: opposingTeam,
        round: currentRound,
      });
      // input current score into chart data
      let chartDataArray = chartData;
      let scoreIndex = chartDataArray.findIndex(
        (element) => element[0] === teams[index]
      );
      chartDataArray.splice(scoreIndex, 1, [team, newScoreTotal]);
      setChartData(chartDataArray);
      // set score input state again to update google chart
      setScoreInput(0);
      setScoreInput2(0);
    } else {
      handleSnackBarWarning();
      setScoreInput(0);
      setScoreInput2(0);
    }
  };

  const handleEditScore = () => {
    setLoading(true);
    // splice in updated score to score history
    let updatedScoreData = editScoreData;
    updatedScoreData.teamScoreTotal =
      updatedScoreData.teamScoreTotal -
      updatedScoreData.scoreUpdate +
      Number(editScoreInput);
    updatedScoreData.scoreUpdate = Number(editScoreInput);

    let scoreHistoryArray = [...scoreHistory];
    scoreHistoryArray.splice(updatedScoreData.scoreEntry, 1, updatedScoreData);

    // update all future round scores for team based on new teamScoreTotal
    scoreHistoryArray.map((score, index) => {
      if (
        score.team === updatedScoreData.team &&
        score.round > updatedScoreData.round
      ) {
        // get teamScoreTotal from previous score entry for this team
        let previousTeamScoreIndex = scoreHistoryArray.findIndex(
          (x) => x.round === score.round - 1 && x.team === score.team
        );
        let previousTeamScoreTotal =
          scoreHistoryArray[previousTeamScoreIndex].teamScoreTotal;

        // set current map index's new teamScoreTotal based on previous one
        scoreHistoryArray[index].teamScoreTotal =
          previousTeamScoreTotal + score.scoreUpdate;
      }
    });
    setScoreHistory([...scoreHistoryArray]);

    setEditScoreMode(true);
  };

  useEffect(() => {
    setTimeout(() => {
      if (editScoreMode) {
        let newScoreTotal = 0;
        // calc new score total when state is updated
        if (scoreHistory.length > 0 && scoreHistory.length !== undefined) {
          scoreHistory.map((score) => {
            if (score.team === editScoreData.team) {
              newScoreTotal += score.scoreUpdate;
            }
          });
        } else {
          newScoreTotal = Number(editScoreInput);
        }

        // input current score into chart data
        let chartDataArray = chartData;
        let scoreIndex = chartDataArray.findIndex(
          (element) => element[0] === teams[editScoreData.teamIndex]
        );
        chartDataArray.splice(scoreIndex, 1, [
          editScoreData.team,
          newScoreTotal,
        ]);

        setChartData(chartDataArray);
        // set score input state again to update google chart
        setScoreInput(0);
        setScoreInput2(0);

        setEditScoreMode(false);
        // close modal
        setEditScoreModalOpen();
      }
      setLoading(false);
    }, 3000);
  }, [editScoreMode]);

  useEffect(() => {
    // Check if all teams have scored once this round
    let map = new Map();
    for (let i = 0; i < scoreHistory.length; i++) {
      if (scoreHistory[i].round === currentRound) {
        // add team and score to map
        map.set(scoreHistory[i].team, scoreHistory[i].scoreUpdate);
        // check if all teams participating are in map
        if (map.size === teams.length) {
          return setCurrentRound(currentRound + 1);
        }
      }
    }
  }, [scoreHistory]);

  useEffect(() => {
    if (team1CurrentTotalScore >= 121 || team2CurrentTotalScore >= 121) {
      // check to see if both teams have scored for final round
      let finalScore = scoreHistory.findIndex(
        (x) => x.team === lastScore.opposingTeam && x.round === lastScore.round
      );
      // if the opposing team has scored then compare two final scores
      if (finalScore !== -1) {
        let opposingTeamLastScoreIndex = scoreHistory.findIndex(
          (x) =>
            x.round === lastScore.round && x.team === lastScore.opposingTeam
        );
        let opposingTeamLastScore =
          scoreHistory[opposingTeamLastScoreIndex].teamScoreTotal;
        if (opposingTeamLastScore > lastScore.teamScoreTotal) {
          // update winning team data
          setWinningTeamData({
            winner: scoreHistory[opposingTeamLastScoreIndex].team,
            winnerScore:
              scoreHistory[opposingTeamLastScoreIndex].teamScoreTotal,
            loser: lastScore.team,
            loserScore: lastScore.teamScoreTotal,
            tieGame: false,
          });
          // do batch write to db
          writeWinLossBatch(
            scoreHistory[opposingTeamLastScoreIndex].team,
            scoreHistory[opposingTeamLastScoreIndex].teamScoreTotal,
            lastScore.team,
            lastScore.teamScoreTotal,
            false
          );
          handleWinnerDialogModal();
        } else if (opposingTeamLastScore < lastScore.teamScoreTotal) {
          // update winning team data
          setWinningTeamData({
            winner: lastScore.team,
            winnerScore: lastScore.teamScoreTotal,
            loser: scoreHistory[opposingTeamLastScoreIndex].team,
            loserScore: scoreHistory[opposingTeamLastScoreIndex].teamScoreTotal,
            tieGame: false,
          });
          // do batch write to db
          writeWinLossBatch(
            lastScore.team,
            lastScore.teamScoreTotal,
            scoreHistory[opposingTeamLastScoreIndex].team,
            scoreHistory[opposingTeamLastScoreIndex].teamScoreTotal,
            false
          );
          handleWinnerDialogModal();
        } else {
          setWinningTeamData({
            winner: lastScore.team,
            winnerScore: lastScore.teamScoreTotal,
            loser: scoreHistory[opposingTeamLastScoreIndex].team,
            loserScore: scoreHistory[opposingTeamLastScoreIndex].teamScoreTotal,
            tieGame: true,
          });
          // do batch write to db
          writeWinLossBatch(
            lastScore.team,
            lastScore.teamScoreTotal,
            scoreHistory[opposingTeamLastScoreIndex].team,
            scoreHistory[opposingTeamLastScoreIndex].teamScoreTotal,
            true
          );
          handleWinnerDialogModal();
        }
      }
    }
  }, [lastScore]);

  useEffect(() => {
    // check if both team names have input
    if (addTeam1Name.length >= 2 && addTeam2Name.length >= 2) {
      setStartMatchButtonDisabled(false);
    } else {
      setStartMatchButtonDisabled(true);
    }
  }, [addTeam1Name, addTeam2Name]);

  return (
    <>
      <Layout>
        <Container sx={{ mb: 4 }}>
          <Paper square sx={{ pb: 4, mt: 3 }}>
            {teams.length >= 1 && teams.length !== undefined ? (
              <>
                <Chart
                  options={options}
                  chartType="ColumnChart"
                  width="100%"
                  height="300px"
                  data={chartData}
                />
                <Grid container justifyContent="space-around">
                  <Grid item>
                    <Chip
                      label={`Round: ${currentRound}`}
                      color="info"
                      sx={{ color: "#fff" }}
                    />
                  </Grid>
                  {teams.map((team) => {
                    let scoreHistoryIndex = scoreHistory.findIndex(
                      (x) => x.team === team && x.round === currentRound
                    );
                    if (scoreHistoryIndex === -1) {
                      scoreHistoryIndex = scoreHistory.findIndex(
                        (x) => x.team === team && x.round === currentRound - 1
                      );
                    }
                    return (
                      <Grid item>
                        <Chip
                          label={
                            scoreHistoryIndex !== -1
                              ? `${team}'s Score: ${scoreHistory[scoreHistoryIndex].teamScoreTotal}`
                              : `${team}'s Score: 0`
                          }
                          color="secondary"
                          sx={{ color: "#fff" }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            ) : (
              <Grid item></Grid>
            )}
          </Paper>
          <Divider sx={{ mt: 4 }}>Enter Scores</Divider>
          <Paper sx={{ my: 4, pb: 4 }} square>
            <Grid container justifyContent="center" rowSpacing={2}>
              {teams.length === 0 || teams.length === undefined ? (
                <Grid item>
                  <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    onClick={handleAddTeamModal}
                  >
                    Add Match Teams
                  </Button>
                </Grid>
              ) : (
                ""
              )}
              <Dialog open={addTeamModalOpen} onClose={handleAddTeamModal}>
                <DialogTitle>Input the Matches Team Names</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="new-team-name"
                    label="Team 1 Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    onChange={(e) => setAddTeam1Name(e.target.value)}
                  />
                  <Autocomplete
                    multiple
                    options={allUserDisplayNames}
                    getOptionLabel={(option) => option.displayName}
                    // defaultValue={sessionStorage.getItem("currentUserId")}
                    onChange={(event, value) => {
                      handleTeam1LinkUsers(event, value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Link Player Accounts to Team 1"
                      />
                    )}
                  />
                  <TextField
                    margin="dense"
                    id="new-team-name"
                    label="Team 2 Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    onChange={(e) => setAddTeam2Name(e.target.value)}
                  />
                  <Autocomplete
                    multiple
                    options={allUserDisplayNames}
                    getOptionLabel={(option) => option.displayName}
                    // defaultValue={sessionStorage.getItem("currentUserId")}
                    onChange={(event, value) => {
                      handleTeam2LinkUsers(event, value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Link Player Accounts to Team 2"
                      />
                    )}
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    disabled={startMatchButtonDisabled}
                    onClick={handleAddNewTeam}
                  >
                    Start Match
                  </Button>
                </DialogActions>
              </Dialog>
              <Snackbar
                open={snackBarWarning}
                autoHideDuration={5000}
                onClose={handleSnackBarWarning}
              >
                <MuiAlert
                  onClose={handleSnackBarWarning}
                  severity="warning"
                  variant="filled"
                  elevation={6}
                  sx={{ width: "100%" }}
                >
                  {`You${"'"}ve already entered a score for this team this round.`}
                </MuiAlert>
              </Snackbar>
              {teams.length >= 1 && teams.length !== undefined ? (
                teams.map((team, index) => {
                  if (index === 0) {
                    return (
                      <Grid
                        item
                        container
                        xs={12}
                        justifyContent="center"
                        alignItems="center"
                        key={index}
                      >
                        <Grid item xs={6}>
                          <TextField
                            id="outlined-basic"
                            label={team}
                            variant="outlined"
                            fullWidth
                            type="number"
                            value={scoreInput}
                            onChange={(e) => setScoreInput(e.target.value)}
                          />
                        </Grid>
                        <Grid item>
                          <IconButton
                            color="info"
                            aria-label="add-score"
                            onClick={() => handleAddPoints(team, index)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    );
                  } else if (index === 1) {
                    return (
                      <Grid
                        item
                        container
                        xs={12}
                        justifyContent="center"
                        alignItems="center"
                        key={index}
                      >
                        <Grid item xs={6}>
                          <TextField
                            id="outlined-basic"
                            label={team}
                            variant="outlined"
                            fullWidth
                            type="number"
                            value={scoreInput2}
                            onChange={(e) => setScoreInput2(e.target.value)}
                          />
                        </Grid>
                        <Grid item>
                          <IconButton
                            color="info"
                            aria-label="add-score"
                            onClick={() => handleAddPoints(team, index)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    );
                  }
                })
              ) : (
                <Grid
                  item
                  container
                  xs={12}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Typography variant="body1">No Teams Added</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          <Divider>Score History</Divider>
          <Typography align="center" variant="body2" sx={{ mb: 4 }}>
            Score entries from Newest to Oldest
          </Typography>
          <Grid
            container
            justifyContent="center"
            direction="column-reverse"
            xs={12}
            rowGap={2}
          >
            {scoreHistory.map((score) => {
              return (
                <>
                  <Grid item>
                    <Card
                      square
                      sx={{
                        backgroundColor:
                          score.scoreUpdate > 0
                            ? "#d0fef1"
                            : score.scoreUpdate === 0
                            ? "#cbf2f8"
                            : "#fcc5c5",
                      }}
                    >
                      <CardContent>
                        <Grid container justifyContent="space-between">
                          <Grid item xs={12}>
                            <Typography variant="h6" color="text.secondary">
                              {`Round ${score.round} Team ${score.team}`}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="h4" sx={{ color: "#282838" }}>
                              {score.scoreUpdate > 0 ? "+" : ""}
                              {score.scoreUpdate} <StarRateIcon />
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Button
                              variant="contained"
                              color="info"
                              endIcon={<EditIcon />}
                              size="small"
                              sx={{ color: "#ffffff" }}
                              onClick={() => {
                                handleEditScoreModal({ ...score });
                              }}
                            >
                              Modify
                            </Button>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="h6" color="text.secondary">
                              Total Team Score: {score.teamScoreTotal}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              );
            })}
          </Grid>
          {editScoreData !== null && editScoreData !== undefined ? (
            <Dialog open={editScoreModalOpen} onClose={handleEditScoreModal}>
              <DialogTitle>Edit Score</DialogTitle>
              <DialogContentText sx={{ px: 3 }}>
                Enter updated points below to modify the previous score for
              </DialogContentText>
              <DialogContentText sx={{ color: "#f77d1a", px: 3 }}>
                {`Round ${editScoreData.round} Team ${editScoreData.team}`}
              </DialogContentText>
              <DialogContent>
                <TextField
                  id="outlined-basic"
                  label="Score Update"
                  variant="outlined"
                  fullWidth
                  type="number"
                  defaultValue={editScoreData.scoreUpdate}
                  onChange={(e) => setEditScoreInput(e.target.value)}
                  sx={{ color: "#96aaf9", mt: 1 }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={handleEditScoreModal}
                >
                  Cancel
                </Button>
                {!loading ? (
                  <Button variant="outlined" onClick={handleEditScore}>
                    Update Score
                  </Button>
                ) : (
                  <CircularProgress
                    color="info"
                    size={25}
                    sx={{ ml: 1, mr: 3 }}
                  />
                )}
              </DialogActions>
            </Dialog>
          ) : (
            ""
          )}
          {/* winner alert dialog */}
          {winningTeamData !== null && winningTeamData !== undefined ? (
            <Dialog
              open={winnerDialogModalOpen}
              onClose={handleWinnerDialogModal}
            >
              <DialogTitle>
                {winningTeamData.tieGame
                  ? `Woah! Looks like you tied!`
                  : `Congratulations Team ${winningTeamData.winner}, you won!`}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {winningTeamData.tieGame
                    ? `The ${winningTeamData.winner}'s & the ${winningTeamData.loser}'s tied with a score of ${winningTeamData.winnerScore} - ${winningTeamData.loserScore}`
                    : `Team ${winningTeamData.winner} won the game with a score of ${winningTeamData.winnerScore}`}
                </DialogContentText>
              </DialogContent>
            </Dialog>
          ) : (
            ""
          )}
          {/* winner alert dialog end */}
        </Container>
      </Layout>
    </>
  );
}
