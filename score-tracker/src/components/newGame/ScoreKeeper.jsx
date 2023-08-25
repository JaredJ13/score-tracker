import { useState } from "react";
import { Grid } from "@mui/material";
import { BarChart } from "@mui/x-charts";

export default function ScoreKeeper() {
  return (
    // const[teams, setTeams] = useState([])

    <>
      <Grid Container>
        <Grid item sm={12}>
          <BarChart
            xAxis={[
              {
                id: "barTeams",
                data: ["Team A", "Team B"],
                scaleType: "band",
              },
            ]}
            series={[
              {
                data: [98, 45],
              },
            ]}
            height={300}
          />
        </Grid>
      </Grid>
    </>
  );
}
