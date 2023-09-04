/* eslint-disable react/prop-types */
import AppBar from "@mui/material/AppBar";
import { Toolbar, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

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
  return (
    <>
      <ThemeProvider theme={lightTheme}>
        <div className="layout-container">
          <AppBar color="primary" sx={{ top: "auto", bottom: 0, height: 40 }}>
            <Toolbar>
              <Typography
                variant="h5"
                component="h1"
                align="center"
                sx={{ margin: "0 auto" }}
              >
                Nerts Score Tracker
              </Typography>
            </Toolbar>
          </AppBar>
          {children}
        </div>
      </ThemeProvider>
    </>
  );
}
