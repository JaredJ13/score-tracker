import {
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { auth, db } from "../firebase/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

import Layout from "../components/global/Layout";

export default function Stats() {
  const [userData, setUserData] = useState([]);
  const [winLossRatio, setWinLossRatio] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [numGamesPlayed, setNumGamesPlayed] = useState(0);
  const [userName, setUserName] = useState("");

  // get current user's data function
  const getUserData = async () => {
    const currentUserId = auth.currentUser.uid;
    const userQuery = query(
      collection(db, "appUsers"),
      where("uid", "==", `${currentUserId}`)
    );
    await getDocs(userQuery).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setUserData(doc.data());
      });
    });
  };

  // get current users data
  useEffect(() => {
    getUserData();
  }, []);

  // set win loss ratio, win rate, num games played, username
  useEffect(() => {
    const wlRatio = Number(userData.wins) / Number(userData.losses);
    const winRate =
      (Number(userData.wins) /
        (Number(userData.wins) + Number(userData.losses))) *
      100;
    const numGames =
      userData.matchesCompleted !== undefined &&
      userData.matchesCompleted !== null
        ? userData.matchesCompleted.length
        : 0;
    const userName =
      userData.displayName !== "" &&
      userData.displayName !== null &&
      userData.displayName !== undefined
        ? userData.displayName.toUpperCase()
        : "";
    if (wlRatio === Infinity && userData.wins > 0) {
      setWinLossRatio(1);
    } else if (wlRatio === Infinity && userData.losses > 0) {
      setWinLossRatio(0);
    } else {
      setWinLossRatio(wlRatio);
    }
    setWinRate(winRate);
    setNumGamesPlayed(numGames);
    setUserName(userName);
  }, [userData]);

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
              Stats
            </Typography>
          </Paper>
          <Paper>
            <Grid container justifyContent="center" rowGap={2}>
              <Grid item xs={12}>
                <Typography align="center" variant="h4" pt={2}>
                  {userName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center">
                  {isNaN(winLossRatio) === false ? (
                    <Chip
                      color="info"
                      sx={{ color: "#fff" }}
                      label={"Win/Loss Ratio: " + winLossRatio}
                    />
                  ) : (
                    <Chip color="info" sx={{ color: "#fff" }} label="0" />
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center">
                  <Chip
                    color="info"
                    sx={{ color: "#fff" }}
                    label={"Win Rate: " + winRate + "%"}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center">
                  <Chip
                    color="info"
                    sx={{ color: "#fff" }}
                    label={"# of Draws: " + userData.tieGames}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center">
                  <Chip
                    color="info"
                    sx={{ color: "#fff" }}
                    label={"Other Players Skunked: " + userData.skunkedOther}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center">
                  <Chip
                    color="info"
                    sx={{ color: "#fff" }}
                    label={"Been Skunked: " + userData.beenSkunked}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography align="center" pb={2}>
                  <Chip
                    color="info"
                    sx={{ color: "#fff" }}
                    label={"Games Completed: " + numGamesPlayed}
                  />
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Layout>
    </>
  );
}
