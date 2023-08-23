import { Container } from "@mui/material";
import BottomAppBar from "../components/global/BottomAppBar";
import ScoreKeeper from "../components/newGame/ScoreKeeper";

export default function NewGame() {
  return (
    <>
      <Container>
        <ScoreKeeper />
        <BottomAppBar />
      </Container>
    </>
  );
}
