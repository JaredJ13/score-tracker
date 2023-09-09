import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import Layout from "../components/global/Layout";
import { db } from "../firebase/FirebaseConfig";
import { collection, Timestamp, addDoc } from "firebase/firestore";

// icon imports
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export default function NewGame() {
  // state
  const [gameType, setGameType] = useState("");

  // init use nav
  const navigate = useNavigate();

  const handleNewMatch = async () => {
    const currentDate = new Date();
    // create new match doc
    await addDoc(collection(db, "matches"), {
      dateStarted: Timestamp.fromDate(currentDate),
      dateEnded: null,
      completed: false,
      gameType: gameType,
      winningTeam: null,
      losingTeam: null,
      teamsInvolved: null,
      usersInvolved: null,
    })
      .then((result) => {
        // navigate to nerts component with match id
        navigate("/nerts", { state: { matchId: result.id } });
      })
      .catch((err) => {
        console.log(err.message);
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
                    labelId="game-type-select-label"
                    value={gameType}
                    label="Game Type *"
                    onChange={(e) => setGameType(e.target.value)}
                    color="secondary"
                  >
                    <MenuItem value="nerts">Nerts</MenuItem>
                  </Select>
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
        </Container>
      </Layout>
    </>
  );
}
