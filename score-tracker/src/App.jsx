import { Routes, Route } from "react-router-dom";
import { auth } from "./firebase/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

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
      {user === null ? (
        <Routes>
          <Route path="/" element={<InitialLogin />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<InitialLogin />} />
          <Route path="stats" element={<Stats />} />
          <Route path="match" element={<NewGame />} />
          <Route path="account" element={<Account />} />
          <Route path="nerts" element={<NertsScoreTracker />} />
        </Routes>
      )}
    </>
  );
}

export default App;
