import { Routes, Route } from "react-router-dom";

import NewGame from "./pages/NewGame";
import Layout from "./components/global/Layout";

import NertsScoreTracker from "./components/gameTypes/NertsScoreKeeper";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<NewGame />} />
          <Route path="nerts" element={<NertsScoreTracker />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
