import { Routes, Route } from "react-router-dom";

import NewGame from "./pages/NewGame";

// page imports
import InitialLogin from "./pages/InitialLogin";
import Stats from "./pages/Stats";
import Account from "./pages/Account";

// game type component imports
import NertsScoreTracker from "./components/gameTypes/NertsScoreKeeper";
import Layout from "./components/global/Layout";

function App() {
  return (
    <>
      <Layout>
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
