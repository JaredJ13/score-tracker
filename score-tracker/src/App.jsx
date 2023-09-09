import { Routes, Route } from "react-router-dom";

import NewGame from "./pages/NewGame";

import NertsScoreTracker from "./components/gameTypes/NertsScoreKeeper";
import InitialLogin from "./pages/InitialLogin";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<InitialLogin />} />
        <Route path="/match" element={<NewGame />} />
        <Route path="nerts" element={<NertsScoreTracker />} />
      </Routes>
    </>
  );
}

export default App;
