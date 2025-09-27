





import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Breadcrumbs,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Paper,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import BadgeIcon from "@mui/icons-material/Badge";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import { useMemo, useState, KeyboardEvent } from "react";

type TabKey = "dashboard" | "events" | "organizers" | "users" | "edit-requests";

const TAB_ITEMS: Array<{
  key: TabKey;
  label: string;
  icon: React.ReactElement;
  to: string;
  match: (path: string) => boolean;
}> = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    to: "/admin",
    match: (p) => p === "/admin" || p === "/admin/",
  },
  {
    key: "events",
    label: "Events",
    icon: <EventIcon fontSize="small" />,
    to: "/admin/events",
    match: (p) => p.startsWith("/admin/events"),
  },
  {
    key: "organizers",
    label: "Organizers",
    icon: <GroupsIcon fontSize="small" />,
    to: "/admin/organizers",
    match: (p) => p.startsWith("/admin/organizers"),
  },
  {
    key: "users",
    label: "Users",
    icon: <BadgeIcon fontSize="small" />,
    to: "/admin/users",
    match: (p) => p.startsWith("/admin/users"),
  },
  {
    key: "edit-requests",
    label: "Edit Requests",
    icon: <EditIcon fontSize="small" />,
    to: "/admin/edit-requests",
    match: (p) => p.startsWith("/admin/edit-requests"),
  },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isNarrow = useMediaQuery("(max-width:900px)");
  const [q, setQ] = useState("");

  const current: TabKey = useMemo(() => {
    const hit = TAB_ITEMS.find((t) => t.match(pathname));
    return hit?.key ?? "dashboard";
  }, [pathname]);

  const pageTitle = useMemo(() => {
    switch (current) {
      case "events":
        return "Events Management";
      case "organizers":
        return "Organizer Management";
      case "users":
        return "User Management";
      case "edit-requests":
        return "Event Edit Requests";
      default:
        return "Admin Dashboard";
    }
  }, [current]);

  const crumbs = useMemo(() => {
    // Breadcrumb “thông minh nhẹ”: Admin / Current
    const currentLabel = TAB_ITEMS.find((t) => t.key === current)?.label ?? "Dashboard";
    return [
      { label: "Admin", to: "/admin" },
      { label: currentLabel, to: TAB_ITEMS.find((t) => t.key === current)?.to ?? "/admin" },
    ];
  }, [current]);

  const handleTabChange = (_: any, value: TabKey) => {
    const tab = TAB_ITEMS.find((t) => t.key === value);
    if (tab) navigate(tab.to);
  };

  const handleSearchSubmit = () => {
    // tuỳ tab mà điều hướng/dispatch action phù hợp
    // ví dụ: /admin/events?q=..., hoặc dùng state manager
    const base = TAB_ITEMS.find((t) => t.key === current)?.to ?? "/admin";
    const url = q ? `${base}?q=${encodeURIComponent(q)}` : base;
    navigate(url);
  };

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearchSubmit();
  };

  // Quick actions thay đổi theo tab (gợi ý nút “Create” & “Refresh”)
  const quickActions = (
    <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
      <IconButton
        size={isNarrow ? "small" : "medium"}
        title="Refresh"
        aria-label="Refresh"
        onClick={() => {
          // gợi ý: phát event “admin:refresh” hoặc dùng queryClient.invalidateQueries(...)
          window.dispatchEvent(new CustomEvent("admin:refresh", { detail: { scope: current } }));
        }}
      >
        <RefreshIcon />
      </IconButton>

      {/* Tuỳ tab: ví dụ chỉ show Create trên events/users/organizers */}
      {current !== "dashboard" && (
        <IconButton
          size={isNarrow ? "small" : "medium"}
          color="primary"
          title={`Create ${current.slice(0, 1).toUpperCase() + current.slice(1)}`}
          aria-label="Create"
          onClick={() => {
            // điều hướng đến trang tạo tương ứng
            if (current === "events") navigate("/admin/events?create=1");
            if (current === "users") navigate("/admin/users?create=1");
            if (current === "organizers") navigate("/admin/organizers?create=1");
          }}
        >
          <AddIcon />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <Container sx={{ py: 3 }}>
      {/* Header sticky gồm Breadcrumb + Title */}
      <Box
        component={Paper}
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (t) => t.zIndex.appBar + 1,
          bgcolor: "background.default",
          pt: 1, pb: 1, mb: 1,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 0,
        }}
      >
        <Breadcrumbs aria-label="breadcrumb" sx={{ px: 2, mb: 0.5 }}>
          {crumbs.map((c, i) =>
            i < crumbs.length - 1 ? (
              <Typography
                key={c.label}
                component={Link}
                to={c.to}
                color="text.secondary"
                style={{ textDecoration: "none" }}
              >
                {c.label}
              </Typography>
            ) : (
              <Typography key={c.label} color="text.primary">{c.label}</Typography>
            )
          )}
        </Breadcrumbs>

        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ px: 2, gap: 1 }}
        >
          <Typography variant={isNarrow ? "h6" : "h5"}>{pageTitle}</Typography>

          {/* Thanh tìm kiếm + quick actions */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
            <TextField
              size="small"
              placeholder={`Search ${current}...`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onSearchKeyDown}
              sx={{ width: { xs: "100%", md: 280 } }}
              InputProps={{
                "aria-label": "Search",
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="Search" onClick={handleSearchSubmit}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {quickActions}
          </Stack>
        </Stack>
      </Box>

      {/* Tabs sticky ngay dưới header */}
      <Box
        component={Paper}
        elevation={0}
        sx={{
          position: "sticky",
          top: (t) => (t.spacing ? 64 : 64), // tránh che bởi app bar lớn; có thể tinh chỉnh
          zIndex: (t) => t.zIndex.appBar,
          bgcolor: "background.paper",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          mb: 2,
        }}
      >
        <Tabs
          value={current}
          onChange={handleTabChange}
          aria-label="Admin navigation tabs"
          variant="scrollable"
          allowScrollButtons
          TabIndicatorProps={{ sx: { height: 3 } }}
          sx={{
            px: 1,
            "& .MuiTab-root": {
              textTransform: "none",
              minHeight: 48,
            },
            "& .MuiTab-root.Mui-selected": {
              fontWeight: 600,
            },
            "& .MuiTabs-scrollButtons.Mui-disabled": { opacity: 0.3 },
          }}
        >
          {TAB_ITEMS.map((t) => (
            <Tab
              key={t.key}
              value={t.key}
              label={t.label}
              icon={t.icon}
              iconPosition="start"
              component={Link}
              to={t.to}
              aria-controls={`panel-${t.key}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(t.to);
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Nội dung trang con */}
      <Outlet />
    </Container>
  );
}
