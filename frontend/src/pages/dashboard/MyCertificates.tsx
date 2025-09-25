import { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import { fetchMyCertificates, type Certificate } from "../../features/certificates/certificatesApi";

// Helper functions

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
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMyCertificates();
        setCertificates(data);
      } catch (err: any) {
        setError(err?.message || "Không thể tải chứng nhận");
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: { xs: 4, md: 6 }, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

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

          {certificates.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có chứng nhận nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tham gia các sự kiện để nhận chứng nhận và huy hiệu
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {certificates.map((cert) => {
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
                          {cert.skills.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {cert.skills.map((skill) => (
                                <Chip key={skill} label={skill} size="small" icon={<BookmarkAddedRoundedIcon fontSize="small" />} />
                              ))}
                            </Stack>
                          )}
                        </Stack>
                      </CardContent>
                      <Divider />
                      <CardActions sx={{ px: 3, py: 2 }}>
                        <Tooltip title="Tải ảnh huy hiệu" placement="top" arrow>
                          <Button variant="text" startIcon={<FileDownloadRoundedIcon />} sx={{ borderRadius: 2 }}>
                            Tải huy hiệu
                          </Button>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
