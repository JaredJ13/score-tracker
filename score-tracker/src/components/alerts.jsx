import { Snackbar, Alert, IconButton } from "@mui/material";

// icon imports
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

export const renderAlert = (type, message, setErrorState) => {
  const handleErrorClose = () => {
    setErrorState({ error: false, message: "" });
  };

  if (type === "error") {
    return (
      <Snackbar open={true} autoHideDuration={8000} onClose={handleErrorClose}>
        <Alert
          severity="error"
          sx={{ width: "100%" }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                handleErrorClose();
              }}
            >
              <CloseOutlinedIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    );
  }
};
