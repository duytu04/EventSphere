import { FormEvent } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

const quickLinks = [
  { label: "Trang chủ", href: "/" },
  { label: "Sự kiện", href: "/events" },
  { label: "Về chúng tôi", href: "/about" },
  { label: "Đăng nhập", href: "/login" },
  { label: "Đăng ký", href: "/signup" },
];

const companyLinks = [
  { label: "Giới thiệu", href: "#" },
  { label: "Tính năng", href: "#" },
  { label: "Bảng giá", href: "#" },
  { label: "Blog", href: "#" },
];

const helpLinks = [
  { label: "Trung tâm hỗ trợ", href: "#" },
  { label: "Điều khoản", href: "#" },
  { label: "Bảo mật", href: "#" },
  { label: "Hướng dẫn tổ chức", href: "#" },
];

const socialLinks = [
  { label: "Facebook", icon: <FacebookRoundedIcon fontSize="small" />, href: "https://facebook.com" },
  { label: "Instagram", icon: <InstagramIcon fontSize="small" />, href: "https://instagram.com" },
  { label: "Twitter", icon: <TwitterIcon fontSize="small" />, href: "https://twitter.com" },
  { label: "YouTube", icon: <YouTubeIcon fontSize="small" />, href: "https://youtube.com" },
  { label: "LinkedIn", icon: <LinkedInIcon fontSize="small" />, href: "https://linkedin.com" },
];

export default function Footer() {
  const theme = useTheme();
  const gradientBg = theme.palette.mode === "light"
    ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${theme.palette.background.default} 100%)`
    : `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.75)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`;

  const dividerColor = alpha(theme.palette.divider, theme.palette.mode === "light" ? 0.5 : 0.3);

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: wire up newsletter integration when backend is ready
  };

  return (
    <Box component="footer" sx={{ mt: { xs: 6, md: 10 }, backgroundImage: gradientBg, borderTop: `1px solid ${dividerColor}` }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid item xs={12} md={3}>
            <Stack spacing={2.5}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      fontSize: 20,
                    }}
                  >
                    ES
                  </Box>
                  <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      EventSphere
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nền tảng quản lý sự kiện toàn diện dành cho nhà tổ chức hiện đại.
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Stack direction="row" spacing={1.5}>
                {socialLinks.map((item) => (
                  <IconButton
                    key={item.label}
                    component="a"
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${dividerColor}`,
                      color: "text.secondary",
                      transition: "all .25s ease",
                      '&:hover': {
                        color: theme.palette.primary.main,
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                ))}
              </Stack>

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <EmailRoundedIcon fontSize="small" />
                  <Typography variant="body2">tmtd@eventsphere.com</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <PhoneRoundedIcon fontSize="small" />
                  <Typography variant="body2">(+84) 28 1234 5678</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <LocationOnRoundedIcon fontSize="small" />
                  <Typography variant="body2">FPT APTECH, HÀ NỘI</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Khám phá
              </Typography>
              <Stack spacing={1}>
                {quickLinks.map((link) => (
                  <MuiLink
                    key={link.label}
                    component={RouterLink}
                    to={link.href}
                    color="text.secondary"
                    underline="none"
                    sx={{
                      fontSize: 14,
                      '&:hover': { color: theme.palette.primary.main },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Công ty
              </Typography>
              <Stack spacing={1}>
                {companyLinks.map((link) => (
                  <MuiLink
                    key={link.label}
                    href={link.href}
                    color="text.secondary"
                    underline="none"
                    sx={{ fontSize: 14, '&:hover': { color: theme.palette.primary.main } }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                Hỗ trợ
              </Typography>
              <Stack spacing={1}>
                {helpLinks.map((link) => (
                  <MuiLink
                    key={link.label}
                    href={link.href}
                    color="text.secondary"
                    underline="none"
                    sx={{ fontSize: 14, '&:hover': { color: theme.palette.primary.main } }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={2.5}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  Nhận bản tin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cập nhật xu hướng sự kiện, mẹo tổ chức và ưu đãi dành riêng cho bạn.
                </Typography>
              </Stack>

              <Box component="form" noValidate onSubmit={handleNewsletterSubmit}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    type="email"
                    name="email"
                    required
                    placeholder="Email của bạn"
                    size="small"
                    fullWidth
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "light" ? 0.9 : 0.4),
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    sx={{
                      px: 3.5,
                      borderRadius: 2,
                      minWidth: 120,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Đăng ký
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 4, md: 6 }, borderColor: dividerColor }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} EventSphere. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <MuiLink href="#" color="text.secondary" underline="hover" sx={{ fontSize: 13 }}>
              Quyền riêng tư
            </MuiLink>
            <MuiLink href="#" color="text.secondary" underline="hover" sx={{ fontSize: 13 }}>
              Điều khoản dịch vụ
            </MuiLink>
            <MuiLink href="#" color="text.secondary" underline="hover" sx={{ fontSize: 13 }}>
              Chính sách cookie
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
