import AppBar from "@mui/material/AppBar";
import { Toolbar, Typography } from "@mui/material";

// icons

// styled components

export default function Layout({ children }) {
  return (
    <>
      <div className="layout-container">
        <AppBar
          position="sticky"
          color="default"
          sx={{ top: "auto", bottom: 0 }}
        >
          <Toolbar>
            <Typography
              variant="h2"
              component="h1"
              align="center"
              sx={{ margin: "0 auto" }}
            >
              Score Tracker
            </Typography>
          </Toolbar>
        </AppBar>
        {children}
      </div>
    </>
  );
}
