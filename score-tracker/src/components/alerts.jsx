import { Snackbar, Alert, IconButton } from "@mui/material";

// icon imports
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

export const renderAlert = (type, message, setAlertState) => {
  const handleAlertClose = () => {
    setAlertState({ error: false, message: "" });
  };

  if (type === "error") {
    return (
      <Snackbar open={true} autoHideDuration={8000} onClose={handleAlertClose}>
        <Alert
          severity="error"
          color="error"
          sx={{ width: "100%" }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                handleAlertClose();
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
  } else if (type === "success") {
    return (
      <Snackbar open={true} autoHideDuration={8000} onClose={handleAlertClose}>
        <Alert
          severity="success"
          color="success"
          sx={{ width: "100%" }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                handleAlertClose();
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
