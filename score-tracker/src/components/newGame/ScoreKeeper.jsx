import { Box } from "@mui/material";
import { VictoryBar, VictoryChart, VictoryAxis } from "victory";

export default function ScoreKeeper() {
  const data = [
    { quarter: 1, earnings: 13000 },
    { quarter: 2, earnings: 16500 },
    { quarter: 3, earnings: 14250 },
    { quarter: 4, earnings: 19000 },
  ];
  return (
    <>
      <Box>
        <VictoryChart domainPadding={20}>
          <VictoryAxis
            tickValues={[1, 2, 3, 4]}
            tickFormat={["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]}
          ></VictoryAxis>
          <VictoryAxis
            dependentAxis
            // tickFormat specifies how ticks should be displayed
            tickFormat={(x) => `$${x / 1000}k`}
          />
          <VictoryBar
            data={data} // data accessor for x values
            x="quarter"
            // data accessor for y values
            y="earnings"
          />
        </VictoryChart>
      </Box>
    </>
  );
}
