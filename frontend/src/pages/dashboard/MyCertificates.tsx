import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";

type CertificateStatus = "VALID" | "EXPIRED" | "IN_PROGRESS";

type Certificate = {
  id: string;
  title: string;
  eventName: string;
  issueDate: string;
  expirationDate?: string;
  credentialId: string;
  status: CertificateStatus;
  skills: string[];
};

const CERTIFICATES: Certificate[] = [
  {
    id: "CERT-9087",
    title: "Chứng nhận hoàn thành Workshop UX",
    eventName: "Workshop: Thiết kế trải nghiệm người dùng",
    issueDate: "2025-11-04",
    credentialId: "UX-2025-9087",
    status: "VALID",
    skills: ["User Research", "Wireframing", "Design Sprint"],
  },
  {
    id: "CERT-8844",
    title: "Giấy chứng nhận diễn giả Tech Innovators",
    eventName: "Tech Innovators Summit 2025",
    issueDate: "2025-10-12",
    credentialId: "SPEAKER-2025-8844",
    status: "VALID",
    skills: ["Public Speaking", "Innovation", "Leadership"],
  },
  {
    id: "CERT-7710",
    title: "Chứng nhận tham dự Music & Art Night",
    eventName: "Music & Art Night",
    issueDate: "2024-08-15",
    expirationDate: "2025-08-15",
    credentialId: "ART-7710",
    status: "EXPIRED",
    skills: ["Community", "Creative Culture"],
  },
];

function formatDate(date?: string) {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function statusChip(status: CertificateStatus) {
  switch (status) {
    case "VALID":
      return { label: "Có hiệu lực", color: "success" as const };
    case "EXPIRED":
      return { label: "Hết hạn", color: "default" as const };
    default:
      return { label: "Đang xử lý", color: "warning" as const };
  }
}

export default function MyCertificates() {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              Chứng nhận & huy hiệu
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tất cả chứng nhận số bạn nhận được khi tham gia sự kiện và workshop trong hệ sinh thái EventSphere.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {CERTIFICATES.map((cert) => {
              const chip = statusChip(cert.status);
              return (
                <Grid key={cert.id} item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, height: "100%" }}>
                    <CardHeader
                      avatar={
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <WorkspacePremiumRoundedIcon />
                        </Box>
                      }
                      title={<Typography variant="h6" fontWeight={700}>{cert.title}</Typography>}
                      subheader={<Typography variant="body2" color="text.secondary">{cert.eventName}</Typography>}
                      action={<Chip label={chip.label} color={chip.color} variant={chip.color === "default" ? "outlined" : "filled"} />}
                    />
                    <Divider />
                    <CardContent>
                      <Stack spacing={2.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center" color="text.secondary">
                          <CalendarMonthRoundedIcon fontSize="small" />
                          <Typography variant="body2">
                            Cấp ngày {formatDate(cert.issueDate)}
                            {cert.expirationDate ? ` • Hết hạn ${formatDate(cert.expirationDate)}` : ""}
                          </Typography>
                        </Stack>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Credential ID
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {cert.credentialId}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {cert.skills.map((skill) => (
                            <Chip key={skill} label={skill} size="small" icon={<BookmarkAddedRoundedIcon fontSize="small" />} />
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ px: 3, py: 2 }}>
                      <Tooltip title="Mở trang xác thực" placement="top" arrow>
                        <span>
                          <Button variant="contained" startIcon={<ShareRoundedIcon />} sx={{ borderRadius: 2 }}>
                            Chia sẻ QR
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title="Tải bản PDF chứng nhận" placement="top" arrow>
                        <span>
                          <Button variant="outlined" startIcon={<PictureAsPdfRoundedIcon />} sx={{ borderRadius: 2 }}>
                            Xuất PDF
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip title="Tải ảnh huy hiệu" placement="top" arrow>
                        <span>
                          <Button variant="text" startIcon={<FileDownloadRoundedIcon />} sx={{ borderRadius: 2 }}>
                            Tải huy hiệu
                          </Button>
                        </span>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
