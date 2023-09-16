import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { createTheme, ThemeProvider } from "@mui/material";

import NewGame from "./pages/NewGame";

// page imports
import InitialLogin from "./pages/InitialLogin";
import Stats from "./pages/Stats";
import Account from "./pages/Account";

// game type component imports
import NertsScoreTracker from "./components/gameTypes/NertsScoreKeeper";
import { useState } from "react";

function App() {
  const [user, setUser] = useState(null);

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

  // keep track of auth state with an observer on auth object, so we can conditionally render our routes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      setUser(user);
    } else {
      setUser(null);
    }
  });

  return (
    <>
      <ThemeProvider theme={lightTheme}>
        {user === null ? (
          <Routes>
            <Route path="/" element={<InitialLogin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<InitialLogin />} />
            <Route path="stats" element={<Stats />} />
            <Route path="match" element={<NewGame />} />
            <Route path="account" element={<Account />} />
            <Route path="nerts" element={<NertsScoreTracker />} />
            <Route path="*" element={<Navigate to="/stats" />} />
          </Routes>
        )}
      </ThemeProvider>
    </>
  );
}

export default App;
