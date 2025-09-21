import { useContext } from "react";
import { AppBar, Toolbar, Typography, IconButton, Stack } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ColorModeCtx } from "../../theme/theme";

export default function Header(){
  const { mode, toggle } = useContext(ColorModeCtx);
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1 }}>EventSphere</Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <IconButton onClick={toggle} aria-label="toggle color mode">
            {mode === "light" ? <DarkModeIcon/> : <LightModeIcon/>}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
