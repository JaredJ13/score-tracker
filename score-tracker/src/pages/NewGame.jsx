/* eslint-disable react/jsx-key */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  IconButton,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { db, auth } from "../firebase/FirebaseConfig";
import {
  collection,
  where,
  query,
  getDocs,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

import Layout from "../components/global/Layout";

// icon imports
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

export default function NewGame() {
  // state
  const [gameType, setGameType] = useState("");
  const [inProgressGames, setInProgressGames] = useState([]);

  // error state
  const [selectGameError, setSelectGameError] = useState({
    error: false,
    message: "",
  });

  // init use nav
  const navigate = useNavigate();

  // --------- DB FUNCTIONS -------------
  const getIncompleteMatches = async () => {
    const incompleteMatchesQuery = query(
      collection(db, "appUsers"),
      where("uid", "==", `${auth.currentUser.uid}`)
    );
    await getDocs(incompleteMatchesQuery)
      .then((querySnapshot) => {
        let inProgress = [];
        querySnapshot.forEach((doc) => {
          // map through matchesInvolvedIn and keep all that are not complete
          const arrayInvolved = doc.data().matchesInvolvedIn;
          const arrayComplete = doc.data().matchesCompleted;

          if (arrayComplete !== null && arrayComplete !== undefined) {
            arrayInvolved.map((match) => {
              // go through and find ones not in completed array
              const isComplete = arrayComplete.find((x) => x === match.matchId);
              if (!isComplete) {
                inProgress.push(match);
              }
            });
          } else {
            arrayInvolved.map((match) => {
              inProgress.push(match);
            });
          }
        });
        setInProgressGames(inProgress);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // --------- USE EFFECTS --------------

  // inital render
  useEffect(() => {
    // call get incomplete game data function to get incomplete matchId's from current user
    getIncompleteMatches();
  }, []);

  // --------- HANDLERS -----------------
  const handleNewMatch = () => {
    if (gameType === null || gameType === "" || gameType === undefined) {
      setSelectGameError({ error: true, message: "Select a game type" });
    } else {
      setSelectGameError({ error: false, message: "" });
      // we don't write the new match to the db until first points are scored
      navigate(`/${gameType}`, { state: { matchData: null, matchId: null } });
    }
  };
  const handleContinueMatch = async (matchId) => {
    // get selected match id's data
    const matchRef = doc(db, "matches", `${matchId}`);
    const docSnap = await getDoc(matchRef);

    if (docSnap.exists()) {
      navigate("/nerts", {
        state: { matchData: docSnap.data(), matchId: docSnap.id },
      });
    } else {
      console.log("no data returned");
    }
  };

  const handleDeleteMatch = async (matchId) => {
    // batch delete from matches and appUsers
    const batch = writeBatch(db);

    // get players uids for match
    let playerIdsInvolvedInMatch = [];
    await getDoc(doc(db, "matches", `${matchId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        let object = snapshot.data().teamsInvolved;
        for (const team in object) {
          object[team].forEach((player) => {
            playerIdsInvolvedInMatch.push(player.docId);
          });
        }
      }
    });

    // go through users involved in match
    for (const playerId of playerIdsInvolvedInMatch) {
      let matchesInvolvedIn = [];
      await getDoc(doc(db, "appUsers", `${playerId}`)).then((snapshot) => {
        matchesInvolvedIn = [...snapshot.data().matchesInvolvedIn];
      });

      // find and remove match from matchesinvolvedin
      let index = matchesInvolvedIn.findIndex((x) => x.matchId === matchId);
      matchesInvolvedIn.splice(index, 1);

      // rewrite updated matches involved in to appUsers
      batch.update(doc(db, `appUsers`, `${playerId}`), {
        matchesInvolvedIn: matchesInvolvedIn,
      });
    }

    // delete match from matches collection
    batch.delete(doc(db, "matches", `${matchId}`));

    // commit the batch
    await batch
      .commit()
      .then(() => {
        // find and remove match from in progress games
        let inProgressGamesCopy = [...inProgressGames];
        let index = inProgressGamesCopy.findIndex((x) => x.matchId === matchId);
        inProgressGamesCopy.splice(index, 1);
        setInProgressGames(inProgressGamesCopy);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
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
              Match
            </Typography>
            <Grid container justifyContent="center" mt={1}>
              <Grid item xs={10}>
                <Typography
                  align="center"
                  variant="body1"
                  sx={{ color: "#96aaf9" }}
                >
                  You can continue an incomplete match, or start score keeping
                  for a new match.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={6} lg={4}>
              {/* new game paper */}
              <Paper elevation={1}>
                <Typography align="center" variant="h5" pt={2} color="default">
                  New Game
                </Typography>
                <Grid container justifyContent="center" spacing={2} mt={2}>
                  <Grid item xs={10}>
                    <FormControl required sx={{ width: "100%" }}>
                      <InputLabel id="game-type-select-label" color="secondary">
                        Game Type
                      </InputLabel>
                      <Select
                        error={selectGameError.error}
                        help
                        labelId="game-type-select-label"
                        value={gameType}
                        label="Game Type *"
                        onChange={(e) => setGameType(e.target.value)}
                        color="secondary"
                      >
                        <MenuItem value="nerts">Nerts</MenuItem>
                      </Select>
                      <FormHelperText sx={{ color: "#d64646" }}>
                        {selectGameError.error ? selectGameError.message : ""}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      endIcon={<PlayArrowIcon />}
                      sx={{ mb: 2, color: "#fff" }}
                      onClick={handleNewMatch}
                    >
                      Start New Match
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
              {/* end new game paper */}
            </Grid>
            <Grid item xs={12}></Grid>
            <Grid item xs={12} sm={6} lg={4}>
              {/* continue game paper */}
              <Paper sx={{ mt: 4, mb: 10 }} elevation={1}>
                <Typography align="center" variant="h5" pt={2} color="default">
                  Continue a Game
                </Typography>
                <Grid
                  container
                  justifyContent="center"
                  spacing={2}
                  mt={2}
                  pb={2}
                >
                  {inProgressGames.length !== undefined &&
                  inProgressGames.length > 0
                    ? inProgressGames.map((game) => {
                        return (
                          <Grid item xs={10}>
                            <Card
                              key={game.matchId}
                              sx={{ backgroundColor: "#96aaf9", color: "#fff" }}
                            >
                              <CardContent>
                                <Grid container justifyContent="space-between">
                                  <Grid item xs={8}>
                                    <Typography
                                      pt={1}
                                      sx={{ width: "100%", fontSize: "12px" }}
                                    >
                                      {`${game.dateStarted
                                        .toDate()
                                        .toDateString()} | ${game.team1} vs ${
                                        game.team2
                                      }`}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Grid container justifyContent="end">
                                      <Grid item xs={4}>
                                        <IconButton
                                          onClick={() =>
                                            handleDeleteMatch(game.matchId)
                                          }
                                          sx={{ width: "100%", color: "#fff" }}
                                        >
                                          <HighlightOffOutlinedIcon color="error" />
                                        </IconButton>
                                      </Grid>
                                      <Grid item xs={4}>
                                        <IconButton
                                          onClick={() =>
                                            handleContinueMatch(game.matchId)
                                          }
                                          sx={{ width: "100%", color: "#fff" }}
                                        >
                                          <PlayCircleOutlineOutlinedIcon />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })
                    : ""}
                </Grid>
              </Paper>
              {/* end continue game paper */}
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </>
  );
}
