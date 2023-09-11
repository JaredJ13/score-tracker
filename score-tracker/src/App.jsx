import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import NewGame from "./pages/NewGame";

// page imports
import InitialLogin from "./pages/InitialLogin";
import Stats from "./pages/Stats";
import Account from "./pages/Account";

// game type component imports
import NertsScoreTracker from "./components/gameTypes/NertsScoreKeeper";
import Layout from "./components/global/Layout";

function App() {
  // state
  const [navItemSelect, setNavItemSelect] = useState(null);

  // initialize useNavigate
  const navigate = useNavigate();

  useEffect(() => {
    // navigate to selected menu item page
    if (navItemSelect === 0) {
      navigate("/stats");
    } else if (navItemSelect === 1) {
      navigate("/match");
    } else if (navItemSelect === 2) {
      navigate("/account");
    } else {
      navigate("/");
    }
  }, [navItemSelect]);
  return (
    <>
      <Layout routeState={navItemSelect} setRouteState={setNavItemSelect}>
        <Routes>
          <Route path="/" element={<InitialLogin />} />
          <Route path="stats" element={<Stats />} />
          <Route path="match" element={<NewGame />} />
          <Route path="account" element={<Account />} />
          <Route path="nerts" element={<NertsScoreTracker />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
