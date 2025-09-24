import { useMemo } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const TAB_ITEMS: Array<{
  key: "overview" | "events" | "attendance";
  label: string;
  to: string;
  match: (path: string) => boolean;
}> = [
  {
    key: "overview",
    label: "Tổng quan",
    to: "/organizer",
    match: (p) => p === "/organizer" || p === "/organizer/",
  },
  {
    key: "events",
    label: "Sự kiện",
    to: "/organizer/events",
    match: (p) => p.startsWith("/organizer/events"),
  },
  {
    key: "attendance",
    label: "Điểm danh",
    to: "/organizer/attendance",
    match: (p) => p.startsWith("/organizer/attendance"),
  },
];

export default function OrganizerLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const current = useMemo(() => {
    const hit = TAB_ITEMS.find((t) => t.match(pathname));
    return hit?.key ?? "overview";
  }, [pathname]);

  const pageTitle = useMemo(() => {
    switch (current) {
      case "events":
        return "Quản lý sự kiện";
      case "attendance":
        return "Điểm danh & check-in";
      default:
        return "Bảng điều khiển";
    }
  }, [current]);

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Paper
          elevation={0}
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 2, md: 2.75 },
            borderRadius: 3,
            border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
            backgroundImage: (t) =>
              t.palette.mode === "light"
                ? "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,255,0.92) 100%)"
                : "linear-gradient(180deg, rgba(22,30,48,0.9) 0%, rgba(19,24,40,0.9) 100%)",
          }}
        >
          <Stack spacing={1.5}>
            <Breadcrumbs separator="·" aria-label="breadcrumb">
              <Typography component={Link} to="/organizer" color="text.secondary" sx={{ textDecoration: "none" }}>
                Organizer
              </Typography>
              <Typography color="text.primary">{pageTitle}</Typography>
            </Breadcrumbs>

            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Stack spacing={0.75}>
                <Typography variant="h5" fontWeight={700}>
                  {pageTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
                  Tất cả công cụ quản lý sự kiện của bạn ở cùng một nơi: cập nhật tiến độ, xuất báo cáo và điều phối đội
                  ngũ.
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.25} alignItems="center">
                <Button
                  component={Link}
                  to="/organizer/events/new"
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Tạo sự kiện
                </Button>
                <IconButton
                  color="primary"
                  sx={{ borderRadius: 2, border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}` }}
                  onClick={() => navigate(0)}
                  title="Làm mới"
                >
                  <RefreshRoundedIcon />
                </IconButton>
              </Stack>
            </Stack>

            <Tabs
              value={current}
              onChange={(_, value) => {
                const tab = TAB_ITEMS.find((t) => t.key === value);
                if (tab) navigate(tab.to);
              }}
              variant="scrollable"
              allowScrollButtons
              aria-label="Organizer navigation"
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
                <Tab
                  key={tab.key}
                  value={tab.key}
                  label={tab.label}
                  iconPosition="start"
                  icon={
                    tab.key === "events" ? (
                      <CalendarTodayRoundedIcon fontSize="small" />
                    ) : tab.key === "attendance" ? (
                      <QrCodeScannerRoundedIcon fontSize="small" />
                    ) : null
                  }
                />
              ))}
            </Tabs>
          </Stack>
        </Paper>

        <Outlet />
      </Container>
    </Box>
  );
}
