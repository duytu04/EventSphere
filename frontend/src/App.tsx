import { CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Container, Button, Box } from "@mui/material";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

const theme = createTheme();

function Home(){
  return (
    <Container sx={{py:4}}>
      <Typography variant="h4" gutterBottom>EventSphere</Typography>
      <Typography>Frontend is up. Go to <Link to="/admin">Admin</Link>.</Typography>
    </Container>
  );
}

export default function App(){
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{flexGrow:1}}>EventSphere</Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/admin">Admin</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{py:2}}>
        <Routes>
          <Route index element={<Home/>} />
          <Route path="admin/*" element={<AdminLayout/>} />
          <Route path="*" element={<Navigate to="/" replace/>} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}
