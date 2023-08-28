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
} from "@mui/material";
import { Chart } from "react-google-charts";

// icon imports
import AddIcon from "@mui/icons-material/Add";

export default function ScoreKeeper() {
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState([]);
  const [seed, setSeed] = useState(0);

  const [chartData, setChartData] = useState([["Teams", "Scores"]]);

  // input state
  const [addTeamName, setAddTeamName] = useState("");
  const [scoreInput, setScoreInput] = useState(0);

  // modal state
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);

  const options = {
    // title: "",
    // hAxis: { title: "Teams" },
    // vAxis: { title: "Score" },
    legend: "none",
    vAxis: {
      viewWindow: { max: 150 },
    },
  };

  const handleAddTeamModal = () => {
    setAddTeamModalOpen(!addTeamModalOpen);
  };

  const handleAddNewTeam = () => {
    let newTeamName = addTeamName;
    setChartData([...chartData, [newTeamName, 0]]);
    setTeams([...teams, addTeamName]);
    setSeed(seed + 1);
  };

  const handleAddPoints = (team, index) => {
    let chartDataArray = chartData;
    let scoreIndex = chartDataArray.findIndex(
      (element) => element[0] === teams[index]
    );
    chartDataArray.splice(scoreIndex, 1, [team, Number(scoreInput)]);
    setChartData(chartDataArray);
    setScoreInput(0);
  };

  return (
    <>
      <Container>
        {teams.length >= 1 && teams.length !== undefined ? (
          <Chart
            options={options}
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={chartData}
            key={seed}
          />
        ) : (
          <Grid item>
            <Typography variant="h5" color="secondary" align="center" my={10}>
              To start tracking your matche{"'"}s scores, add your teams below.
            </Typography>
          </Grid>
        )}

        <Grid container justifyContent="center" rowSpacing={2}>
          <Grid item>
            <Button
              variant="text"
              color="success"
              size="small"
              onClick={handleAddTeamModal}
            >
              Add Team +
            </Button>
          </Grid>
          <Dialog open={addTeamModalOpen} onClose={handleAddTeamModal}>
            <DialogTitle>Add a New Team</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="new-team-name"
                label="Team Name"
                type="text"
                fullWidth
                variant="standard"
                onChange={(e) => setAddTeamName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddTeamModal}>Cancel</Button>
              <Button onClick={handleAddNewTeam}>Add Team</Button>
            </DialogActions>
          </Dialog>

          {teams.length >= 1 && teams.length !== undefined ? (
            teams.map((team, index) => {
              return (
                <Grid
                  item
                  container
                  xs={12}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Grid item xs={6}>
                    <TextField
                      id="outlined-basic"
                      label={team}
                      defaultValue={0}
                      variant="outlined"
                      fullWidth
                      type="number"
                      onChange={(e) => setScoreInput(e.target.value)}
                    />
                  </Grid>
                  <Grid item>
                    <IconButton
                      aria-label="add-score"
                      onClick={() => handleAddPoints(team, index)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              );
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
      </Container>
    </>
  );
}
