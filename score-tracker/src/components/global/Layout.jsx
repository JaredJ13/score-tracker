/* eslint-disable react/prop-types */
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";

// icon imports
import InsertChartOutlinedTwoToneIcon from "@mui/icons-material/InsertChartOutlinedTwoTone";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import PortraitOutlinedIcon from "@mui/icons-material/PortraitOutlined";
import { useState } from "react";

// themes
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7581c5",
    },
    secondary: {
      main: "#f77d1a",
    },
    success: {
      main: "#40c639",
    },
    info: {
      main: "#96aaf9",
    },
    warning: {
      main: "#ed6c02",
    },
    error: {
      main: "#d64646",
    },
  },
});

export default function Layout({ children }) {
  // get pathname incase a user goes to a component by manually typing address in
  const pathname = window.location.pathname;
  const [routeState, setRouteState] = useState(pathname);

  return (
    <>
      <ThemeProvider theme={lightTheme}>
        <div className="layout-container">
          {children}
          {/* sticky bottom nav */}
          <Paper
            sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
            elevation={3}
          >
            <BottomNavigation
              color="primary"
              value={routeState}
              onChange={(event, newValue) => setRouteState(newValue)}
            >
              <BottomNavigationAction
                label="Stats"
                icon={<InsertChartOutlinedTwoToneIcon sx={{ fontSize: 30 }} />}
                value={"/stats"}
                LinkComponent={Link}
                to={"/stats"}
              />
              <BottomNavigationAction
                label="Match"
                icon={<AddBoxOutlinedIcon sx={{ fontSize: 30 }} />}
                value={"/match"}
                LinkComponent={Link}
                to={"/match"}
              />
              <BottomNavigationAction
                label="Account"
                icon={<PortraitOutlinedIcon sx={{ fontSize: 30 }} />}
                value={"/account"}
                LinkComponent={Link}
                to={"/account"}
              />
            </BottomNavigation>
          </Paper>
        </div>
      </ThemeProvider>
    </>
  );
}
