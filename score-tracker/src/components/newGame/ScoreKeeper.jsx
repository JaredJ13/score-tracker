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
  // const [scores, setScores] = useState([]);
  const [teams, setTeams] = useState([]);

  // input state
  const [addTeamName, setAddTeamName] = useState("");

  // modal state
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);

  const chartData = [
    ["Team", "Score", { role: "style" }],
    ["Team Roxanne", 97, "#5a5ce9"],
    ["Team Shaun", 56, "#a488f0"],
  ];
  const options = {
    // title: "",
    // hAxis: { title: "Teams" },
    // vAxis: { title: "Score" },
    legend: "none",
  };

  const handleAddTeamModal = () => {
    setAddTeamModalOpen(!addTeamModalOpen);
  };

  const handleAddNewTeam = () => {
    setTeams([...teams, addTeamName]);
  };

  useEffect(() => {
    console.log(teams);
  }, [teams]);

  return (
    <>
      <Container>
        <Chart
          options={options}
          chartType="ColumnChart"
          width="100%"
          height="300px"
          data={chartData}
        />
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
            teams.map((team) => {
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
                    />
                  </Grid>
                  <Grid item>
                    <IconButton aria-label="add-score">
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
