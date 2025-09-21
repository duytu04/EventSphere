// src/theme/theme.ts
import { createContext, useEffect, useMemo, useState, PropsWithChildren } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

export type Mode = "light" | "dark";

export const ColorModeCtx = createContext<{ mode: Mode; toggle: () => void }>({
  mode: "light",
  toggle: () => {},
});

function makeTheme(mode: Mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: "#5b7cfa" },
      secondary: { main: "#6dd3c0" },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
      MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
      MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 12 } } },

      // giữ nguyên defaultProps mà bạn thêm
      MuiTooltip: { defaultProps: { disablePortal: true } },
      MuiPopover: { defaultProps: { disablePortal: true, keepMounted: true } },
      MuiMenu: { defaultProps: { disablePortal: true, keepMounted: true } },
      MuiSelect: {
        defaultProps: {
          MenuProps: { disablePortal: true, keepMounted: true } as any,
        },
      },
      MuiDialog: { defaultProps: { disablePortal: true, keepMounted: true } },
      MuiAutocomplete: { defaultProps: { disablePortal: true } },
    },
  });
}

export default function ColorModeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("ui_mode") as Mode) || "light");

  useEffect(() => {
    localStorage.setItem("ui_mode", mode);
  }, [mode]);

  const theme = useMemo(() => makeTheme(mode), [mode]);
  const value = useMemo(
    () => ({ mode, toggle: () => setMode((m) => (m === "light" ? "dark" : "light")) }),
    [mode]
  );

  return (
    <ColorModeCtx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeCtx.Provider>
  );
}
