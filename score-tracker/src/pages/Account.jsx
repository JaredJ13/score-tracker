import { Container, Typography, Paper } from "@mui/material";

export default function Account() {
  return (
    <Container>
      <Paper elevation={0} sx={{ mt: 2, mb: 4, p: 1 }}>
        <Typography
          align="center"
          variant="h3"
          component="h1"
          color="primary"
          sx={{ fontWeight: "bold" }}
        >
          Account
        </Typography>
        <Typography align="center" variant="h6">
          *Page In Development*
        </Typography>
      </Paper>
    </Container>
  );
}
