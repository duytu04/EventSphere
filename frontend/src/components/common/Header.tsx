import { useContext, useMemo, useState, useEffect, MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Container,
  Divider,
  IconButton,
  Popover,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { ColorModeCtx } from "../../theme/theme";
import { useAuth } from "../../features/auth/useAuth";

export default function Header() {
  const theme = useTheme();
  const location = useLocation();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, toggle } = useContext(ColorModeCtx);
  const { token, profile, signout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const accountOpen = Boolean(anchorEl);
  const popoverId = accountOpen ? "account-popover" : undefined;
  const popoverTitleId = accountOpen ? "account-popover-title" : undefined;

  const roleList = profile?.roles ?? [];
  const isAdmin = roleList.includes("ADMIN");
  const isOrganizer = roleList.includes("ORGANIZER");

  const displayName = profile?.fullName || profile?.email || "Khách";
  const displayEmail = profile?.email || "";
  const avatarInitial = profile?.fullName?.[0] || profile?.email?.[0];

  useEffect(() => {
    setAnchorEl(null);
  }, [location.pathname]);

  const navLinks = useMemo(() => {
    const base = [
      { label: "Trang chủ", to: "/" },
      { label: "Sự kiện", to: "/events" },
      { label: "Về chúng tôi", to: "/about" },
    ];

    if (token) {
      base.push({ label: "Đăng ký của tôi", to: isAdmin ? "/admin" : isOrganizer ? "/organizer" : "/dashboard" });
    }

    return base;
  }, [token, isAdmin]);

  const handleAvatarClick = (event: ReactMouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    const target = event.target as Node;
    if (anchorEl && anchorEl.contains(target)) {
      return;
    }
    handlePopoverClose();
  };

  const handleSignOut = () => {
    handlePopoverClose();
    signout();
  };

  const adminDashboardPath = "/admin";
  const organizerDashboardPath = "/organizer";
  const accountSettingsPath = isAdmin
    ? "/admin/settings"
    : isOrganizer
    ? "/organizer/settings"
    : "/dashboard/settings";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        background: alpha(theme.palette.background.default, mode === "light" ? 0.85 : 0.75),
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1.5, gap: isSmall ? 1 : 2 }}>
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            component={Link}
            to="/"
            sx={{ textDecoration: "none" }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: alpha(theme.palette.primary.main, 0.18),
                color: theme.palette.primary.main,
              }}
            >
              <BoltRoundedIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                EventSphere
              </Typography>
              {!isSmall && (
                <Typography variant="caption" color="text.secondary">
                  Elevate every experience
                </Typography>
              )}
            </Box>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          {!isSmall && (
            <Stack direction="row" spacing={1.5} component="nav" sx={{ mr: 2 }}>
              {navLinks.map((link) => {
                const active =
                  location.pathname === link.to ||
                  (link.to !== "/" && location.pathname.startsWith(link.to));
                return (
                  <Button
                    key={link.to}
                    component={Link}
                    to={link.to}
                    color={active ? "primary" : "inherit"}
                    variant={active ? "contained" : "text"}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      fontWeight: active ? 600 : 500,
                      px: 2.5,
                      py: 1,
                      backgroundColor: active
                        ? alpha(theme.palette.primary.main, 0.12)
                        : "transparent",
                      '&:hover': {
                        backgroundColor: active
                          ? alpha(theme.palette.primary.main, 0.18)
                          : alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Stack>
          )}

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title={`Chuyển sang chế độ ${mode === "light" ? "tối" : "sáng"}`}>
              <IconButton
                onClick={toggle}
                size="small"
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  backdropFilter: "blur(8px)",
                  color: "text.primary",
                }}
              >
                {mode === "light" ? (
                  <DarkModeRoundedIcon fontSize="small" />
                ) : (
                  <LightModeRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {!token && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  component={Link}
                  to="/login"
                  size="small"
                  color="inherit"
                  sx={{ fontWeight: 500 }}
                >
                  Đăng nhập
                </Button>
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  size="medium"
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    boxShadow: "0 10px 24px rgba(91, 124, 250, 0.25)",
                  }}
                >
                  Đăng ký
                </Button>
              </Stack>
            )}

            <Tooltip title={token ? displayName : "Tài khoản"}>
              <IconButton
                onClick={handleAvatarClick}
                size="small"
                sx={{ p: 0 }}
                aria-describedby={popoverId}
                aria-haspopup="dialog"
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: token
                      ? alpha(theme.palette.primary.main, 0.18)
                      : alpha(theme.palette.text.primary, 0.1),
                    color: token ? theme.palette.primary.main : theme.palette.text.secondary,
                    fontWeight: 600,
                  }}
                >
                  {token && avatarInitial ? avatarInitial.toUpperCase() : <PersonRoundedIcon fontSize="small" />}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Popover
              id={popoverId}
              open={accountOpen}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              disableAutoFocus
              disableEnforceFocus
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 320,
                  borderRadius: 2,
                  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.18)",
                  overflow: "visible",
                  p: 0,
                },
              }}
            >
              <ClickAwayListener onClickAway={handleClickAway}>
                <Box role="dialog" aria-labelledby={popoverTitleId} sx={{ p: 0, outline: "none" }}>
                  {token ? (
                    <Box sx={{ px: 3, py: 3 }}>
                      <Stack spacing={0.75}>
                        <Typography id={popoverTitleId} variant="subtitle1" fontWeight={600}>
                          Xin chào, {displayName}
                        </Typography>
                        {displayEmail ? (
                          <Typography variant="body2" color="text.secondary">
                            {displayEmail}
                          </Typography>
                        ) : null}
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Stack spacing={1}>
                        {isAdmin && (
                          <Button
                            component={Link}
                            to={adminDashboardPath}
                            onClick={handlePopoverClose}
                            startIcon={<DashboardRoundedIcon fontSize="small" />}
                            size="medium"
                            sx={{
                              justifyContent: "flex-start",
                              borderRadius: 1.5,
                              px: 1.5,
                              py: 1,
                              color: "text.primary",
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              },
                            }}
                          >
                            Bảng điều khiển Admin
                          </Button>
                        )}
                        {isOrganizer && (
                          <Button
                            component={Link}
                            to={organizerDashboardPath}
                            onClick={handlePopoverClose}
                            startIcon={<EventAvailableRoundedIcon fontSize="small" />}
                            size="medium"
                            sx={{
                              justifyContent: "flex-start",
                              borderRadius: 1.5,
                              px: 1.5,
                              py: 1,
                              color: "text.primary",
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              },
                            }}
                          >
                            Trang tổ chức
                          </Button>
                        )}
                        <Button
                          component={Link}
                          to={accountSettingsPath}
                          onClick={handlePopoverClose}
                          startIcon={<SettingsRoundedIcon fontSize="small" />}
                          size="medium"
                          sx={{
                            justifyContent: "flex-start",
                            borderRadius: 1.5,
                            px: 1.5,
                            py: 1,
                            color: "text.primary",
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            },
                          }}
                        >
                          Cài đặt tài khoản
                        </Button>
                        <Button
                          onClick={handleSignOut}
                          startIcon={<LogoutRoundedIcon fontSize="small" />}
                          size="medium"
                          sx={{
                            justifyContent: "flex-start",
                            borderRadius: 1.5,
                            px: 1.5,
                            py: 1,
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.08),
                            },
                          }}
                        >
                          Đăng xuất
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ px: 3, py: 3 }}>
                      <Stack spacing={1.75}>
                        <Stack spacing={0.5}>
                          <Typography id={popoverTitleId} variant="subtitle1" fontWeight={600}>
                            Chào mừng bạn đến EventSphere
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Đăng nhập hoặc tạo tài khoản để quản lý và đặt chỗ sự kiện.
                          </Typography>
                        </Stack>
                        <Stack spacing={1}>
                          <Button
                            component={Link}
                            to="/login"
                            variant="outlined"
                            size="medium"
                            startIcon={<LoginRoundedIcon fontSize="small" />}
                            onClick={handlePopoverClose}
                            sx={{ borderRadius: 1.5 }}
                          >
                            Đăng nhập
                          </Button>
                          <Button
                            component={Link}
                            to="/dashboard"
                            variant="contained"
                            size="medium"
                            onClick={handlePopoverClose}
                            sx={{ borderRadius: 1.5 }}
                          >
                            Tạo tài khoản mới
                          </Button>
                        </Stack>
                        
                        {/* Mobile Navigation Links */}
                        {isSmall && (
                          <>
                            <Divider sx={{ my: 1 }} />
                            <Stack spacing={1}>
                              {navLinks.map((link) => {
                                const active = location.pathname === link.to || (link.to !== "/" && location.pathname.startsWith(link.to));
                                return (
                                  <Button
                                    key={link.to}
                                    component={Link}
                                    to={link.to}
                                    onClick={handlePopoverClose}
                                    size="medium"
                                    sx={{
                                      justifyContent: "flex-start",
                                      borderRadius: 1.5,
                                      px: 1.5,
                                      py: 1,
                                      color: active ? "primary.main" : "text.primary",
                                      backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                                      '&:hover': {
                                        backgroundColor: active
                                          ? alpha(theme.palette.primary.main, 0.12)
                                          : alpha(theme.palette.primary.main, 0.08),
                                      },
                                    }}
                                  >
                                    {link.label}
                                  </Button>
                                );
                              })}
                            </Stack>
                          </>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Popover>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}


