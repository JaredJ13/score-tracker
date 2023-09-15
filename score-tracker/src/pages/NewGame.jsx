/* eslint-disable react/jsx-key */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
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
} from "firebase/firestore";

import Layout from "../components/global/Layout";

// icon imports
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";

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
              const isComplete = arrayComplete.find((x) => x === match);
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
          {/* continue game paper */}
          <Paper sx={{ mt: 4, mb: 10 }} elevation={1}>
            <Typography align="center" variant="h5" pt={2} color="default">
              Continue a Game
            </Typography>
            <Grid container justifyContent="center" spacing={2} mt={2} pb={2}>
              {inProgressGames.length !== undefined &&
              inProgressGames.length > 0
                ? inProgressGames.map((game) => {
                    return (
                      <Grid item xs={10}>
                        <Card
                          key={game}
                          sx={{ backgroundColor: "#96aaf9", color: "#fff" }}
                        >
                          <CardContent>
                            <Grid container justifyContent="space-between">
                              <Grid item xs={3}>
                                <Typography pt={1} sx={{ width: "100%" }}>
                                  {game}
                                </Typography>
                              </Grid>
                              <Grid item xs={2}>
                                <Button
                                  endIcon={<PlayCircleOutlineOutlinedIcon />}
                                  onClick={() => handleContinueMatch(game)}
                                  sx={{ width: "100%", color: "#fff" }}
                                ></Button>
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
        </Container>
      </Layout>
    </>
  );
}
