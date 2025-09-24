import { useMemo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from "@mui/material";

const TAB_ITEMS: Array<{
  key: "registrations" | "certificates" | "media";
  label: string;
  to: string;
  match: (pathname: string) => boolean;
}> = [
  {
    key: "registrations",
    label: "Đăng ký",
    to: "/dashboard",
    match: (p) =>
      p === "/dashboard" || p.startsWith("/dashboard/registrations") || p.startsWith("/dashboard/events"),
  },
  {
    key: "certificates",
    label: "Chứng nhận",
    to: "/dashboard/certificates",
    match: (p) => p.startsWith("/dashboard/certificates"),
  },
  {
    key: "media",
    label: "Media",
    to: "/dashboard/media",
    match: (p) => p.startsWith("/dashboard/media"),
  },
];

export default function ParticipantLayout() {
  const location = useLocation();

  const current = useMemo(() => {
    const path = location.pathname;
    const hit = TAB_ITEMS.find((tab) => tab.match(path));
    return hit?.key ?? "registrations";
  }, [location.pathname]);

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Paper
          elevation={0}
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
            backgroundImage: (t) =>
              t.palette.mode === "light"
                ? "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(244,246,255,0.96) 100%)"
                : "linear-gradient(180deg, rgba(23,31,49,0.92) 0%, rgba(18,22,37,0.92) 100%)",
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.7 }}>
              Participant Hub
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              Trung tâm tham dự của bạn
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
              Truy cập vé tham dự, chứng nhận và media sau sự kiện ở một nơi duy nhất.
            </Typography>

            <Tabs
              value={current}
              variant="scrollable"
              allowScrollButtons
              aria-label="Participant dashboard navigation"
              TabIndicatorProps={{ sx: { height: 3, borderRadius: 3 } }}
              sx={{
                mt: 1,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 44,
                },
                "& .MuiTabs-scrollButtons.Mui-disabled": { opacity: 0.3 },
              }}
            >
              {TAB_ITEMS.map((tab) => (
                <Tab key={tab.key} value={tab.key} label={tab.label} component={Link} to={tab.to} />
              ))}
            </Tabs>
          </Stack>
        </Paper>

        <Outlet />
      </Container>
    </Box>
  );
}
