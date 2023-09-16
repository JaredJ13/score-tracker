import {
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
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
      setWinLossRatio(wlRatio.toFixed(1));
    }
    setWinRate(winRate.toFixed(2));
    setNumGamesPlayed(numGames);
    setUserName(userName);
  }, [userData]);

  // render pie chart
  const renderPieChart = () => {
    let data = [
      { label: "Wins", value: userData.wins, color: "#6dc972" },
      {
        label: "Skunked",
        value: userData.skunkedOther,
        color: "#6dc972",
      },
      { label: "Losses", value: userData.losses, color: "#d62822" },
      { label: "Been Skunked", value: userData.beenSkunked, color: "#d62822" },
    ];

    return (
      <PieChart
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        series={[
          {
            startAngle: -90,
            endAngle: 90,
            data,
            paddingAngle: 0,
            cornerRadius: 4,
            innerRadius: 0,
          },
        ]}
        legend={{
          direction: "row",
          position: {
            vertical: "top",
            horizontal: "middle",
          },
        }}
        sx={{
          "--ChartsLegend-rootOffsetX": "-7px",
          "--ChartsLegend-rootOffsetY": "170px",
          "--ChartsLegend-itemWidth": "60px",
          "--ChartsLegend-itemMarkSize": "7px",
          "--ChartsLegend-labelSpacing": "2px",
          "--ChartsLegend-rootSpacing": "-2px",
        }}
        height={300}
        // width={200}
      />
    );
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
              Stats
            </Typography>
            <Typography
              align="center"
              variant="h4"
              pt={2}
              sx={{ fontWeight: "bold" }}
            >
              {userName}
            </Typography>
          </Paper>
          {userData !== undefined && userData !== null ? renderPieChart() : ""}
          <Divider sx={{ mt: "-95px", mb: 2 }}></Divider>
          <Grid container justifyContent="space-around" rowGap={2}>
            <Grid item xs={4}>
              <Typography align="center">
                <Chip
                  sx={{
                    color: "#aae772",
                    backgroundColor: "#383535",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                  label={"Wins: " + userData.wins}
                />
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography align="center">
                <Chip
                  color="info"
                  sx={{
                    color: "#ff5757",
                    backgroundColor: "#383535",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                  label={"Losses: " + userData.losses}
                />
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography align="center">
                {isNaN(winLossRatio) === false ? (
                  <Chip
                    color="info"
                    sx={{
                      color: "#aae772",
                      backgroundColor: "#383535",
                      fontWeight: "bold",
                      width: "100%",
                    }}
                    label={"Win/Loss Ratio: " + winLossRatio}
                  />
                ) : (
                  <Chip
                    color="info"
                    sx={{
                      color: "#aae772",
                      backgroundColor: "#383535",
                      fontWeight: "bold",
                      width: "100%",
                    }}
                    label="Win/Loss Ratio: 0"
                  />
                )}
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography align="center">
                <Chip
                  color="info"
                  sx={{
                    color: "#aae772",
                    backgroundColor: "#383535",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                  label={"Win Rate: " + winRate + "%"}
                />
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography align="center">
                <Chip
                  color="info"
                  sx={{
                    color: "#aae772",
                    backgroundColor: "#383535",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                  label={"Other Players Skunked: " + userData.skunkedOther}
                />
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography align="center">
                <Chip
                  color="info"
                  sx={{
                    color: "#ff5757",
                    backgroundColor: "#383535",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                  label={"Been Skunked: " + userData.beenSkunked}
                />
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography align="center">
                <Chip
                  color="info"
                  sx={{
                    color: "#aae772",
                    backgroundColor: "#383535",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                  label={"Games Completed: " + numGamesPlayed}
                />
              </Typography>
            </Grid>
            <Grid item xs={10} mb={10}>
              <Typography align="center">
                <Chip
                  color="info"
                  sx={{
                    color: "#a4d3ee",
                    backgroundColor: "#383535",
                    fontWeight: "bold",
                    width: "100%",
                  }}
                  label={"Draws: " + userData.tieGames}
                />
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </>
  );
}
