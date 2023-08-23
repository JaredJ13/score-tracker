// icons
import ScoreboardTwoToneIcon from "@mui/icons-material/ScoreboardTwoTone";
import AccountBoxTwoToneIcon from "@mui/icons-material/AccountBoxTwoTone";
import { BottomNavigation, BottomNavigationAction, Box } from "@mui/material";

export default function BottomAppBar() {
  return (
    <>
      <Box>
        <BottomNavigation
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
          showLabels
          // value={value}
          // onChange={(event, newValue) => {
          //   setValue(newValue);
          // }}
        >
          <BottomNavigationAction
            label="Recents"
            icon={<ScoreboardTwoToneIcon sx={{ width: 70, height: 68 }} />}
          />
          <BottomNavigationAction
            label="Favorites"
            icon={<AccountBoxTwoToneIcon sx={{ width: 70, height: 65 }} />}
          />
        </BottomNavigation>
      </Box>
    </>
  );
}
