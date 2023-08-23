import { Grid } from "@mui/material";
import { BarChart } from "@mui/x-charts";

export default function ScoreKeeper() {
  const seriesA = {
    data: [2, 3, 1, 4, 5],
    label: "series A",
  };
  const seriesB = {
    data: [3, 1, 4, 2, 1],
    label: "series B",
  };
  return (
    <>
      <Grid container justifyContent="center" alignItems="flex-end">
        <Grid item>
          <BarChart
            width={300}
            height={500}
            series={[
              { ...seriesA, stack: "total" },
              { ...seriesB, stack: "total" },
            ]}
          />
        </Grid>
      </Grid>
    </>
  );
}
